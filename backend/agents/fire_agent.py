import math

def generate_fire_plan(data):
    years = data.retirement_age - data.age
    months = years * 12

    monthly_savings = data.monthly_income - data.monthly_expenses

    monthly_rate = data.expected_return / 12

    # Future value of SIP
    future_value = monthly_savings * (
        ((1 + monthly_rate) ** months - 1) / monthly_rate
    )

    # FIRE corpus (25x annual expenses)
    annual_expenses = data.monthly_expenses * 12
    fire_target = annual_expenses * 25

    # Monthly simulation (for graph)
    wealth = data.current_savings
    growth_data = []

    for m in range(1, months + 1):
        wealth = wealth * (1 + monthly_rate) + monthly_savings
        growth_data.append(round(wealth, 2))

    # Insights
    insights = []

    if monthly_savings < data.monthly_income * 0.2:
        insights.append("You are saving less than 20%. Increase savings.")

    if future_value < fire_target:
        insights.append("You will not reach FIRE target. Increase SIP or reduce expenses.")
    else:
        insights.append("You are on track for FIRE 🎯")

    return {
        "retirement_age": data.retirement_age,
        "years_to_retire": years,
        "monthly_savings": monthly_savings,
        "fire_target": round(fire_target, 2),
        "projected_wealth": round(future_value, 2),
        "growth_chart": growth_data,
        "insights": insights
    }