def _compatibility_score(p1: dict, p2: dict) -> int:
    score = 50

    def savings_rate(p):
        inc = float(p.get("monthly_income", 1))
        exp = float(p.get("monthly_expenses", 0))
        return (inc - exp) / inc if inc else 0

    sr1, sr2 = savings_rate(p1), savings_rate(p2)
    avg_sr = (sr1 + sr2) / 2
    score += min(30, int(avg_sr * 100))

    if p1.get("has_life_insurance", "No").lower() == "yes":
        score += 5
    if p2.get("has_life_insurance", "No").lower() == "yes":
        score += 5
        
    emi1 = float(p1.get("total_emi", 0)) / float(p1.get("monthly_income", 1))
    emi2 = float(p2.get("total_emi", 0)) / float(p2.get("monthly_income", 1))
    if (emi1 + emi2) / 2 < 0.30:
        score += 10

    return min(100, score)


def couple_planner(data):
    p1 = data.partner1
    p2 = data.partner2
    p1_income  = float(p1.get("monthly_income", 0))
    p2_income  = float(p2.get("monthly_income", 0))
    p1_expense = float(p1.get("monthly_expenses", 0))
    p2_expense = float(p2.get("monthly_expenses", 0))
    p1_invest  = float(p1.get("existing_investments", 0))
    p2_invest  = float(p2.get("existing_investments", 0))
    p1_sip     = float(p1.get("monthly_sip", 0))
    p2_sip     = float(p2.get("monthly_sip", 0))
    p1_tax_inv = float(p1.get("tax_saving_investments", 0))
    p2_tax_inv = float(p2.get("tax_saving_investments", 0))

    combined_net_worth       = p1_invest + p2_invest
    combined_monthly_income  = p1_income + p2_income
    combined_monthly_savings = (p1_income - p1_expense) + (p2_income - p2_expense)

    optimizations = []

    p1_tax_bracket = 0.30 if p1_income > 100_000 else (0.20 if p1_income > 60_000 else 0.05)
    p2_tax_bracket = 0.30 if p2_income > 100_000 else (0.20 if p2_income > 60_000 else 0.05)
    if p1_tax_bracket > p2_tax_bracket:
        hra_saving = 24_000
        hra_advice = (
            f"{p1.get('name', 'Partner 1')} should claim HRA as they are in the "
            f"{int(p1_tax_bracket * 100)}% bracket. "
            f"This saves ₹{hra_saving:,} more than {p2.get('name', 'Partner 2')} claiming it."
        )
        optimizations.append({
            "title":       "Split HRA claim optimally",
            "description": f"{p1.get('name', 'Partner 1')} should claim HRA since they are in higher tax bracket",
            "saving":      hra_saving,
        })
    else:
        hra_saving = 24_000
        hra_advice = (
            f"{p2.get('name', 'Partner 2')} should claim HRA as they are in the "
            f"{int(p2_tax_bracket * 100)}% bracket."
        )
        optimizations.append({
            "title":       "Split HRA claim optimally",
            "description": f"{p2.get('name', 'Partner 2')} should claim HRA since they are in higher tax bracket",
            "saving":      hra_saving,
        })

    p1_no_life = p1.get("has_life_insurance", "No").lower() != "yes"
    p2_no_life = p2.get("has_life_insurance", "No").lower() != "yes"
    if p1_no_life or p2_no_life:
        names = " and ".join(
            filter(None, [
                p1.get("name", "Partner 1") if p1_no_life else None,
                p2.get("name", "Partner 2") if p2_no_life else None,
            ])
        )
        optimizations.append({
            "title":       "Get term insurance for both",
            "description": f"{names} lack life insurance — critical financial risk",
            "saving":      None,
        })

    nps_saving = 0
    if p1_tax_inv < 150_000:
        nps_saving += int((150_000 - p1_tax_inv) * p1_tax_bracket * 0.5)
    if p2_tax_inv < 150_000:
        nps_saving += int((150_000 - p2_tax_inv) * p2_tax_bracket * 0.5)

    combined_nps_saving = 30_000 

    sip_split_advice = (
        f"Invest aggressive funds in {p1.get('name', 'Partner 1')}'s name and "
        f"debt funds in {p2.get('name', 'Partner 2')}'s name to optimize tax on returns."
        if p1_income >= p2_income
        else
        f"Invest aggressive funds in {p2.get('name', 'Partner 2')}'s name and "
        f"debt funds in {p1.get('name', 'Partner 1')}'s name to optimize tax on returns."
    )

    insurance_advice = (
        "Get a joint family floater health insurance of ₹10L. "
        "Both partners need separate term plans — ₹1Cr each minimum."
    )

    nps_advice = (
        f"Both should contribute ₹50,000 each to NPS for 80CCD benefit — "
        f"combined tax saving of ₹{combined_nps_saving:,}."
    )

    recommendations = []
    if p1_no_life or p2_no_life:
        recommendations.append("Get term insurance for both partners immediately.")
    recommendations.append(f"Open joint NPS account for combined tax saving of ₹{combined_nps_saving:,}.")
    recommendations.append(
        f"{p1.get('name', 'Partner 1') if p1_tax_bracket >= p2_tax_bracket else p2.get('name', 'Partner 2')} "
        f"should claim HRA — saves ₹{hra_saving:,} more in taxes."
    )

    return {
        "combined_net_worth":          round(combined_net_worth, 2),
        "combined_monthly_income":     round(combined_monthly_income, 2),
        "combined_monthly_savings":    round(combined_monthly_savings, 2),
        "financial_compatibility_score": _compatibility_score(p1, p2),
        "partner1_summary": {
            "monthly_income":   p1_income,
            "monthly_expenses": p1_expense,
            "monthly_sip":      p1_sip,
        },
        "partner2_summary": {
            "monthly_income":   p2_income,
            "monthly_expenses": p2_expense,
            "monthly_sip":      p2_sip,
        },
        "optimizations":    optimizations,
        "hra_advice":        hra_advice,
        "sip_split_advice":  sip_split_advice,
        "insurance_advice":  insurance_advice,
        "nps_advice":        nps_advice,
        "recommendations":   recommendations,
    }