import numpy as np
from openai import OpenAI
from app.config import settings

client = OpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

EMBED_MODEL = "text-embedding-3-small"

def generate_embeddings(chunks):
    embeddings = []

    for chunk in chunks:
        response = client.embeddings.create(
            model=EMBED_MODEL,
            input=chunk
        )
        vector = response.data[0].embedding
        embeddings.append(vector)

    return np.array(embeddings)

def embed_query(query: str):
    response = client.embeddings.create(
        model=EMBED_MODEL,
        input=query
    )
    return np.array([response.data[0].embedding])