# 🏆 AI Legal Sentinel - Competition Edition

## Indian Contract Analyzer for Freelancers

> **A competition-ready LegalTech tool that analyzes Indian freelance contracts and detects risky clauses under Indian law**

⚠️ **Disclaimer:** This tool does NOT provide legal advice. It is an educational tool for legal awareness. Always consult a qualified lawyer for legal matters.

---

## 🎯 What's New in Competition Edition

### ✨ Enhanced Features

#### 🔍 **5 Types of Risky Clauses Detected**
1. **Non-Compete Clauses** (Section 27, Indian Contract Act 1872) - Risk Score: 9/10
2. **Unlimited Liability** (Section 23, Indian Contract Act 1872) - Risk Score: 9/10
3. **Penalty Clauses** (Section 74, Indian Contract Act 1872) - Risk Score: 8/10
4. **Unfair Termination** (Industrial Disputes Act 1947) - Risk Score: 6/10
5. **IP Transfer** (Copyright Act 1957 & Patent Act 1970) - Risk Score: 6/10

#### 📊 **Risk Scoring System**
- Each clause gets a risk score from 0-10
- Overall contract risk score calculated automatically
- Color-coded risk levels: 🔴 High (8-10) | 🟡 Medium (5-7) | 🟢 Low (1-4)

#### ✅ **Actionable Guidance**
Every risky clause includes:
- **Why This is Risky:** Plain English explanation
- **What You Can Do:** Numbered list of specific actions
- **Safer Alternative:** Indian law-compliant clause rewrite

#### 🎨 **Professional UI**
- Summary dashboard with 3-card layout
- Enhanced clause cards with all details
- Collapsible sections for better readability
- Educational "Why This Matters" section
- Privacy-first messaging

---

## 📁 Project Structure

```
New folder/
├── backend/
│   ├── main.py              # Enhanced FastAPI with 5 clause types
│   ├── requirements.txt     # Python dependencies
│   └── README.md           # Backend instructions
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Competition-ready React UI
│   │   ├── main.jsx        # React entry point
│   │   ├── index.css       # Tailwind CSS
│   │   └── App.css         # Additional styles
│   ├── index.html          # HTML template
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind configuration
│   └── postcss.config.js   # PostCSS configuration
├── sample-contract.txt      # Test contract with all 5 risky clause types
└── README.md               # This file
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed

### Step 1: Start Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

✅ Backend runs at: **http://localhost:8000**

### Step 2: Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend runs at: **http://localhost:5173**

### Step 3: Open Browser

Go to **http://localhost:5173** and start analyzing contracts!

---

## 🎬 Demo Flow

### 1. Upload Contract
- Click "Choose File"
- Select PDF or DOCX contract
- Click "Analyze Contract"

### 2. View Summary Dashboard
- Total Clauses Analyzed
- Risky Clauses Found
- Overall Risk Score (X/10)

### 3. Review Each Risky Clause
- **Risk Score:** Severity rating
- **Law Reference:** Specific Indian law section
- **Why Risky:** Plain English explanation
- **What You Can Do:** Actionable steps (numbered list)
- **Safer Alternative:** Compliant clause rewrite
- **Original Text:** Collapsible view

---

## 🧪 Testing with Sample Contract

### Create Test PDF

**Option 1: Print to PDF**
1. Open `sample-contract.txt` in Notepad
2. File → Print → Microsoft Print to PDF
3. Save as `sample-contract.pdf`

**Option 2: Create DOCX**
1. Open Microsoft Word
2. Copy content from `sample-contract.txt`
3. Save as `sample-contract.docx`

### Expected Results

The sample contract contains all 5 risky clause types:

| Clause # | Type | Risk Score | Law Reference |
|----------|------|------------|---------------|
| 4 | Non-Compete | 9/10 | Section 27, Contract Act 1872 |
| 3 | IP Transfer | 6/10 | Copyright Act 1957 |
| 7 | Unlimited Liability | 9/10 | Section 23, Contract Act 1872 |

**Overall Risk Score:** ~8.0/10 (High Risk)

---

## 🎤 Competition Demo Script (3 Minutes)

### Opening (30 seconds)
> "AI Legal Sentinel helps Indian freelancers identify risky contract clauses before signing. Legal consultation costs ₹5,000-₹50,000 per contract. Our tool provides first-level legal awareness for free, based on Indian Contract Act 1872."

### Live Demo (90 seconds)
1. **Upload:** Show privacy badge and upload sample contract
2. **Summary:** Point out overall risk score (8/10 - High Risk)
3. **Clause Detail:** Expand non-compete clause
   - Show Section 27 reference
   - Read "What You Can Do" steps
   - Reveal safer alternative clause
4. **Highlight:** 5 clause types, actionable guidance, Indian law focus

### Technical (30 seconds)
> "Built with FastAPI and React. Rule-based detection for transparency. Privacy-first: all processing in-memory, no storage. Production-ready code."

### Impact (30 seconds)
> "This empowers millions of Indian freelancers to understand their rights. It's educational, not just detection. While not legal advice, it helps people ask the right questions and seek help when needed."

---

## 🔍 How It Works

### Backend Flow
1. **Upload:** Receive PDF/DOCX file
2. **Extract:** Use pdfplumber or python-docx to get text
3. **Split:** Break text into individual clauses
4. **Analyze:** Run rule-based detection for 5 clause types
5. **Score:** Calculate risk scores and overall contract risk
6. **Return:** JSON with all details including guidance and rewrites

### Detection Rules

#### Non-Compete (Section 27)
**Keywords:** "non-compete", "restraint of trade", "shall not engage"  
**Risk:** 9/10 - Generally void under Indian law

#### Penalty Clause (Section 74)
**Keywords:** "penalty", "forfeit", "punitive damages"  
**Risk:** 8/10 - Only reasonable compensation allowed

#### Unlimited Liability (Section 23)
**Keywords:** "unlimited liability", "indemnify", "hold harmless"  
**Risk:** 9/10 - Against public policy

#### Unfair Termination
**Keywords:** "terminate without cause", "at will", "no notice"  
**Risk:** 6/10 - Lacks job security

#### IP Transfer
**Keywords:** "intellectual property", "assign", "all rights"  
**Risk:** 6/10 - May be too broad

---

## 📊 Features Implemented

### Backend
✅ 5 clause types (vs 3 in MVP)  
✅ Risk scoring (0-10 scale)  
✅ Overall contract risk calculation  
✅ Actionable "What You Can Do" guidance  
✅ Safer clause rewrites  
✅ Enhanced explanations  
✅ Backward compatible API  

### Frontend
✅ Summary dashboard with 3-card layout  
✅ Overall risk score display  
✅ Enhanced clause cards  
✅ Color-coded risk indicators  
✅ Collapsible sections  
✅ "Why This Matters" educational section  
✅ Privacy-first messaging  
✅ Professional design  

---

## 🏆 Competitive Advantages

### 1. Indian Law Focus
- Not generic US/UK law
- Specific sections: 27, 23, 74
- Relevant to Indian freelancers

### 2. Actionable Guidance
- Not just warnings
- Specific steps to take
- Safer alternatives provided

### 3. Educational Approach
- Explains WHY risky
- Teaches user rights
- Empowers decisions

### 4. Privacy-First
- In-memory processing
- No data storage
- Clearly communicated

### 5. Professional Quality
- Clean, modern UI
- Comprehensive docs
- Production code

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 in use:**
```python
# Edit main.py, last line:
uvicorn.run(app, host="0.0.0.0", port=8001)
```

**Module not found:**
```bash
pip install -r requirements.txt
```

### Frontend Issues

**Port 5173 in use:**
Vite will auto-assign another port

**npm install fails:**
```bash
npm install --legacy-peer-deps
```

**CORS errors:**
- Ensure backend is running on port 8000
- Check browser console for details

---

## 📈 Future Enhancements

### Short-term
- More clause types (payment, jurisdiction)
- Multi-language support (Hindi, Tamil)
- PDF report generation

### Medium-term
- AI/NLP for better detection
- E-signature platform integration
- Mobile app (React Native)

### Long-term
- Lawyer marketplace
- Contract template library
- Industry-specific analysis

---

## 🎓 Judging Criteria Alignment

✅ **Innovation:** First Indian law-focused contract analyzer with actionable guidance  
✅ **Technical:** Modern stack, clean code, privacy-first architecture  
✅ **Impact:** Helps millions of Indian freelancers avoid unfair contracts  
✅ **Execution:** Working demo, professional UI, comprehensive features  
✅ **Presentation:** Clear value prop, impressive demo, educational focus  

---

## 📚 Learning Resources

- [Indian Contract Act, 1872](https://legislative.gov.in/)
- [Copyright Act, 1957](https://copyright.gov.in/)
- [Industrial Disputes Act, 1947](https://labour.gov.in/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)

---

## 🔒 Privacy & Security

- ✅ Files processed in-memory only
- ✅ No database storage
- ✅ No file retention
- ✅ No user tracking
- ✅ No external API calls
- ✅ Complete data privacy

---

## 📧 Questions?

This is a competition-ready LegalTech product built with:
- Deep understanding of Indian law
- Focus on user empowerment
- Professional execution
- Educational approach

**Remember:** This is NOT legal advice. Always consult a qualified lawyer for legal matters.

---

**Built with ❤️ for Indian freelancers**

**Competition Edition - January 2026**
