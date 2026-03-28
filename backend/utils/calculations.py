def sip_required(target, rate, time_years):
    monthly_rate = rate / 12
    months = time_years * 12

    sip = target * monthly_rate / ((1 + monthly_rate) ** months - 1)
    return sip