def determine_difficulty(mastery_score: float) -> str:
    """
    Determine quiz difficulty based on mastery percentage.
    If mastery > 80% → Hard
    If mastery 50–80% → Medium
    If mastery < 50% → Easy
    """
    if mastery_score > 80:
        return "Hard"
    elif mastery_score > 50:
        return "Medium"
    else:
        return "Easy"

def get_quiz_prompt(context: str, difficulty: str) -> str:
    """Generate the refined prompt for the LLM based on difficulty."""
    return (
        f"You are an expert educational tutor. Study this text and generate a summary and a {difficulty} level quiz.\n\n"
        "TEXT CONTENT:\n"
        f"{context}\n\n"
        "REQUIREMENTS:\n"
        "1. 'summary': A concise 3-5 sentence explanation of the main points.\n"
        f"2. 'questions': A list of exactly 10 {difficulty} level Multiple Choice Questions.\n"
        "   Each MUST have:\n"
        "   - 'question': the query text\n"
        "   - 'options': A list of exactly 4 strings. EACH string MUST start with the letter for that option (e.g., 'A) ...', 'B) ...', 'C) ...', 'D) ...')\n"
        "   - 'answer': A single letter (A, B, C, or D)\n"
        "   - 'explanation': a brief reason why that answer is correct\n\n"
        "IMPORTANT: Output ONLY a valid JSON object. No extra text or markdown formatting."
    )

def get_topic_focused_prompt(topic: str) -> str:
    """Generate a prompt for a quiz focused on a specific weak topic."""
    return (
        f"You are an expert tutor helping a student with a specific weak area: '{topic}'.\n\n"
        f"Based on our previous study material, generate exactly 5 focused Multiple Choice Questions specifically on '{topic}'.\n\n"
        "REQUIREMENTS:\n"
        "1. 'questions': A list of exactly 5 MCQs.\n"
        "   Each MUST have:\n"
        "   - 'question': the query text\n"
        "   - 'options': A list of exactly 4 strings starting with 'A) ', 'B) ', etc.\n"
        "   - 'answer': A single letter (A, B, C, or D)\n"
        "   - 'explanation': why this answer is correct for this specific topic\n\n"
        "IMPORTANT: Output ONLY a valid JSON object. No extra text or markdown formatting."
    )
