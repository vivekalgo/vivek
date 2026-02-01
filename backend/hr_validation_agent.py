"""
HR Contract Validation Agent
Validates employment contracts against Indian laws
Completely separate from existing RAG agent
"""

import re
from typing import Dict, List, Optional

class HRValidationAgent:
    """
    Dedicated agent for validating HR/employment contracts against Indian laws.
    Provides clause-by-clause analysis and missing clause detection.
    """
    
    def __init__(self):
        """Initialize HR validation agent with Indian law knowledge."""
        print("[INIT] Initializing HR Contract Validation Agent...")
        self.indian_labour_laws = self._load_labour_law_knowledge()
        self.mandatory_clauses = self._define_mandatory_clauses()
        print(f"[OK] HR Validation Agent ready with {len(self.indian_labour_laws)} law rules")
    
    def _load_labour_law_knowledge(self) -> Dict:
        """
        Load Indian labour law rules for contract validation.
        Returns dict mapping clause types to validation rules.
        """
        return {
            "non_compete": {
                "law": "Indian Contract Act Section 27",
                "rule": "Restraint of trade is void in India. Non-compete clauses are generally unenforceable.",
                "valid_conditions": "Only valid during employment, not post-termination",
                "max_duration": "0 months post-termination",
                "status": "INVALID" if "post" in "post-termination" else "RISKY"
            },
            "notice_period": {
                "law": "Industrial Disputes Act, 1947",
                "rule": "Notice period must be reasonable and mutual",
                "valid_conditions": "Should be same for both employer and employee",
                "max_duration": "3 months is reasonable",
                "status": "VALID"
            },
            "termination": {
                "law": "Industrial Employment Act",
                "rule": "Termination must follow due process",
                "valid_conditions": "Must provide notice or pay in lieu",
                "status": "VALID"
            },
            "salary_payment": {
                "law": "Payment of Wages Act, 1936",
                "rule": "Wages must be paid on time, deductions must be lawful",
                "valid_conditions": "Monthly payment, no arbitrary deductions",
                "status": "VALID"
            },
            "working_hours": {
                "law": "Factories Act, 1948 / Shops and Establishments Act",
                "rule": "Maximum 48 hours per week, 9 hours per day",
                "valid_conditions": "Overtime must be compensated",
                "status": "VALID"
            },
            "ip_ownership": {
                "law": "Copyright Act, 1957",
                "rule": "Work created during employment belongs to employer",
                "valid_conditions": "Only for work-related creations during work hours",
                "status": "VALID"
            },
            "confidentiality": {
                "law": "Indian Contract Act Section 27",
                "rule": "Confidentiality clauses are valid",
                "valid_conditions": "Must be reasonable in scope and duration",
                "status": "VALID"
            },
            "penalty_clause": {
                "law": "Indian Contract Act Section 74",
                "rule": "Penalty clauses must be reasonable compensation, not punishment",
                "valid_conditions": "Amount must be proportionate to actual loss",
                "status": "RISKY"
            },
            "jurisdiction": {
                "law": "Code of Civil Procedure, 1908",
                "rule": "Jurisdiction must be specified",
                "valid_conditions": "Should be Indian courts",
                "status": "VALID"
            },
            "probation": {
                "law": "Industrial Employment Act",
                "rule": "Probation period is valid",
                "valid_conditions": "Typically 3-6 months, max 1 year",
                "status": "VALID"
            },
            "data_protection": {
                "law": "Information Technology Act, 2000 (SPDI Rules)",
                "rule": "Must handle sensitive personal data with consent",
                "valid_conditions": "Requires clear privacy policy and consent mechanism",
                "status": "VALID"
            }
        }
    
    def _define_mandatory_clauses(self) -> List[Dict]:
        """Define mandatory clauses for Indian employment contracts."""
        return [
            {
                "type": "governing_law",
                "title": "Governing Law",
                "required": True,
                "reason": "Must specify Indian laws govern the contract"
            },
            {
                "type": "jurisdiction",
                "title": "Jurisdiction",
                "required": True,
                "reason": "Must specify which Indian courts have jurisdiction"
            },
            {
                "type": "dispute_resolution",
                "title": "Dispute Resolution / Arbitration",
                "required": True,
                "reason": "Required under Arbitration and Conciliation Act, 1996"
            },
            {
                "type": "confidentiality",
                "title": "Confidentiality",
                "required": False,
                "reason": "Recommended for protecting business information"
            },
            {
                "type": "ip_ownership",
                "title": "Intellectual Property Ownership",
                "required": False,
                "reason": "Clarifies ownership of work created during employment"
            },
            {
                "type": "termination_clause",
                "title": "Termination Clause",
                "required": True,
                "reason": "Must specify notice period and termination conditions"
            },
            {
                "type": "data_protection",
                "title": "Data Protection / Privacy",
                "required": False,
                "reason": "Required under IT Act if collecting sensitive personal data"
            }
        ]
    
    def validate_contract(self, clauses: List[str]) -> Dict:
        """
        Validate entire contract clause by clause.
        
        Args:
            clauses: List of contract clauses
            
        Returns:
            Dict with validation results, compliance score, and missing clauses
        """
        print(f"[VALIDATE] Analyzing {len(clauses)} clauses...")
        
        clause_results = []
        for i, clause in enumerate(clauses, 1):
            result = self.validate_clause(clause, i)
            clause_results.append(result)
        
        # Detect missing clauses
        missing_clauses = self.detect_missing_clauses(clauses)
        
        # Calculate compliance score
        compliance_score = self.calculate_compliance_score(clause_results)
        
        # Determine overall risk level
        risk_level = self._determine_risk_level(clause_results, compliance_score)
        
        return {
            "total_clauses": len(clauses),
            "clause_results": clause_results,
            "missing_clauses": missing_clauses,
            "compliance_score": compliance_score,
            "risk_level": risk_level,
            "summary": self._generate_summary(clause_results, missing_clauses, compliance_score)
        }
    
    def validate_clause(self, clause: str, clause_number: int) -> Dict:
        """
        Validate a single clause against Indian laws.
        
        Args:
            clause: The clause text
            clause_number: Clause number in contract
            
        Returns:
            Dict with validation result
        """
        clause_lower = clause.lower()
        
        # Detect clause type
        clause_type = self._detect_clause_type(clause_lower)
        
        # Get validation rules
        if clause_type in self.indian_labour_laws:
            law_info = self.indian_labour_laws[clause_type]
            
            # Validate against rules
            status, reason, suggestion = self._validate_against_rules(
                clause, clause_lower, clause_type, law_info
            )
        else:
            # Generic clause
            status = "VALID"
            reason = "Standard clause, no specific Indian law concerns"
            suggestion = None
            law_info = {"law": "General Contract Law"}
        
        return {
            "clause_number": clause_number,
            "clause_text": clause[:200] + "..." if len(clause) > 200 else clause,
            "clause_type": clause_type.replace("_", " ").title(),
            "status": status,  # VALID, RISKY, INVALID
            "reason": reason,
            "indian_law": law_info.get("law", "N/A"),
            "suggestion": suggestion
        }
    
    def _detect_clause_type(self, clause_lower: str) -> str:
        """Detect the type of clause based on keywords."""
        if any(word in clause_lower for word in ["non-compete", "non compete", "restraint of trade", "competing"]):
            return "non_compete"
        elif any(word in clause_lower for word in ["notice period", "notice", "resignation"]):
            return "notice_period"
        elif any(word in clause_lower for word in ["termination", "terminate", "dismissal"]):
            return "termination"
        elif any(word in clause_lower for word in ["salary", "wages", "payment", "compensation"]):
            return "salary_payment"
        elif any(word in clause_lower for word in ["working hours", "work hours", "overtime"]):
            return "working_hours"
        elif any(word in clause_lower for word in ["intellectual property", "ip", "copyright", "patent"]):
            return "ip_ownership"
        elif any(word in clause_lower for word in ["confidential", "nda", "proprietary", "trade secret"]):
            return "confidentiality"
        elif any(word in clause_lower for word in ["penalty", "liquidated damages", "forfeit"]):
            return "penalty_clause"
        elif any(word in clause_lower for word in ["jurisdiction", "court", "venue"]):
            return "jurisdiction"
        elif any(word in clause_lower for word in ["probation", "probationary"]):
            return "probation"
        elif any(word in clause_lower for word in ["data privacy", "data protection", "personal data", "spdi"]):
            return "data_protection"
        else:
            return "general"
    
    def _validate_against_rules(self, clause: str, clause_lower: str, clause_type: str, law_info: Dict) -> tuple:
        """Validate clause against specific Indian law rules."""
        
        if clause_type == "non_compete":
            # Non-compete clauses are problematic in India
            if "after" in clause_lower or "post" in clause_lower or "termination" in clause_lower:
                return (
                    "INVALID",
                    "Post-employment non-compete clauses are void under Section 27 of Indian Contract Act. Courts in India do not enforce restraint of trade.",
                    "Remove post-employment non-compete restrictions. You can only restrict competition during active employment."
                )
            else:
                return (
                    "RISKY",
                    "Non-compete during employment is valid but must be reasonable in scope.",
                    "Ensure the restriction is limited to direct competition during employment only."
                )
        
        elif clause_type == "penalty_clause":
            # Check if penalty amount is mentioned
            if any(word in clause_lower for word in ["Rs.", "rupees", "inr", "amount"]):
                return (
                    "RISKY",
                    "Under Section 74, penalty clauses must represent genuine pre-estimate of loss, not punishment. Courts may reduce excessive penalties.",
                    "Replace fixed penalty with 'reasonable compensation for actual losses incurred' to comply with Section 74."
                )
            else:
                return ("VALID", "Penalty clause structure is acceptable", None)
        
        elif clause_type == "notice_period":
            # Check if notice period is reasonable
            if "3 month" in clause_lower or "90 day" in clause_lower:
                return ("VALID", "3-month notice period is reasonable under Indian law", None)
            elif "6 month" in clause_lower or "180 day" in clause_lower:
                return (
                    "RISKY",
                    "6-month notice period may be considered excessive. Courts prefer 1-3 months.",
                    "Consider reducing to 3 months or allow payment in lieu of notice."
                )
            else:
                return ("VALID", "Notice period appears reasonable", None)
        
        elif clause_type == "working_hours":
            # Check for excessive hours
            if "48" in clause or "9" in clause:
                return ("VALID", "Working hours comply with Factories Act / Shops Act limits", None)
            elif any(str(h) in clause for h in range(50, 80)):
                return (
                    "INVALID",
                    "Working hours exceed legal limits under Factories Act (48 hours/week, 9 hours/day)",
                    "Reduce to maximum 48 hours per week with overtime compensation for additional hours."
                )
            else:
                return ("VALID", "Working hours clause is acceptable", None)
        
        else:
            # Default validation
            return ("VALID", law_info.get("rule", "Clause appears compliant"), None)
    
    def detect_missing_clauses(self, clauses: List[str]) -> List[Dict]:
        """Detect important clauses missing from the contract."""
        contract_text = " ".join(clauses).lower()
        missing = []
        
        for mandatory in self.mandatory_clauses:
            clause_type = mandatory["type"]
            
            # Check if clause type exists in contract
            found = False
            if clause_type == "governing_law" and "governing law" in contract_text:
                found = True
            elif clause_type == "jurisdiction" and "jurisdiction" in contract_text:
                found = True
            elif clause_type == "dispute_resolution" and ("arbitration" in contract_text or "dispute" in contract_text):
                found = True
            elif clause_type == "confidentiality" and "confidential" in contract_text:
                found = True
            elif clause_type == "ip_ownership" and ("intellectual property" in contract_text or "copyright" in contract_text):
                found = True
            elif clause_type == "termination_clause" and "termination" in contract_text:
                found = True
            
            if not found and mandatory["required"]:
                # Generate compliant clause
                generated_clause = self.generate_compliant_clause(clause_type)
                missing.append({
                    "clause_type": mandatory["title"],
                    "reason": mandatory["reason"],
                    "required": mandatory["required"],
                    "suggested_text": generated_clause
                })
        
        return missing
    
    def generate_compliant_clause(self, clause_type: str) -> str:
        """Generate Indian-law compliant clause text."""
        templates = {
            "governing_law": "This Agreement shall be governed by and construed in accordance with the laws of India.",
            
            "jurisdiction": "The courts at [City Name], India shall have exclusive jurisdiction over any disputes arising out of or in connection with this Agreement.",
            
            "dispute_resolution": "Any dispute arising out of or in connection with this Agreement shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in [City Name], India, and the language of arbitration shall be English.",
            
            "confidentiality": "The Employee agrees to maintain confidentiality of all proprietary and confidential information of the Company during and after the term of employment. This obligation shall survive the termination of this Agreement.",
            
            "ip_ownership": "All intellectual property, including but not limited to inventions, designs, and creative works, developed by the Employee during the course of employment and related to the Company's business shall be the exclusive property of the Company.",
            
            "termination_clause": "Either party may terminate this Agreement by providing [30/60/90] days' written notice to the other party. The Company reserves the right to terminate this Agreement immediately in case of gross misconduct or breach of terms.",
            
            "data_protection": "The Company shall handle the Employee's personal data in accordance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011."
        }
        
        return templates.get(clause_type, "Clause text to be drafted by legal counsel.")
    
    def calculate_compliance_score(self, clause_results: List[Dict]) -> int:
        """Calculate overall compliance score (0-100)."""
        if not clause_results:
            return 0
        
        valid_count = sum(1 for r in clause_results if r["status"] == "VALID")
        risky_count = sum(1 for r in clause_results if r["status"] == "RISKY")
        invalid_count = sum(1 for r in clause_results if r["status"] == "INVALID")
        
        total = len(clause_results)
        
        # Scoring: Valid = 100%, Risky = 50%, Invalid = 0%
        score = ((valid_count * 100) + (risky_count * 50) + (invalid_count * 0)) / total
        
        return int(score)
    
    def _determine_risk_level(self, clause_results: List[Dict], compliance_score: int) -> str:
        """Determine overall risk level."""
        invalid_count = sum(1 for r in clause_results if r["status"] == "INVALID")
        risky_count = sum(1 for r in clause_results if r["status"] == "RISKY")
        
        if invalid_count > 0 or compliance_score < 50:
            return "High Risk"
        elif risky_count > 2 or compliance_score < 75:
            return "Medium Risk"
        else:
            return "Low Risk"
    
    def _generate_summary(self, clause_results: List[Dict], missing_clauses: List[Dict], compliance_score: int) -> str:
        """Generate human-readable summary."""
        valid_count = sum(1 for r in clause_results if r["status"] == "VALID")
        risky_count = sum(1 for r in clause_results if r["status"] == "RISKY")
        invalid_count = sum(1 for r in clause_results if r["status"] == "INVALID")
        
        summary = f"Analyzed {len(clause_results)} clauses. "
        summary += f"{valid_count} valid, {risky_count} risky, {invalid_count} invalid. "
        summary += f"Compliance score: {compliance_score}/100. "
        
        if missing_clauses:
            summary += f"{len(missing_clauses)} important clauses are missing."
        else:
            summary += "All mandatory clauses present."
        
        return summary


# Global instance
hr_validation_agent = None

def get_hr_validation_agent() -> HRValidationAgent:
    """Get or create the global HR validation agent."""
    global hr_validation_agent
    if hr_validation_agent is None:
        hr_validation_agent = HRValidationAgent()
    return hr_validation_agent
