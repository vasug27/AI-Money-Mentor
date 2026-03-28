def calculate_health_score(data):
    score = {}

    emergency_months = data.savings / (data.monthly_expenses + 1)
    score["emergency"] = min(100, (emergency_months / 6) * 100)

    savings_rate = (data.monthly_income - data.monthly_expenses) / data.monthly_income
    score["savings"] = max(0, min(100, savings_rate * 100))

    debt_ratio = data.debt / (data.monthly_income + 1)
    score["debt"] = max(0, 100 - debt_ratio * 100)

    yearly_income = data.monthly_income * 12
    score["insurance"] = min(100, (data.insurance / (yearly_income + 1)) * 100)

    score["investment"] = min(100, (data.investments / (yearly_income + 1)) * 100)

    score["retirement"] = (score["savings"] + score["investment"]) / 2

    total_score = sum(score.values()) / len(score)

    insights = []

    if score["emergency"] < 50:
        insights.append("Build at least 6 months emergency fund.")

    if score["savings"] < 30:
        insights.append("Increase savings rate to 30%+.")

    if score["debt"] < 50:
        insights.append("Reduce your debt burden.")

    if score["investment"] < 40:
        insights.append("Start investing via SIP.")

    return {
        "total_score": round(total_score, 2),
        "breakdown": {k: round(v, 2) for k, v in score.items()},
        "insights": insights
    }