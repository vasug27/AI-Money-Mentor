from pydantic import BaseModel

class HealthInput(BaseModel):
    age: int
    monthly_income: float
    monthly_expenses: float
    savings: float
    debt: float
    insurance: float
    investments: float


class FireInput(BaseModel):
    age: int
    monthly_income: float
    monthly_expenses: float
    current_savings: float
    expected_return: float = 0.12
    inflation: float = 0.06
    retirement_age: int = 45


class LifeEventInput(BaseModel):
    event: str
    amount: float
    monthly_income: float
    monthly_expenses: float
    savings: float