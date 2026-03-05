from app.services.llm_service import client
from app.config import settings
import json

def extract_topics(text: str):
    prompt = f"""
Analyze the following study material and extract 5-10 key topics.

Return strictly JSON:
{{
  "topics": ["Topic1", "Topic2", "Topic3"]
}}

Content:
{text[:4000]}
"""

    response = client.chat.completions.create(
        model=settings.MODELS[0],
        messages=[
            {"role": "system", "content": "Return strictly valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    try:
        content = response.choices[0].message.content
        # Basic cleanup in case of markdown fences
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)["topics"]
    except Exception as e:
        print(f"Topic extraction failed: {e}")
        return []
