from fastapi import APIRouter
from models.schemas import HealthInput, FireInput, LifeEventInput
from agents.health_score_agent import calculate_health_score
from agents.fire_agent import generate_fire_plan
from agents.life_event_agent import life_event_advice

router = APIRouter()

@router.post("/health-score")
def health_score(input: HealthInput):
    return calculate_health_score(input)

@router.post("/fire")
def fire_plan(input: FireInput):
    return generate_fire_plan(input)

@router.post("/life-event")
def life_event(input: LifeEventInput):
    return life_event_advice(input)