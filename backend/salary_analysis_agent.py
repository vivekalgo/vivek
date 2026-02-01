"""
Salary Analysis Agent for Indian Employment Contracts
Analyzes salary annexures and provides:
1. Salary breakdown (CTC, PF, deductions, in-hand)
2. Comparison with industry standards
3. 7 auto-answers to key questions
4. Legal and ethical assessment
"""

import re
from typing import Dict, List, Optional

class SalaryAnalysisAgent:
    """Agent for analyzing salary components in Indian employment contracts."""
    
    def __init__(self):
        # Standard rates for Indian employment
        self.STANDARD_PF_RATE = 12.0  # 12% employee + 12% employer
        self.STANDARD_ESI_RATE = 0.75  # 0.75% employee (for salary < 21k)
        self.STANDARD_PROFESSIONAL_TAX = 200  # Varies by state, ~200/month average
        
    def analyze_salary_document(self, text: str, ai_model=None) -> Dict:
        """
        Main analysis function.
        
        Args:
            text: Extracted text from salary annexure
            ai_model: Optional AI model for fallback extraction
            
        Returns:
            Complete salary analysis with 7 answers
        """
        # Extract salary components
        ctc_annual = self.extract_ctc(text)
        ctc_monthly = ctc_annual / 12 if ctc_annual else 0
        
        basic_salary = self.extract_basic_salary(text)
        pf_employee = self.extract_pf_employee(text)
        pf_employer = self.extract_pf_employer(text)
        other_deductions = self.extract_other_deductions(text)
        
        # AI Fallback: If critical values are missing, use AI to extract
        if (ctc_annual == 0 or basic_salary == 0) and ai_model:
            print("[INFO] Regex extraction failed, using AI fallback...")
            ai_extracted = self.ai_extract_salary_components(text, ai_model)
            if ctc_annual == 0 and ai_extracted.get('ctc_annual', 0) > 0:
                ctc_annual = ai_extracted['ctc_annual']
                ctc_monthly = ctc_annual / 12
            if basic_salary == 0 and ai_extracted.get('basic_salary', 0) > 0:
                basic_salary = ai_extracted['basic_salary']
            if pf_employee == 0 and ai_extracted.get('pf_employee', 0) > 0:
                pf_employee = ai_extracted['pf_employee']
        
        # Calculate in-hand salary
        in_hand_monthly = self.calculate_in_hand(
            ctc_monthly, basic_salary, pf_employee, other_deductions
        )
        
        # Compare with standards
        comparison = self.compare_with_standards(
            pf_employee, pf_employer, basic_salary, other_deductions
        )
        
        # Generate 7 auto-answers
        seven_answers = self.generate_seven_answers(
            ctc_annual, ctc_monthly, basic_salary, 
            pf_employee, pf_employer, in_hand_monthly, 
            comparison, other_deductions
        )
        
        # Overall verdict
        verdict = self.calculate_verdict(comparison)
        
        return {
            "salary_breakdown": {
                "ctc_annual": ctc_annual,
                "ctc_monthly": ctc_monthly,
                "basic_salary": basic_salary,
                "pf_employee": pf_employee,
                "pf_employer": pf_employer,
                "other_deductions": other_deductions,
                "in_hand_monthly": in_hand_monthly,
                "in_hand_percentage": round((in_hand_monthly / ctc_monthly * 100), 1) if ctc_monthly else 0
            },
            "comparison_stats": comparison,
            "seven_answers": seven_answers,
            "overall_verdict": verdict
        }
    
    def extract_ctc(self, text: str) -> float:
        """Extract CTC from text with improved patterns."""
        patterns = [
            # Standard patterns
            r'ctc[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lakhs|l)?',
            r'cost to company[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'annual ctc[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'total ctc[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            # More flexible patterns
            r'(?:annual|yearly)\s+(?:package|compensation)[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'(?:rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per|/)?\s*(?:annum|year|annually)',
            # Table-like format
            r'ctc\s*[|\t]\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                amount_str = match.group(1).replace(',', '')
                amount = float(amount_str)
                # If in lakhs, convert to actual amount
                if 'lakh' in match.group(0).lower():
                    amount = amount * 100000
                # If amount seems too small (< 1000), assume it's in lakhs
                elif amount < 1000:
                    amount = amount * 100000
                # If amount is reasonable (between 100k and 1 crore)
                if 100000 <= amount <= 10000000:
                    return amount
        
        # Fallback: Look for any large number that could be CTC
        large_numbers = re.findall(r'(?:rs\.?|₹)?\s*(\d{5,7})(?!\d)', text.lower())
        if large_numbers:
            # Return the largest reasonable number
            amounts = [float(n.replace(',', '')) for n in large_numbers]
            amounts = [a for a in amounts if 100000 <= a <= 10000000]
            if amounts:
                return max(amounts)
        
        return 0
    
    def extract_basic_salary(self, text: str) -> float:
        """Extract basic salary from text with improved patterns."""
        patterns = [
            r'basic[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'basic salary[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'basic pay[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            # Table format
            r'basic\s*[|\t]\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                amount = float(match.group(1).replace(',', ''))
                # Basic salary should be reasonable (5k to 5 lakhs per month)
                if 5000 <= amount <= 500000:
                    return amount
        
        return 0
    
    def extract_pf_employee(self, text: str) -> float:
        """Extract employee PF contribution with improved patterns."""
        patterns = [
            r'employee(?:\s+pf|\s+provident fund)[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'pf\s+employee[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'employee contribution[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'pf\s+deduction[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'provident fund[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            # Table format
            r'(?:employee\s+)?pf\s*[|\t]\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                amount = float(match.group(1).replace(',', ''))
                # PF should be reasonable (100 to 50k per month)
                if 100 <= amount <= 50000:
                    return amount
        
        return 0
    
    def extract_pf_employer(self, text: str) -> float:
        """Extract employer PF contribution."""
        patterns = [
            r'employer(?:\s+pf|\s+provident fund)[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'pf\s+employer[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'employer contribution[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return float(match.group(1).replace(',', ''))
        
        return 0
    
    def extract_other_deductions(self, text: str) -> Dict[str, float]:
        """Extract other deductions."""
        deductions = {}
        
        # Professional tax
        pt_match = re.search(r'professional tax[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)', text.lower())
        if pt_match:
            deductions['professional_tax'] = float(pt_match.group(1).replace(',', ''))
        
        # ESI
        esi_match = re.search(r'esi[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)', text.lower())
        if esi_match:
            deductions['esi'] = float(esi_match.group(1).replace(',', ''))
        
        # Admin charges
        admin_match = re.search(r'admin(?:istrative)?\s+(?:charges?|fee)[:\s]+(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)', text.lower())
        if admin_match:
            deductions['admin_charges'] = float(admin_match.group(1).replace(',', ''))
        
        return deductions
    
    def calculate_in_hand(self, ctc_monthly: float, basic: float, pf_employee: float, other_deductions: Dict) -> float:
        """Calculate approximate in-hand salary."""
        if ctc_monthly == 0:
            return 0
        
        total_deductions = pf_employee + sum(other_deductions.values())
        in_hand = ctc_monthly - total_deductions
        
        return round(in_hand, 2)
    
    def compare_with_standards(self, pf_employee: float, pf_employer: float, basic: float, other_deductions: Dict) -> Dict:
        """Compare with industry standards."""
        comparison = {}
        
        # PF comparison
        if basic > 0 and pf_employee > 0:
            pf_rate = (pf_employee / basic) * 100
            comparison['pf_rate'] = round(pf_rate, 2)
            comparison['pf_status'] = 'CORRECT' if abs(pf_rate - self.STANDARD_PF_RATE) < 0.5 else ('HIGH' if pf_rate > self.STANDARD_PF_RATE else 'LOW')
        else:
            comparison['pf_rate'] = 0
            comparison['pf_status'] = 'UNKNOWN'
        
        # Admin charges check
        admin_charges = other_deductions.get('admin_charges', 0)
        if admin_charges > 0:
            comparison['admin_charges'] = admin_charges
            comparison['admin_charges_status'] = 'HIGH' if admin_charges > 500 else 'ACCEPTABLE'
        else:
            comparison['admin_charges'] = 0
            comparison['admin_charges_status'] = 'NONE'
        
        return comparison
    
    def generate_seven_answers(self, ctc_annual: float, ctc_monthly: float, basic: float, 
                               pf_employee: float, pf_employer: float, in_hand_monthly: float,
                               comparison: Dict, other_deductions: Dict) -> Dict:
        """Generate answers to the 7 key questions."""
        
        answers = {}
        
        # 1. Is PF being cut correctly?
        pf_status = comparison.get('pf_status', 'UNKNOWN')
        pf_rate = comparison.get('pf_rate', 0)
        if pf_status == 'CORRECT':
            answers['pf_correct'] = f"✓ YES - Your PF is being cut at {pf_rate}%, which is the standard rate in India (12% employee + 12% employer)."
        elif pf_status == 'HIGH':
            answers['pf_correct'] = f"✗ NO - Your PF is being cut at {pf_rate}%, which is HIGHER than the standard 12%. This is unusual and may be incorrect."
        elif pf_status == 'LOW':
            answers['pf_correct'] = f"⚠ PARTIAL - Your PF is being cut at {pf_rate}%, which is LOWER than the standard 12%. Check if this is intentional."
        else:
            answers['pf_correct'] = "⚠ UNCLEAR - Could not determine PF rate from the document. Please verify with HR."
        
        # 2. Are deductions higher/lower than standard?
        total_deductions = pf_employee + sum(other_deductions.values())
        deduction_percentage = (total_deductions / ctc_monthly * 100) if ctc_monthly else 0
        if deduction_percentage < 15:
            answers['deductions_comparison'] = f"✓ NORMAL - Total deductions are {deduction_percentage:.1f}% of CTC, which is within standard range (12-20%)."
        elif deduction_percentage < 25:
            answers['deductions_comparison'] = f"⚠ SLIGHTLY HIGH - Total deductions are {deduction_percentage:.1f}% of CTC. Standard is 12-20%."
        else:
            answers['deductions_comparison'] = f"✗ HIGH - Total deductions are {deduction_percentage:.1f}% of CTC, which is higher than normal (12-20%)."
        
        # 3. Is employee getting full in-hand or CTC illusion?
        in_hand_percentage = (in_hand_monthly / ctc_monthly * 100) if ctc_monthly else 0
        answers['ctc_vs_inhand'] = f"You get approximately {in_hand_percentage:.1f}% of your CTC as in-hand salary (₹{in_hand_monthly:,.0f} per month from ₹{ctc_monthly:,.0f} CTC). "
        if in_hand_percentage >= 75:
            answers['ctc_vs_inhand'] += "This is GOOD - you're getting a fair in-hand amount."
        elif in_hand_percentage >= 65:
            answers['ctc_vs_inhand'] += "This is AVERAGE - typical for Indian companies."
        else:
            answers['ctc_vs_inhand'] += "This is LOW - you're losing a lot to deductions and employer contributions."
        
        # 4. Is company doing something legally wrong?
        legal_issues = []
        if pf_status == 'HIGH':
            legal_issues.append("PF deduction exceeds statutory limit")
        
        if legal_issues:
            answers['legally_wrong'] = f"⚠ POTENTIAL ISSUES: {', '.join(legal_issues)}. Please consult with HR or a labor law expert."
        else:
            answers['legally_wrong'] = "✓ NO - Based on the document, everything appears to be legally compliant with Indian labor laws."
        
        # 5. Is company doing something legally correct but ethically questionable?
        ethical_issues = []
        admin_charges = other_deductions.get('admin_charges', 0)
        if admin_charges > 500:
            ethical_issues.append(f"High admin charges (₹{admin_charges}/month)")
        if in_hand_percentage < 65:
            ethical_issues.append("Low in-hand percentage compared to CTC")
        
        if ethical_issues:
            answers['ethically_questionable'] = f"⚠ YES - {', '.join(ethical_issues)}. While legal, this reduces your take-home significantly."
        else:
            answers['ethically_questionable'] = "✓ NO - The salary structure appears fair and transparent."
        
        # 6. What should company ideally do?
        suggestions = []
        if admin_charges > 500:
            suggestions.append("Reduce admin charges to ₹200-300/month (industry standard)")
        if in_hand_percentage < 70:
            suggestions.append("Increase basic salary component to improve in-hand percentage")
        
        if suggestions:
            answers['company_should_do'] = "Suggestions: " + "; ".join(suggestions) + "."
        else:
            answers['company_should_do'] = "The current structure is fair. No major changes needed."
        
        # 7. What should employee understand before signing?
        key_points = [
            f"Your CTC is ₹{ctc_annual:,.0f}/year, but you'll receive ~₹{in_hand_monthly:,.0f}/month in hand",
            "CTC includes employer's PF contribution, which you don't receive directly",
            f"Total deductions: ₹{total_deductions:,.0f}/month ({deduction_percentage:.1f}% of CTC)"
        ]
        
        if admin_charges > 0:
            key_points.append(f"Admin charges of ₹{admin_charges}/month are being deducted")
        
        answers['employee_should_know'] = "KEY POINTS: " + " | ".join(key_points) + "."
        
        return answers
    
    
    def ai_extract_salary_components(self, text: str, ai_model) -> Dict:
        """
        Use AI to extract salary components when regex fails.
        
        Args:
            text: Document text
            ai_model: Gemini AI model
            
        Returns:
            Dictionary with extracted values
        """
        try:
            prompt = f"""Extract the following salary information from this document. Return ONLY numbers (no currency symbols, no commas).

Document:
{text[:2000]}

Extract:
1. Annual CTC (in rupees, full amount)
2. Monthly Basic Salary (in rupees)
3. Employee PF Contribution (monthly, in rupees)

Format your response EXACTLY like this:
CTC_ANNUAL: <number>
BASIC_SALARY: <number>
PF_EMPLOYEE: <number>

If you cannot find a value, write 0."""
            
            # Support both raw AI model and Key Manager
            if hasattr(ai_model, 'generate_with_rotation'):
                response = ai_model.generate_with_rotation(prompt)
            else:
                response = ai_model.generate_content(prompt)
                
            if not response:
                print("[WARN] AI extraction returned no response")
                return {}
            
            response_text = response.text
            
            # Parse AI response
            extracted = {}
            
            ctc_match = re.search(r'CTC_ANNUAL:\s*(\d+)', response_text)
            if ctc_match:
                extracted['ctc_annual'] = float(ctc_match.group(1))
            
            basic_match = re.search(r'BASIC_SALARY:\s*(\d+)', response_text)
            if basic_match:
                extracted['basic_salary'] = float(basic_match.group(1))
            
            pf_match = re.search(r'PF_EMPLOYEE:\s*(\d+)', response_text)
            if pf_match:
                extracted['pf_employee'] = float(pf_match.group(1))
            
            print(f"[INFO] AI extracted: {extracted}")
            return extracted
            
        except Exception as e:
            print(f"[ERROR] AI extraction failed: {e}")
            return {}
    
    def calculate_verdict(self, comparison: Dict) -> str:
        """Calculate overall verdict."""
        issues = 0
        
        if comparison.get('pf_status') not in ['CORRECT', 'UNKNOWN']:
            issues += 1
        
        if comparison.get('admin_charges_status') == 'HIGH':
            issues += 1
        
        if issues == 0:
            return "GOOD"
        elif issues == 1:
            return "QUESTIONABLE"
        else:
            return "BAD"


# Global instance
salary_analysis_agent = None

def get_salary_analysis_agent() -> SalaryAnalysisAgent:
    """Get or create the global salary analysis agent."""
    global salary_analysis_agent
    if salary_analysis_agent is None:
        salary_analysis_agent = SalaryAnalysisAgent()
    return salary_analysis_agent
