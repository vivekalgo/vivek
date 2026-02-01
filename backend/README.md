# Backend Setup Instructions

## Step 1: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 2: Run the Server

```bash
python main.py
```

The server will start at: **http://localhost:8000**

## Step 3: Test the API

Open your browser and go to:
- **http://localhost:8000** - Health check
- **http://localhost:8000/docs** - Interactive API documentation (Swagger UI)

## API Endpoints

### POST /upload
Upload a PDF or DOCX contract file for analysis.

**Response:**
```json
{
  "success": true,
  "total_clauses_analyzed": 15,
  "risky_clauses_found": 2,
  "risky_clauses": [
    {
      "clause_text": "...",
      "clause_type": "Non-Compete / Restraint of Trade",
      "risk_level": "High",
      "law_reference": "Section 27, Indian Contract Act, 1872",
      "explanation": "..."
    }
  ],
  "disclaimer": "This tool does not provide legal advice..."
}
```

## Troubleshooting

- **Port already in use**: Change port in main.py (last line)
- **Module not found**: Run `pip install -r requirements.txt` again
- **PDF extraction fails**: Make sure the PDF has selectable text (not scanned images)
