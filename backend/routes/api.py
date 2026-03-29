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
from agents.mf_xray_agent import analyse_portfolio, analyse_from_pdf

router = APIRouter()


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
    import pdfplumber, io, re

    contents = await file.read()
    text = ""
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    def extract(keyword, default=0.0):
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


SAMPLE_FUNDS = [
    {"name": "Mirae Asset Large Cap",        "invested": 200000, "current_value": 290000, "expense_ratio": 0.54},
    {"name": "Parag Parikh Flexi Cap",        "invested": 150000, "current_value": 215000, "expense_ratio": 0.63},
    {"name": "HDFC Mid Cap Opportunities",    "invested": 100000, "current_value": 145000, "expense_ratio": 0.89},
    {"name": "SBI Debt Fund",                 "invested":  50000, "current_value":  70000, "expense_ratio": 0.45},
]


@router.post("/mf-xray/sample")
def mf_xray_sample():
    return analyse_portfolio(SAMPLE_FUNDS)


@router.post("/mf-xray/upload")
async def mf_xray_upload(file: UploadFile = File(...)):
    contents = await file.read()
    return analyse_from_pdf(contents)


_user_store: dict = {}


@router.post("/user/save")
def user_save(input: UserSave):
    _user_store[(input.userId, input.key)] = input.data
    return {"status": "saved"}


@router.get("/user/load/{userId}/{key}")
def user_load(userId: str, key: str):
    data = _user_store.get((userId, key), {})
    return {"userId": userId, "key": key, "data": data}