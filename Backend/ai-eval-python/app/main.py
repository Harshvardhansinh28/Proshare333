"""
ProShare AI/ML Project Scoring Service (Python).
Deterministic scoring: GitHub repo metrics + rubric-based description/tags analysis.
No random scores. Optional: OpenAI can enrich complexity/scalability notes only.
"""
import os
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.scoring import compute_scores

app = FastAPI(title="ProShare AI Eval", version="1.0.0")


class ProjectInput(BaseModel):
    title: str
    description: str
    repo_url: Optional[str] = None
    category: Optional[str] = None
    tags: list[str] = Field(default_factory=list)


class ScoreOutput(BaseModel):
    ai_score: int = Field(ge=0, le=100)
    backend_score: int = Field(ge=0, le=100)
    frontend_score: int = Field(ge=0, le=100)
    system_design_score: int = Field(ge=0, le=100)
    complexity_note: Optional[str] = None
    scalability_note: Optional[str] = None


def _enrich_notes_with_openai(
    title: str,
    description: str,
    repo_url: Optional[str],
    complexity_note: str,
    scalability_note: str,
) -> tuple[str, str]:
    """Optionally use OpenAI to improve only the two text notes; scores stay from rubric."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or not api_key.strip():
        return complexity_note, scalability_note
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        prompt = (
            f"Given this project: title={title}, description={description}, repo={repo_url or 'N/A'}. "
            f"Current notes: complexity={complexity_note}, scalability={scalability_note}. "
            "In 1-2 sentences each, suggest a brief complexity_note and scalability_note. "
            "Return only a JSON object with keys: complexityNote, scalabilityNote (strings)."
        )
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": prompt}],
        )
        content = resp.choices[0].message.content if resp.choices else None
        if content:
            import json
            raw = json.loads(content)
            return (
                str(raw.get("complexityNote", complexity_note)) or complexity_note,
                str(raw.get("scalabilityNote", scalability_note)) or scalability_note,
            )
    except Exception:
        pass
    return complexity_note, scalability_note


@app.post("/evaluate", response_model=ScoreOutput)
def evaluate(project: ProjectInput) -> ScoreOutput:
    """
    Evaluate a project using deterministic rubric:
    - GitHub API (stars, forks, languages, size) when repo_url is provided
    - Keyword and structure analysis on title, description, tags
    Same inputs always produce the same scores. Optional: OpenAI enriches notes only.
    """
    github_token = os.getenv("GITHUB_TOKEN", "").strip() or None
    ai_score, backend_score, frontend_score, system_design_score, complexity_note, scalability_note = compute_scores(
        title=project.title,
        description=project.description,
        tags=project.tags or [],
        repo_url=project.repo_url,
        category=project.category,
        github_token=github_token,
    )
    complexity_note = complexity_note or ""
    scalability_note = scalability_note or ""
    complexity_note, scalability_note = _enrich_notes_with_openai(
        project.title,
        project.description,
        project.repo_url,
        complexity_note,
        scalability_note,
    )
    return ScoreOutput(
        ai_score=ai_score,
        backend_score=backend_score,
        frontend_score=frontend_score,
        system_design_score=system_design_score,
        complexity_note=complexity_note or None,
        scalability_note=scalability_note or None,
    )


@app.get("/health")
def health():
    return {"status": "ok"}
