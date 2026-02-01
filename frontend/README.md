# Frontend Setup Instructions

## Prerequisites
- Node.js installed (version 16 or higher)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

This will install:
- React
- Vite
- Tailwind CSS
- Axios
- All other dependencies

### 2. Run Development Server
```bash
npm run dev
```

The app will start at: **http://localhost:3000**

### 3. Build for Production (OPTIONAL)
```bash
npm run build
```

This creates optimized files in the `dist/` folder.

## File Structure

```
frontend/
├── src/
│   ├── App.jsx         # Main component (upload + results)
│   ├── main.jsx        # React entry point
│   ├── index.css       # Tailwind CSS + global styles
│   └── App.css         # Component-specific styles
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── postcss.config.js   # PostCSS configuration
```

## How It Works

1. **Upload:** User selects PDF or DOCX file
2. **Validate:** Check file type (only PDF/DOCX allowed)
3. **Send:** POST request to backend at `http://localhost:8000/upload`
4. **Display:** Show results in cards with risk badges

## Customization

### Change Backend URL
Edit `src/App.jsx`:
```javascript
const API_URL = 'http://localhost:8000'  // Change this
```

### Change Port
Edit `vite.config.js`:
```javascript
server: {
  port: 3000  // Change to any port
}
```

### Modify Colors
Edit `tailwind.config.js` or use Tailwind classes in `App.jsx`

## Troubleshooting

**npm install fails:**
```bash
npm install --legacy-peer-deps
```

**Port already in use:**
- Change port in `vite.config.js`

**CORS errors:**
- Make sure backend is running
- Check backend CORS settings in `backend/main.py`

**Blank page:**
- Check browser console for errors
- Make sure all dependencies installed
- Try `npm run dev` again
