# Team Setup Guide - AI Dating App

## Required Software Versions

### Confirmed Environment (Development Machine)
- **Python**: 3.12.2
- **Node.js**: v22.21.0  
- **npm**: 10.9.4
- **OS**: Linux
- **Git**: Available

### Minimum Requirements for Team Members
- **Python**: 3.10+ (Recommended: 3.12.x)
- **Node.js**: 18.x+ (Recommended: 22.x)
- **npm**: 9.x+
- **Git**: Any recent version

## Quick Environment Check

Run these commands to verify your setup:

```bash
# Check Python
python3 --version
# Expected: Python 3.10+ (we're using 3.12.2)

# Check Node
node --version  
# Expected: v18+ (we're using v22.21.0)

# Check npm
npm --version
# Expected: 9+ (we're using 10.9.4)
```

## Project Structure

```
AIDatingWeb/
├── frontend/              # React app (Node.js 22.21.0, npm 10.9.4)
│   ├── src/
│   ├── package.json
│   └── .env.example
├── backend/              # Python FastAPI (Python 3.12.2)
│   ├── main.py          # Will be created
│   ├── requirements.txt # Will be created
│   ├── app/
│   └── venv/            # Virtual environment
└── memory-bank/          # Documentation
```

## Setup Instructions

### Frontend Setup (Already Working)
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Backend Setup (To Be Created)
```bash
cd backend
# Follow BACKEND_SETUP.md for detailed instructions
```

#### Python virtual environment setup
`cd backend`

`python -m venv dating_venv` - to create virtual environment. Make sure your python version matches `3.12.2`.

`source /dating_venv/bin/activate` - activate virtual environment. If you have permission problems, `chmod +x /dating_venv/bin/activate` then try again.

`pip install -r requirements.txt`


## Next Steps

See BACKEND_SETUP.md for detailed backend setup instructions.

---
Last Updated: November 15, 2025
