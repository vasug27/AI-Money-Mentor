import io
import re
from datetime import date, datetime
from typing import List, Dict, Any

import pdfplumber
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.5-flash"

OVERLAP_TABLE = {
    ("Mirae Asset Large Cap", "Parag Parikh Flexi Cap"): 34,
    ("Mirae Asset Large Cap", "HDFC Mid Cap Opportunities"): 12,
    ("Parag Parikh Flexi Cap", "HDFC Mid Cap Opportunities"): 18,
    ("Axis Bluechip", "Mirae Asset Large Cap"): 41,
    ("Axis Bluechip", "Parag Parikh Flexi Cap"): 29,
}

EXPENSE_RATIO_DB = {
    "mirae asset large cap": 0.54,
    "parag parikh flexi cap": 0.63,
    "hdfc mid cap opportunities": 0.89,
    "sbi debt fund": 0.45,
    "axis bluechip": 0.44,
    "icici prudential nifty 50 index": 0.17,
    "nippon india small cap": 0.68,
    "kotak emerging equity": 0.79,
    "dsp midcap": 0.71,
    "quant active fund": 0.58,
}

CATEGORY_KEYWORDS = {
    "Large Cap":       ["large cap", "bluechip", "blue chip", "nifty 50", "top 100"],
    "Mid Cap":         ["mid cap", "midcap", "emerging equity"],
    "Small Cap":       ["small cap", "smallcap"],
    "Flexi Cap":       ["flexi cap", "flexicap", "multi cap", "multicap"],
    "ELSS":            ["elss", "tax saver", "tax saving"],
    "Debt":            ["debt", "liquid", "overnight", "money market", "gilt", "bond", "income fund"],
    "Hybrid":          ["hybrid", "balanced", "equity savings", "arbitrage"],
    "Index":           ["index", "nifty", "sensex", "etf"],
    "International":   ["international", "global", "us equity", "nasdaq", "world"],
    "Gold":            ["gold"],
}

NIFTY_XIRR = 12.3



def _parse_cams_pdf(pdf_bytes: bytes) -> List[Dict]:
    """Extract fund-level transaction data from CAMS/KFintech statement."""
    text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"

    funds = []

    fund_blocks = re.split(r"\n(?=[A-Z][A-Za-z\s\-]+(Fund|Opportunities|Cap|Equity|Debt|ELSS|Growth|Plan))", text)

    for block in fund_blocks:
        name_match = re.match(r"^([A-Za-z\s\(\)\-\/]+(?:Fund|Opportunities|Cap|Equity|Debt|ELSS|Growth|Plan)[A-Za-z\s\-]*)", block)
        if not name_match:
            continue

        fund_name = name_match.group(1).strip()

        invested     = _extract_amount(block, ["invested", "cost", "purchase value", "amount invested"])
        current_val  = _extract_amount(block, ["current value", "market value", "value"])
        units        = _extract_float(block, ["units", "balance units"])
        nav          = _extract_float(block, ["nav", "current nav"])

        if not fund_name or (invested == 0 and current_val == 0):
            continue

        funds.append({
            "name":          fund_name,
            "invested":      invested,
            "current_value": current_val if current_val else (units * nav if units and nav else 0),
            "units":         units,
            "nav":           nav,
        })

    return funds


def _extract_amount(text: str, keywords: List[str]) -> float:
    for kw in keywords:
        match = re.search(rf"{kw}[^\d]*([\d,]+\.?\d*)", text, re.IGNORECASE)
        if match:
            return float(match.group(1).replace(",", ""))
    return 0.0


def _extract_float(text: str, keywords: List[str]) -> float:
    for kw in keywords:
        match = re.search(rf"{kw}[^\d]*([\d,]+\.?\d*)", text, re.IGNORECASE)
        if match:
            return float(match.group(1).replace(",", ""))
    return 0.0


def _xirr(cashflows: List[tuple]) -> float:
    """
    cashflows: list of (date, amount) — negatives = outflow, positives = inflow
    Returns annualised rate as a percentage.
    """
    if len(cashflows) < 2:
        return 0.0

    def npv(rate):
        t0 = cashflows[0][0]
        return sum(
            cf / (1 + rate) ** ((d - t0).days / 365.0)
            for d, cf in cashflows
        )

    rate = 0.1
    for _ in range(1000):
        f  = npv(rate)
        df = npv(rate + 1e-6)
        derivative = (df - f) / 1e-6
        if abs(derivative) < 1e-12:
            break
        rate -= f / derivative
        if rate <= -1:
            rate = -0.9999
    return round(rate * 100, 2)


def _simple_xirr(invested: float, current_value: float, years: float = 3.0) -> float:
    """Fallback XIRR when transaction history is unavailable."""
    if invested <= 0 or years <= 0:
        return 0.0
    return round(((current_value / invested) ** (1 / years) - 1) * 100, 2)


def _compute_overlaps(fund_names: List[str]) -> List[Dict]:
    overlaps = []
    for i in range(len(fund_names)):
        for j in range(i + 1, len(fund_names)):
            key1 = (fund_names[i], fund_names[j])
            key2 = (fund_names[j], fund_names[i])
            pct = OVERLAP_TABLE.get(key1) or OVERLAP_TABLE.get(key2)
            if pct and pct > 10:
                overlaps.append({
                    "fund1":   fund_names[i],
                    "fund2":   fund_names[j],
                    "overlap": pct,
                })
    return overlaps


def _classify(fund_name: str) -> str:
    name_lower = fund_name.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in name_lower for kw in keywords):
            return category
    return "Other"


def _get_expense_ratio(fund_name: str) -> float:
    name_lower = fund_name.lower()
    for key, ratio in EXPENSE_RATIO_DB.items():
        if key in name_lower or name_lower in key:
            return ratio
    return 0.75


def _build_allocation(funds: List[Dict], total_value: float) -> List[Dict]:
    category_totals: Dict[str, float] = {}
    for f in funds:
        cat = _classify(f["name"])
        category_totals[cat] = category_totals.get(cat, 0) + f["current_value"]

    return [
        {
            "category":   cat,
            "percentage": round((val / total_value) * 100, 1) if total_value else 0,
        }
        for cat, val in sorted(category_totals.items(), key=lambda x: -x[1])
    ]



def _ai_rebalancing(funds: List[Dict], allocation: List[Dict], xirr: float) -> List[str]:
    fund_summary = "\n".join(
        f"- {f['name']}: invested={f['invested']}, value={f['current_value']}, "
        f"xirr={f['xirr']}%, expense_ratio={f['expense_ratio']}%"
        for f in funds
    )
    alloc_summary = ", ".join(f"{a['category']} {a['percentage']}%" for a in allocation)

    prompt = f"""You are an expert Indian mutual fund advisor.

Portfolio Summary:
{fund_summary}

Current Allocation: {alloc_summary}
Portfolio XIRR: {xirr}%
Nifty 50 XIRR (benchmark): {NIFTY_XIRR}%

Give exactly 4-5 specific, actionable rebalancing recommendations.
Each should be one sentence. Focus on: over/under-weight categories,
high expense ratios, low XIRR funds, overlap issues, and missing asset classes.
Return as a plain numbered list. No markdown, no preamble."""

    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    lines = [
        re.sub(r"^\d+[\.\)]\s*", "", line).strip()
        for line in response.text.strip().split("\n")
        if line.strip() and re.match(r"^\d", line.strip())
    ]
    return lines if lines else [response.text.strip()]


def _expense_drag(funds: List[Dict], total_value: float) -> Dict:
    weighted_er = sum(
        f["expense_ratio"] * (f["current_value"] / total_value)
        for f in funds
        if total_value > 0
    )
    annual_drag = round(total_value * weighted_er / 100, 2)
    return {
        "weighted_expense_ratio": round(weighted_er, 3),
        "annual_cost_rupees":     annual_drag,
        "10yr_opportunity_cost":  round(annual_drag * 14.49, 2),
    }


def analyse_portfolio(funds_raw: List[Dict]) -> Dict:
    funds = []
    for f in funds_raw:
        invested      = float(f.get("invested", 0))
        current_value = float(f.get("current_value", 0))
        returns       = current_value - invested
        xirr          = _simple_xirr(invested, current_value)
        expense_ratio = f.get("expense_ratio") or _get_expense_ratio(f["name"])

        funds.append({
            "name":          f["name"],
            "category":      _classify(f["name"]),
            "invested":      invested,
            "current_value": current_value,
            "returns":       round(returns, 2),
            "xirr":          xirr,
            "expense_ratio": expense_ratio,
        })

    total_invested = sum(f["invested"] for f in funds)
    total_value    = sum(f["current_value"] for f in funds)
    total_returns  = total_value - total_invested

    portfolio_xirr = round(
        sum(f["xirr"] * (f["current_value"] / total_value) for f in funds)
        if total_value else 0,
        2
    )

    allocation     = _build_allocation(funds, total_value)
    overlaps       = _compute_overlaps([f["name"] for f in funds])
    expense_drag   = _expense_drag(funds, total_value)
    rebalancing    = _ai_rebalancing(funds, allocation, portfolio_xirr)

    return {
        "total_invested":   round(total_invested, 2),
        "current_value":    round(total_value, 2),
        "total_returns":    round(total_returns, 2),
        "absolute_return":  round((total_returns / total_invested) * 100, 2) if total_invested else 0,
        "xirr":             portfolio_xirr,
        "nifty_xirr":       NIFTY_XIRR,
        "alpha":            round(portfolio_xirr - NIFTY_XIRR, 2),
        "allocation":       allocation,
        "funds":            funds,
        "overlaps":         overlaps,
        "expense_drag":     expense_drag,
        "rebalancing_plan": rebalancing,
    }


def analyse_from_pdf(pdf_bytes: bytes) -> Dict:
    funds_raw = _parse_cams_pdf(pdf_bytes)
    if not funds_raw:
        return {"error": "Could not parse the PDF. Please upload a CAMS or KFintech consolidated statement."}

    return analyse_portfolio(funds_raw)