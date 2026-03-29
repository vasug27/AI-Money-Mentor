def _compute_hra_exemption(basic_salary, hra_received, rent_paid, city_type):
    if rent_paid <= 0:
        return 0.0
    percent = 0.50 if city_type.lower() == "metro" else 0.40
    return min(
        hra_received,
        rent_paid - 0.10 * basic_salary,
        percent * basic_salary,
    )


def _tax_old_regime(taxable_income):
    tax = 0.0
    slabs = [
        (250_000,  0.00),
        (500_000,  0.05),
        (1_000_000, 0.20),
        (float("inf"), 0.30),
    ]
    prev = 0
    for limit, rate in slabs:
        if taxable_income <= prev:
            break
        chunk = min(taxable_income, limit) - prev
        tax += chunk * rate
        prev = limit
    return tax


def _tax_new_regime(income):
    tax = 0.0
    slabs = [
        (300_000,  0.00),
        (600_000,  0.05),
        (900_000,  0.10),
        (1_200_000, 0.15),
        (1_500_000, 0.20),
        (float("inf"), 0.30),
    ]
    prev = 0
    for limit, rate in slabs:
        if income <= prev:
            break
        chunk = min(income, limit) - prev
        tax += chunk * rate
        prev = limit
    return tax


def tax_advisor(data):
    gross_income = (
        data.basic_salary
        + data.hra_received
        + data.special_allowance
        + data.other_income
    )

    hra_exemption = _compute_hra_exemption(
        data.basic_salary, data.hra_received, data.rent_paid, data.city_type
    )
    standard_deduction = 50_000
    old_deductions = (
        standard_deduction
        + hra_exemption
        + data.section_80c
        + data.section_80d
        + data.section_80ccd
        + data.home_loan_interest
        + data.education_loan_interest
        + data.other_deductions
    )
    old_taxable = max(0, gross_income - old_deductions)
    old_tax = _tax_old_regime(old_taxable)

    new_standard_deduction = 75_000
    new_taxable = max(0, gross_income - new_standard_deduction)
    new_tax = _tax_new_regime(new_taxable)

    missing_deductions = []

    if data.section_80ccd < 50_000:
        potential = (50_000 - data.section_80ccd) * 0.30
        missing_deductions.append({
            "section":     "80CCD(1B) — NPS",
            "description": f"Additional NPS contribution up to ₹50,000",
            "potential_saving": round(potential),
        })

    missing_deductions.append({
        "section":     "80TTA — Savings Interest",
        "description": "Interest on savings account up to ₹10,000",
        "potential_saving": round(10_000 * 0.30),
    })

    if data.home_loan_interest == 0:
        missing_deductions.append({
            "section":     "Section 24(b) — Home Loan Interest",
            "description": "Deduction up to ₹2L on home loan interest",
            "potential_saving": round(200_000 * 0.30),
        })

    investment_suggestions = [
        {
            "name":     "ELSS Mutual Fund",
            "reason":   "Tax saving under 80C with best returns",
            "risk":     "High",
            "lock_in":  "3 years",
        },
        {
            "name":     "PPF",
            "reason":   "Safe long term tax free returns",
            "risk":     "Low",
            "lock_in":  "15 years",
        },
        {
            "name":     "NPS",
            "reason":   "Additional 80CCD deduction of ₹50,000",
            "risk":     "Medium",
            "lock_in":  "Till retirement",
        },
    ]

    return {
        "gross_income":             round(gross_income, 2),
        "old_regime_deductions":    round(old_deductions, 2),
        "old_regime_taxable":       round(old_taxable, 2),
        "old_regime_tax":           round(old_tax, 2),
        "new_regime_taxable":       round(new_taxable, 2),
        "new_regime_tax":           round(new_tax, 2),
        "missing_deductions":       missing_deductions,
        "investment_suggestions":   investment_suggestions,
    }