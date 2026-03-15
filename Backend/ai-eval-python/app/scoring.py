"""
Deterministic project scoring based on:
- GitHub repository metrics (when repo_url is provided): stars, forks, size, languages
- Code quality / portfolio assessment criteria: documentation signals, tech depth, structure
No random scores; same inputs always yield the same outputs.
References: GitHub API repo/languages, SonarQube-style ratings, developer portfolio rubrics.
"""
import logging
import math
import re
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)

# GitHub API: 60 req/hr unauthenticated; set GITHUB_TOKEN for 5000/hr
GITHUB_API = "https://api.github.com"
REQUEST_TIMEOUT = 10.0

# Languages that indicate backend focus (GitHub language names)
BACKEND_LANGUAGES = {
    "python", "java", "go", "ruby", "c#", "c", "c++", "rust", "elixir", "php",
    "kotlin", "scala", "swift", "erlang", "clojure", "haskell", "node", "typescript",
}
# Languages that indicate frontend focus
FRONTEND_LANGUAGES = {
    "javascript", "typescript", "vue", "css", "scss", "html", "svelte",
}
# Languages often used in ML/AI
AI_LANGUAGES = {"python", "jupyter notebook", "r"}

# Keyword groups for description/title/tags (lowercase)
BACKEND_KEYWORDS = [
    "api", "backend", "server", "database", "postgres", "redis", "mysql", "graphql",
    "rest", "auth", "jwt", "nestjs", "fastapi", "django", "flask", "express",
    "microservice", "grpc", "message queue", "kafka", "rabbitmq",
]
FRONTEND_KEYWORDS = [
    "react", "vue", "angular", "frontend", "ui", "ux", "dashboard", "next",
    "spa", "responsive", "tailwind", "css", "component", "typescript", "javascript",
]
SYSTEM_DESIGN_KEYWORDS = [
    "architecture", "microservice", "scale", "scalable", "docker", "kubernetes",
    "aws", "gcp", "ci/cd", "deploy", "design", "distributed",
    "load balance", "cache", "cdn", "monitoring", "observability",
]
AI_KEYWORDS = [
    "ai", "ml", "machine learning", "deep learning", "neural", "model", "llm",
    "openai", "nlp", "tensorflow", "pytorch", "transformer", "embedding",
    "reinforcement", "computer vision", "nlp", "gpt", "clustering", "classification",
]


@dataclass
class RepoInfo:
    stars: int
    forks: int
    size_kb: int
    primary_language: Optional[str]
    languages: dict[str, int]  # lang -> bytes
    has_wiki: bool
    has_pages: bool
    open_issues: int
    default_branch: Optional[str]


def _parse_github_url(repo_url: Optional[str]) -> Optional[tuple[str, str]]:
    if not repo_url or not repo_url.strip():
        return None
    url = repo_url.strip().rstrip("/")
    if "github.com" not in url:
        return None
    try:
        parsed = urlparse(url)
        path = parsed.path.strip("/")
        parts = path.split("/")
        if len(parts) >= 2:
            owner, repo = parts[0], parts[1]
            if repo.endswith(".git"):
                repo = repo[:-4]
            return (owner, repo)
    except Exception:
        pass
    return None


def _fetch_repo(owner: str, repo: str, token: Optional[str]) -> Optional[dict]:
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            r = client.get(f"{GITHUB_API}/repos/{owner}/{repo}", headers=headers)
            if r.status_code == 200:
                return r.json()
    except Exception as e:
        logger.warning("GitHub repo fetch failed: %s", e)
    return None


def _fetch_languages(owner: str, repo: str, token: Optional[str]) -> dict[str, int]:
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            r = client.get(f"{GITHUB_API}/repos/{owner}/{repo}/languages", headers=headers)
            if r.status_code == 200:
                return r.json()
    except Exception as e:
        logger.warning("GitHub languages fetch failed: %s", e)
    return {}


def _repo_to_info(data: dict, languages: dict[str, int]) -> RepoInfo:
    primary = (data.get("language") or "").strip() or None
    total_bytes = sum(languages.values()) or 1
    return RepoInfo(
        stars=int(data.get("stargazers_count", 0) or 0),
        forks=int(data.get("forks_count", 0) or 0),
        size_kb=int(data.get("size", 0) or 0),
        primary_language=primary.lower() if primary else None,
        languages={k.lower(): v for k, v in languages.items()},
        has_wiki=bool(data.get("has_wiki")),
        has_pages=bool(data.get("has_pages")),
        open_issues=int(data.get("open_issues_count", 0) or 0),
        default_branch=data.get("default_branch"),
    )


def _keyword_score(text: str, keywords: list[str], max_score: int) -> int:
    """Each matching keyword adds a fixed amount; cap at max_score."""
    t = text.lower()
    count = sum(1 for k in keywords if k in t)
    if not keywords:
        return 0
    per_keyword = max(1, max_score // 5)
    return min(max_score, count * per_keyword)


def _engagement_score(stars: int, forks: int) -> int:
    """Map stars/forks to 0–25. Log scale to avoid huge repos dominating."""
    raw = math.log1p(stars * 2 + forks)
    return min(25, int(raw * 5))


def _description_depth(description: str) -> int:
    """0–15 from description length and structure (sentence count, bullets)."""
    if not description or not description.strip():
        return 0
    d = description.strip()
    length = len(d)
    sentences = max(1, len(re.split(r"[.!?]+", d)))
    bullets = len(re.findall(r"[-*•]\s+\w+", d)) + len(re.findall(r"\d+\.\s+\w+", d))
    score = 0
    if length >= 100:
        score += 5
    if length >= 300:
        score += 5
    if bullets >= 2 or sentences >= 3:
        score += 5
    return min(15, score)


def compute_scores(
    title: str,
    description: str,
    tags: list[str],
    repo_url: Optional[str],
    category: Optional[str],
    github_token: Optional[str],
) -> tuple[int, int, int, int, str, str]:
    """
    Returns (ai_score, backend_score, frontend_score, system_design_score, complexity_note, scalability_note).
    All scores 0–100, deterministic.
    """
    text = " ".join([(title or ""), (description or ""), (category or "")] + list(tags or [])).lower()
    repo_info: Optional[RepoInfo] = None
    gh_owner_repo = _parse_github_url(repo_url)
    if gh_owner_repo:
        owner, repo = gh_owner_repo
        repo_data = _fetch_repo(owner, repo, github_token)
        if repo_data:
            lang_data = _fetch_languages(owner, repo, github_token)
            repo_info = _repo_to_info(repo_data, lang_data)

    desc_depth = _description_depth(description or "")
    engagement = (
        _engagement_score(repo_info.stars, repo_info.forks) if repo_info else 0
    )
    has_repo_bonus = 15 if repo_info else 0

    # Backend: repo language + description keywords + engagement
    backend_kw = _keyword_score(text, BACKEND_KEYWORDS, 25)
    backend_lang = 0
    if repo_info and repo_info.primary_language:
        if repo_info.primary_language in BACKEND_LANGUAGES:
            backend_lang = 20
        elif repo_info.primary_language in FRONTEND_LANGUAGES:
            backend_lang = 5
    elif repo_info and repo_info.languages:
        for lang in repo_info.languages:
            if lang in BACKEND_LANGUAGES:
                backend_lang = max(backend_lang, 15)
                break
    backend_score = min(100, backend_kw + backend_lang + engagement + has_repo_bonus + desc_depth)

    # Frontend: language + keywords
    frontend_kw = _keyword_score(text, FRONTEND_KEYWORDS, 30)
    frontend_lang = 0
    if repo_info and repo_info.languages:
        for lang in repo_info.languages:
            if lang in FRONTEND_LANGUAGES:
                frontend_lang = 25
                break
    if repo_info and repo_info.primary_language and repo_info.primary_language in FRONTEND_LANGUAGES:
        frontend_lang = 25
    frontend_score = min(100, frontend_kw + frontend_lang + (has_repo_bonus // 2) + desc_depth)

    # System design: multi-language repo, size, keywords
    system_kw = _keyword_score(text, SYSTEM_DESIGN_KEYWORDS, 35)
    system_repo = 0
    if repo_info:
        if len(repo_info.languages) >= 2:
            system_repo += 15
        if repo_info.size_kb > 100:
            system_repo += 10
        if repo_info.has_wiki or repo_info.has_pages:
            system_repo += 5
    system_design_score = min(100, system_kw + system_repo + engagement + has_repo_bonus)

    # AI: Python/ML languages + keywords
    ai_kw = _keyword_score(text, AI_KEYWORDS, 40)
    ai_lang = 0
    if repo_info and repo_info.languages:
        for lang in repo_info.languages:
            if lang in AI_LANGUAGES:
                ai_lang = 25
                break
    if repo_info and repo_info.primary_language and repo_info.primary_language in AI_LANGUAGES:
        ai_lang = 25
    ai_score = min(100, ai_kw + ai_lang + (has_repo_bonus // 2) + desc_depth)

    # Notes: deterministic summary
    parts = []
    if repo_info:
        parts.append(f"Repo: {repo_info.stars} stars, {repo_info.forks} forks.")
        if repo_info.primary_language:
            parts.append(f"Primary language: {repo_info.primary_language}.")
    else:
        parts.append("No GitHub repo linked; scores based on description and tags only.")
    if desc_depth >= 10:
        parts.append("Description has good structure.")
    complexity_note = " ".join(parts)

    scale_parts = []
    if repo_info and len(repo_info.languages) >= 2:
        scale_parts.append("Multi-language codebase suggests modular design.")
    if system_kw > 15:
        scale_parts.append("Description mentions architecture or scalability.")
    scalability_note = " ".join(scale_parts) if scale_parts else "Add architecture details and repo for better assessment."

    return (
        max(0, min(100, ai_score)),
        max(0, min(100, backend_score)),
        max(0, min(100, frontend_score)),
        max(0, min(100, system_design_score)),
        complexity_note.strip() or None,
        scalability_note.strip() or None,
    )
