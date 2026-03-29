from fastapi import APIRouter, UploadFile, File
from models.schemas import (
    HealthInput,
    FireInput,
    TaxInput,
    LifeEventStart,
    LifeEventChat,
    CoupleInput,
    UserSave,
)
from agents.health_score_agent import calculate_health_score
from agents.fire_agent import generate_fire_plan
from agents.life_event_agent import life_event_start, life_event_chat
from agents.tax_agent import tax_advisor
from agents.couple_agent import couple_planner

router = APIRouter(prefix="/api")


@router.post("/health-score")
def health_score(input: HealthInput):
    return calculate_health_score(input)


@router.post("/fire")
def fire_plan(input: FireInput):
    return generate_fire_plan(input)


@router.post("/tax")
def tax(input: TaxInput):
    return tax_advisor(input)


@router.post("/tax/upload")
async def tax_upload(file: UploadFile = File(...)):
    import pdfplumber
    import io

    contents = await file.read()
    text = ""
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    def extract(keyword, default=0.0):
        import re
        match = re.search(rf"{keyword}[\s:₹]+([\d,]+)", text, re.IGNORECASE)
        return float(match.group(1).replace(",", "")) if match else default

    parsed = TaxInput(
        basic_salary=extract("Basic Salary"),
        hra_received=extract("HRA"),
        rent_paid=0.0,
        city_type="metro",
        special_allowance=extract("Special Allowance"),
        other_income=0.0,
        section_80c=extract("80C"),
        section_80d=extract("80D"),
        section_80ccd=extract("80CCD"),
        home_loan_interest=extract("Home Loan Interest"),
        education_loan_interest=extract("Education Loan"),
        other_deductions=0.0,
    )

    return tax_advisor(parsed)


@router.post("/life-event/start")
def life_event_start_route(input: LifeEventStart):
    return life_event_start(input)


@router.post("/life-event/chat")
def life_event_chat_route(input: LifeEventChat):
    return life_event_chat(input)


@router.post("/couple")
def couple(input: CoupleInput):
    return couple_planner(input)


SAMPLE_MF_DATA = {
    "total_invested":  500_000,
    "current_value":   720_000,
    "total_returns":   220_000,
    "xirr":            14.5,
    "nifty_xirr":      12.3,
    "allocation": [
        {"category": "Large Cap", "percentage": 40},
        {"category": "Mid Cap",   "percentage": 30},
        {"category": "Debt",      "percentage": 20},
        {"category": "Gold",      "percentage": 10},
    ],
    "funds": [
        {
            "name":          "Mirae Asset Large Cap",
            "invested":      200_000,
            "current_value": 290_000,
            "returns":       90_000,
            "xirr":          15.2,
            "expense_ratio": 0.54,
        },
        {
            "name":          "Parag Parikh Flexi Cap",
            "invested":      150_000,
            "current_value": 215_000,
            "returns":       65_000,
            "xirr":          13.8,
            "expense_ratio": 0.63,
        },
        {
            "name":          "HDFC Mid Cap Opportunities",
            "invested":      100_000,
            "current_value": 145_000,
            "returns":       45_000,
            "xirr":          14.1,
            "expense_ratio": 0.89,
        },
        {
            "name":          "SBI Debt Fund",
            "invested":      50_000,
            "current_value": 70_000,
            "returns":       20_000,
            "xirr":          7.2,
            "expense_ratio": 0.45,
        },
    ],
    "overlaps": [
        {
            "fund1":   "Mirae Asset Large Cap",
            "fund2":   "Parag Parikh Flexi Cap",
            "overlap": 34,
        }
    ],
    "rebalancing_plan": [
        "Reduce Large Cap allocation from 40% to 35% — you are overweight.",
        "Increase Mid Cap from 30% to 35% given your moderate risk profile.",
        "Switch SBI Debt Fund to a lower expense ratio alternative.",
        "Consider adding an International Fund for geographic diversification.",
    ],
}


@router.post("/mf-xray/sample")
def mf_xray_sample():
    return SAMPLE_MF_DATA


@router.post("/mf-xray/upload")
async def mf_xray_upload(file: UploadFile = File(...)):
    # TODO: Integrate pdfplumber + regex/LLM parsing for CAMS statement
    # For now returns sample data as placeholder
    return SAMPLE_MF_DATA



_user_store: dict = {} 


@router.post("/user/save")
def user_save(input: UserSave):
    _user_store[(input.userId, input.key)] = input.data
    return {"status": "saved"}


@router.get("/user/load/{userId}/{key}")
def user_load(userId: str, key: str):
    data = _user_store.get((userId, key), {})
    return {"userId": userId, "key": key, "data": data}