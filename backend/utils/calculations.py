def sip_required(target: float, annual_rate: float, time_years: int) -> float:
    monthly_rate = annual_rate / 12
    months = time_years * 12
    return target * monthly_rate / ((1 + monthly_rate) ** months - 1)


def future_value_sip(monthly_sip: float, annual_rate: float, time_years: int) -> float:
    monthly_rate = annual_rate / 12
    months = time_years * 12
    return monthly_sip * (((1 + monthly_rate) ** months - 1) / monthly_rate)


def lumpsum_future_value(principal: float, annual_rate: float, time_years: int) -> float:
    return principal * (1 + annual_rate) ** time_years


def fire_number(annual_expenses: float, withdrawal_rate: float = 0.04) -> float:
    return annual_expenses / withdrawal_rate