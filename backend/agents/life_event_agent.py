import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.5-flash"

SYSTEM_PROMPT = """You are an expert Indian financial advisor specializing in life events.
Be concise, practical, and conversational. Use Rs. for amounts.
Ask one follow-up question at a time to gather more context before giving a full plan.
When you have enough context, give:
1. Allocation (percent split of the amount)
2. Concrete actions to take
3. Mistakes to avoid"""


def _build_profile_context(profile: dict) -> str:
    return (
        f"Age: {profile.get('age', 'N/A')}, "
        f"Monthly Income: Rs.{profile.get('monthly_income', 'N/A')}, "
        f"Tax Bracket: {profile.get('tax_bracket', 'N/A')}%, "
        f"Risk Profile: {profile.get('risk_profile', 'moderate')}, "
        f"Existing Investments: Rs.{profile.get('existing_investments', 0)}, "
        f"Amount Involved: Rs.{profile.get('amount_involved', 0)}"
    )


def life_event_start(data) -> dict:
    profile_ctx = _build_profile_context(data.profile)

    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"User Profile: {profile_ctx}\n"
        f"Life Event: {data.event}\n\n"
        "Open the conversation with a warm greeting acknowledging the event and "
        "ask one focused follow-up question to understand their current situation better."
    )

    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    return {"message": response.text.strip()}


def life_event_chat(data) -> dict:
    profile_ctx = _build_profile_context(data.profile)

    history_text = "\n".join(
        f"{m['role'].capitalize()}: {m['content']}"
        for m in data.messages
    )

    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"User Profile: {profile_ctx}\n"
        f"Life Event: {data.event}\n\n"
        f"Conversation so far:\n{history_text}\n\n"
        "Continue the conversation as the financial advisor. "
        "If you now have enough context, provide the full allocation plan. "
        "Otherwise, ask the next most important follow-up question."
    )

    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    return {"message": response.text.strip()}