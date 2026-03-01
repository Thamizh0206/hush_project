from app.services.embedding_service import generate_embeddings, embed_query
from app.services.chunk_service import chunk_text
from app.services.vector_store import VectorStore
from app.services.llm_service import client
from app.config import settings
import json

def generate_rag_summary_and_quiz(content: str):
    chunks = chunk_text(content)

    embeddings = generate_embeddings(chunks)

    vector_store = VectorStore(dimension=embeddings.shape[1])
    vector_store.add(embeddings, chunks)

    query_embedding = embed_query("Generate summary and quiz")

    retrieved_chunks = vector_store.search(query_embedding)

    context = "\n\n".join(retrieved_chunks)

    prompt = f"""
Use ONLY the context below.

{context}

Generate:
1. Structured 1-page summary
2. 20 MCQs with answer + explanation

Return strictly JSON.
"""

    response = client.chat.completions.create(
        model=settings.MODEL,
        messages=[
            {"role": "system", "content": "You output strictly valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    output = response.choices[0].message.content

    return json.loads(output)