import os
import json
import re
import anthropic
from models.schemas import GenerateRequest, Question

LANGUAGE_NAMES = {
    "fr": "français",
    "en": "anglais",
    "es": "espagnol",
    "ar": "arabe",
}

DIFFICULTY_NAMES = {
    "easy": "facile",
    "medium": "moyen",
    "hard": "difficile",
    "expert": "expert",
}


def build_prompt(req: GenerateRequest) -> str:
    lang = LANGUAGE_NAMES.get(req.language, req.language)
    diff = DIFFICULTY_NAMES.get(req.difficulty, req.difficulty)
    fmt_desc = "QCM avec 4 options (A, B, C, D)" if req.format == "qcm" else "réponse ouverte courte"
    emoji_instruction = "Utilise des emojis pertinents dans les questions." if req.include_emojis else "N'utilise pas d'emojis."
    explanation_instruction = (
        'Inclus un champ "explanation" avec une explication courte et intéressante (1-2 phrases).'
        if req.include_explanation
        else 'Omets le champ "explanation" ou laisse-le null.'
    )
    context_block = f"\nContexte supplémentaire : {req.context}" if req.context else ""

    return f"""Tu es un expert en création de contenu TikTok spécialisé dans les quiz et devinettes viraux.

Génère exactement {req.count} question(s) de quiz sur le sujet : {req.topic}.{context_block}

Paramètres :
- Langue : {lang}
- Difficulté : {diff}
- Format : {fmt_desc}
- {emoji_instruction}
- {explanation_instruction}
- Style : TikTok, accrocheur, engageant, avec un petit suspense

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ni après, dans ce format exact :

{{
  "questions": [
    {{
      "question": "Texte de la question ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "Explication courte et intéressante.",
      "difficulty": "{req.difficulty}"
    }}
  ]
}}

Règles importantes :
- Le champ "answer" doit être EXACTEMENT identique à l'une des options (si QCM)
- Questions originales, pas de questions trop évidentes
- Niveau de difficulté cohérent avec "{diff}"
- Toutes les réponses en {lang}
- Si format ouvert, "options" doit être null ou absent
"""


def parse_questions_from_response(text: str) -> list[Question]:
    """Extract and parse JSON from Claude's response, handling markdown code blocks."""
    # Strip markdown code blocks if present
    cleaned = re.sub(r"```(?:json)?\s*", "", text).strip()
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()

    data = json.loads(cleaned)
    questions = []
    for item in data.get("questions", []):
        questions.append(Question(
            question=item["question"],
            options=item.get("options"),
            answer=item["answer"],
            explanation=item.get("explanation"),
            difficulty=item.get("difficulty"),
        ))
    return questions


async def generate_questions(req: GenerateRequest) -> list[Question]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY n'est pas configurée")

    client = anthropic.Anthropic(api_key=api_key)
    prompt = build_prompt(req)

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    content = message.content[0].text
    return parse_questions_from_response(content)
