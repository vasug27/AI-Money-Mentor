def calculate_health_score(data):
    yearly_income = data.monthly_income * 12

    emergency_score = min(100, (data.emergency_fund_months / 6) * 100)
    emergency_feedback = (
        f"Good. You have {data.emergency_fund_months} months of emergency fund."
        if data.emergency_fund_months >= 6
        else f"You have {data.emergency_fund_months} months. Aim for 6 months of expenses."
    )

    has_health = data.has_health_insurance.lower() in ("yes", "true", "1")
    has_life = data.has_life_insurance.lower() in ("yes", "true", "1")
    insurance_score = (50 if has_health else 0) + (50 if has_life else 0)
    if not has_health and not has_life:
        insurance_feedback = "You lack both health and life insurance. Get a term plan immediately."
    elif not has_life:
        insurance_feedback = "You lack life insurance. Get a term plan immediately."
    elif not has_health:
        insurance_feedback = "You lack health insurance. Get adequate coverage."
    else:
        insurance_feedback = "Good. You have both health and life insurance coverage."

    types = [t.strip() for t in data.investment_types.split(",") if t.strip()]
    diversity_score = min(100, len(types) * 25)
    investment_feedback = (
        f"Decent diversification across {', '.join(types)}."
        if len(types) >= 2
        else "Low diversification. Consider spreading investments across MF, FD, NPS, etc."
    )

    emi_ratio = (data.total_debt_emi / data.monthly_income) * 100 if data.monthly_income else 0
    debt_score = max(0, 100 - emi_ratio * 2)
    debt_feedback = (
        f"EMI to income ratio is healthy at {round(emi_ratio, 1)}%."
        if emi_ratio <= 30
        else f"EMI to income ratio is high at {round(emi_ratio, 1)}%. Aim to keep it under 30%."
    )

    utilization_80c = min(100, (data.tax_saving_investments / 150000) * 100)
    has_nps = data.has_retirement_plan.lower() in ("nps", "yes")
    tax_score = min(100, utilization_80c * 0.7 + (30 if has_nps else 0))
    tax_feedback = (
        "You are using 80C and NPS benefits efficiently."
        if has_nps and utilization_80c >= 100
        else "You are using 80C but missing NPS 80CCD benefits."
        if not has_nps
        else "Maximize your 80C limit of ₹1.5L before using other deductions."
    )

    sip_ratio = (data.monthly_investment / data.monthly_income) * 100 if data.monthly_income else 0
    retirement_score = min(100, sip_ratio * 3.33)
    retirement_feedback = (
        "Good retirement savings habit. Keep increasing SIP annually."
        if sip_ratio >= 20
        else "Start increasing retirement corpus immediately. Aim for 20%+ of income."
    )

    dimensions = [
        {"name": "Emergency Preparedness",    "score": round(emergency_score),  "feedback": emergency_feedback},
        {"name": "Insurance Coverage",         "score": round(insurance_score),  "feedback": insurance_feedback},
        {"name": "Investment Diversification", "score": round(diversity_score),  "feedback": investment_feedback},
        {"name": "Debt Health",                "score": round(debt_score),       "feedback": debt_feedback},
        {"name": "Tax Efficiency",             "score": round(tax_score),        "feedback": tax_feedback},
        {"name": "Retirement Readiness",       "score": round(retirement_score), "feedback": retirement_feedback},
    ]

    overall_score = round(sum(d["score"] for d in dimensions) / len(dimensions))

    if overall_score >= 75:
        summary = "Your finances are in great shape. Keep up the disciplined approach."
    elif overall_score >= 50:
        summary = "Your finances are moderately healthy but need attention in insurance and retirement planning."
    else:
        summary = "Your finances need immediate attention. Focus on emergency fund and insurance first."

    recommendations = []
    if not has_life:
        recommendations.append("Get a term life insurance of at least 1 crore immediately.")
    if data.emergency_fund_months < 6:
        recommendations.append("Increase emergency fund to 6 months of expenses.")
    if not has_nps:
        recommendations.append("Start NPS contributions for additional 80CCD tax benefit.")
    if emi_ratio > 30:
        recommendations.append("Reduce EMI burden — aim to keep EMI below 30% of income.")
    if sip_ratio < 20:
        recommendations.append(f"Increase monthly SIP to at least ₹{int(data.monthly_income * 0.2)}.")

    return {
        "overall_score": overall_score,
        "summary": summary,
        "dimensions": dimensions,
        "recommendations": recommendations,
    }