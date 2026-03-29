# 💰 AI Money Mentor - A Personal AI Financial Advisor

An AI-powered personal finance mentor that turns confused savers into confident investors. Built for the ET AI Hackathon 2026 — making financial planning as accessible as checking WhatsApp.

💡 **Frontend by [Manmohan Tripathi](https://github.com/manmohanTripathi)** | **Backend by [Vasu Goel](https://github.com/vasug27)**

---

## ✅ Overview

A full-stack **AI-powered financial planning platform** for every Indian:
- Generates a comprehensive **Money Health Score** across 6 financial dimensions
- Builds a complete **FIRE Path Plan** with month-by-month SIP roadmap
- Compares **old vs new tax regime** with personalized deduction analysis
- Provides **life event specific financial advice** via conversational AI
- Optimizes **joint finances** for couples with invite-based account linking
- Delivers **MF Portfolio X-Ray** with XIRR, overlap analysis and rebalancing plan
- Secured with **Clerk authentication** and persistent **MongoDB user profiles**

---

## 🛠 Tech Stack

| Category | Technologies Used |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Authentication | Clerk |
| Charts & Visualization | Recharts |
| HTTP Client | Axios |
| Routing | React Router DOM v7 |
| Backend | Python, FastAPI |
| AI Agents | LangChain, LangGraph |
| LLM | Google Gemini 1.5 Flash |
| PDF Parsing | pdfplumber |
| Financial Calculations | pyxirr |
| Database | MongoDB |
| Environment | python-dotenv |

---

## 📁 Folder Structure
```
AI-Money-Mentor/
├── frontend/                          # React + Vite frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Axios instance
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Responsive navbar with Clerk auth
│   │   │   └── PageHero.jsx           # Reusable hero banner component
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Landing page with feature cards
│   │   │   ├── Home.jsx               # Dashboard
│   │   │   ├── HealthScore.jsx        # Money Health Score
│   │   │   ├── FirePlanner.jsx        # FIRE Path Planner
│   │   │   ├── TaxWizard.jsx          # Tax Wizard
│   │   │   ├── LifeEventAdvisor.jsx   # Life Event Advisor
│   │   │   ├── CouplePlanner.jsx      # Couple's Money Planner
│   │   │   └── MFXray.jsx             # MF Portfolio X-Ray
│   │   ├── utils/
│   │   │   ├── userProfile.js         # MongoDB save/load helpers
│   │   │   └── storage.js             # localStorage helpers
│   │   ├── App.jsx                    # Routes + protected routes
│   │   └── main.jsx                   # Clerk + BrowserRouter setup
│   ├── .env.example                   # Environment variable template
│   ├── package.json
│   └── vite.config.js
│
└── backend/                           # FastAPI backend
    ├── agents/
    │   ├── health_score_agent.py      # Money Health Score LangGraph agent
    │   ├── fire_agent.py              # FIRE Path Planner LangGraph agent
    │   ├── life_event_agent.py        # Life Event Advisor LangGraph agent
    │   └── mf_xray_agent.py          # MF Portfolio X-Ray agent
    ├── models/
    │   └── schemas.py                 # Pydantic schemas
    ├── routes/
    │   ├── api.py                     # Main API routes
    │   └── mf_xray_routes.py         # MF X-Ray specific routes
    ├── utils/
    │   ├── calculations.py            # SIP, XIRR, tax calculations
    │   └── pdf_parser.py             # CAMS PDF parser
    ├── .env                           # API keys (not committed)
    ├── requirements.txt               # Python dependencies
    └── main.py                        # FastAPI app entry point
```

---

## 🚀 Features

### 🏥 Money Health Score
A 5-minute onboarding flow that scores your financial wellness across 6 dimensions — emergency preparedness, insurance coverage, investment diversification, debt health, tax efficiency, and retirement readiness.

### 🔥 FIRE Path Planner
Input your age, income, expenses and goals. AI builds a complete month-by-month financial roadmap with SIP amounts, asset allocation, and wealth projection charts all the way to your retirement date.

### 🧾 Tax Wizard
Upload Form 16 PDF or enter salary structure manually. AI compares old vs new tax regime with your exact numbers, identifies every missing deduction, and suggests tax-saving investments ranked by risk profile.

### 🎯 Life Event Financial Advisor
Conversational AI that handles bonus, marriage, new baby, inheritance, job change and home purchase — customized to your tax bracket, portfolio, risk profile and goals.

### 💑 Couple's Money Planner
India's first AI-powered joint financial planning tool. Link partner accounts via invite link. AI optimizes across both incomes — HRA claims, NPS matching, SIP splits for tax efficiency, joint insurance strategy.

### 📊 MF Portfolio X-Ray
Upload CAMS/KFintech statement. Get complete portfolio reconstruction, true XIRR, overlap analysis, expense ratio drag, Nifty 50 benchmark comparison, and AI-generated rebalancing plan in under 10 seconds.

---

## ⚙️ Setup Guide

### Frontend

**1. Clone the repository**
```bash
git clone https://github.com/vasug27/AI-Money-Mentor.git
cd AI-Money-Mentor/frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment**

Create a `.env` file in the `frontend` directory:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```
Get your key from [Clerk Dashboard](https://clerk.com)

**4. Start the development server**
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`

---

### Backend

**1. Navigate to backend** - Create a new folder, move the backend folder there and perform the following steps:
```bash
cd backend
```

**2. Create and activate virtual environment**
```bash
python3.11 -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Configure environment**

Create a `.env` file in the `backend` directory:
```
GEMINI_API_KEY=your_google_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
```

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com)

**5. Start the server**
```bash
uvicorn main:app --reload
```
Backend runs at `http://localhost:8000`

---

## 📌 API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/health-score` | Generate Money Health Score |
| POST | `/api/fire` | Generate FIRE Path Plan |
| POST | `/api/tax` | Tax regime comparison (manual) |
| POST | `/api/tax/upload` | Tax regime comparison (Form 16 PDF) |
| POST | `/api/life-event/start` | Start Life Event conversation |
| POST | `/api/life-event/chat` | Continue Life Event conversation |
| POST | `/api/couple` | Generate Joint Financial Plan |
| POST | `/api/mf-xray/upload` | MF Portfolio X-Ray (CAMS PDF) |
| POST | `/api/mf-xray/sample` | MF Portfolio X-Ray (sample data) |
| POST | `/api/user/save` | Save user profile to MongoDB |
| GET | `/api/user/load/{userId}/{key}` | Load user profile from MongoDB |


---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`feature/new-feature`)
3. Commit changes and push
4. Open a PR 🎉

---

## 👥 Authors

**Manmohan Tripathi** — Frontend

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:manmohantripathi38@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/manmohan-mani-tripathi-2b3a60256)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/manmohanTripathi)

**Vasu Goel** — Backend

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:vasugoel2754@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vasugoel503/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vasug27)

---

## 📄 License

Built for **ET AI Hackathon 2026** — Making financial planning accessible to every Indian.

*95% of Indians don't have a financial plan. AI Money Mentor is here to fix that.*
