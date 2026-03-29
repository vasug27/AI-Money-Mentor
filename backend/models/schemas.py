from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class HealthInput(BaseModel):
    age: int
    monthly_income: float
    monthly_expenses: float
    emergency_fund_months: float
    has_health_insurance: str
    has_life_insurance: str
    monthly_investment: float
    investment_types: str
    total_debt_emi: float
    tax_saving_investments: float
    has_retirement_plan: str


class FireInput(BaseModel):
    age: int
    retirement_age: int
    monthly_income: float
    monthly_expenses: float
    existing_investments: float
    risk_profile: str
    goals: str


class TaxInput(BaseModel):
    basic_salary: float
    hra_received: float
    rent_paid: float
    city_type: str
    special_allowance: float
    other_income: float
    section_80c: float
    section_80d: float
    section_80ccd: float
    home_loan_interest: float
    education_loan_interest: float
    other_deductions: float

class LifeEventStart(BaseModel):
    event: str
    profile: Dict[str, Any]


class LifeEventChat(BaseModel):
    event: str
    profile: Dict[str, Any]
    messages: List[Dict[str, str]]


class CoupleInput(BaseModel):
    partner1: Dict[str, Any]
    partner2: Dict[str, Any]


class UserSave(BaseModel):
    userId: str
    key: str
    data: Dict[str, Any]