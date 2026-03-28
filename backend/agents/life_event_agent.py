import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def life_event_advice(data):
    prompt = f"""
    You are a financial advisor in India.

    User profile:
    Income: {data.monthly_income}
    Expenses: {data.monthly_expenses}
    Savings: {data.savings}

    Event: {data.event}
    Amount: {data.amount}

    Give:
    1. What should they do with this money
    2. Investment split
    3. Mistakes to avoid
    Keep it simple and practical.
    """

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)

    return {
        "advice": response.text
    }