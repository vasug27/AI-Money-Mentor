from datetime import datetime

RISK_ALLOCATION = {
    "aggressive": [
        {"fund_type": "Large Cap",  "percentage": 35},
        {"fund_type": "Mid Cap",    "percentage": 35},
        {"fund_type": "Debt Fund",  "percentage": 20},
        {"fund_type": "Gold ETF",   "percentage": 10},
    ],
    "moderate": [
        {"fund_type": "Large Cap",  "percentage": 40},
        {"fund_type": "Mid Cap",    "percentage": 30},
        {"fund_type": "Debt Fund",  "percentage": 20},
        {"fund_type": "Gold ETF",   "percentage": 10},
    ],
    "conservative": [
        {"fund_type": "Large Cap",  "percentage": 30},
        {"fund_type": "Mid Cap",    "percentage": 15},
        {"fund_type": "Debt Fund",  "percentage": 45},
        {"fund_type": "Gold ETF",   "percentage": 10},
    ],
}

GOAL_ESTIMATES = {
    "buy house":        {"cost": 8_000_000, "label": "Buy House"},
    "child education":  {"cost": 3_000_000, "label": "Child Education"},
    "travel":           {"cost": 1_000_000, "label": "Travel"},
    "marriage":         {"cost": 2_000_000, "label": "Marriage"},
    "startup":          {"cost": 5_000_000, "label": "Startup"},
}


def _parse_goals(goals_str, required_sip, years):
    results = []
    monthly_rate = 0.12 / 12
    months = years * 12
    remaining_words = goals_str.lower()

    for key, meta in GOAL_ESTIMATES.items():
        if key in remaining_words:
            goal_sip = meta["cost"] * monthly_rate / ((1 + monthly_rate) ** months - 1)
            results.append({
                "goal":           meta["label"],
                "estimated_cost": meta["cost"],
                "monthly_sip":    round(goal_sip)
            })
    return results


def generate_fire_plan(data):
    years = data.retirement_age - data.age
    months = years * 12
    monthly_rate = 0.12 / 12

    monthly_savings = data.monthly_income - data.monthly_expenses
    annual_expenses = data.monthly_expenses * 12
    fire_number = annual_expenses * 25

    required_sip = fire_number * monthly_rate / ((1 + monthly_rate) ** months - 1)

    current_year = datetime.now().year
    wealth = data.existing_investments
    yearly_projection = []
    for yr in range(years + 1):
        yearly_projection.append({
            "year":   current_year + yr,
            "corpus": round(wealth),
            "target": round(fire_number)
        })
        for _ in range(12):
            wealth = wealth * (1 + monthly_rate) + monthly_savings

    profile = data.risk_profile.lower()
    allocation = RISK_ALLOCATION.get(profile, RISK_ALLOCATION["moderate"])
    sip_allocation = [
        {
            "fund_type":  a["fund_type"],
            "percentage": a["percentage"],
            "amount":     round(required_sip * a["percentage"] / 100)
        }
        for a in allocation
    ]

    goal_breakdown = _parse_goals(data.goals, required_sip, years)

    recommendations = []
    final_corpus = yearly_projection[-1]["corpus"]

    if final_corpus < fire_number:
        recommendations.append(
            f"Increase monthly SIP by ₹{round(required_sip - monthly_savings)} to reach your FIRE target."
        )
    else:
        recommendations.append("You are on track for FIRE 🎯")

    recommendations.append("Increase SIP by 10% every year to beat inflation.")

    if data.age < 35 and profile != "aggressive":
        recommendations.append("Switch to aggressive allocation before age 35.")

    emergency = data.monthly_expenses * 6
    recommendations.append(f"Build ₹{int(emergency)} emergency fund before increasing SIP.")

    return {
        "fire_number":        round(fire_number, 2),
        "years_to_fire":      years,
        "fire_age":           data.retirement_age,
        "required_monthly_sip": round(required_sip, 2),
        "yearly_projection":  yearly_projection,
        "sip_allocation":     sip_allocation,
        "goal_breakdown":     goal_breakdown,
        "recommendations":    recommendations,
    }