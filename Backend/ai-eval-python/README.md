# ProShare AI/ML Project Scoring (Python)

**Deterministic scoring only** — no random scores. Same project input always yields the same scores.

## How scoring works

Scores (0–100) are computed from:

1. **GitHub repository data** (when `repo_url` is a GitHub URL):
   - **Stars & forks** → engagement component (log scale)
   - **Primary language** → backend / frontend / AI dimension
   - **Languages list** → multi-language bonus for system design
   - **Size, has_wiki, has_pages** → structure signals

2. **Title, description, category, tags** (always):
   - **Keyword coverage** for each dimension (e.g. "api", "database", "react", "docker", "ml")
   - **Description depth**: length and structure (sentences, bullets) for documentation quality

3. **Rubric**
   - **Backend score**: backend-language repo + backend keywords + engagement + repo bonus + description depth
   - **Frontend score**: frontend-language repo + frontend keywords + description depth
   - **System design score**: architecture keywords + multi-language repo + size + engagement
   - **AI score**: ML/AI keywords + Python (or R) in repo + description depth

References: [GitHub API](https://docs.github.com/en/rest/repos/repos), [code quality metrics](https://docs.sonarsource.com/sonarqube-server/latest/user-guide/code-metrics/introduction), [developer portfolio assessment criteria](https://www.index.dev/blog/evaluate-freelance-developer-portfolio).

## Optional: OpenAI for notes only

If `OPENAI_API_KEY` is set, the service uses it only to **improve the two text notes** (complexity_note, scalability_note). **Scores are never from the model** — they always come from the rubric above.

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
# Optional: set GITHUB_TOKEN for higher GitHub API rate limit (5000/hr vs 60/hr)
uvicorn app.main:app --reload --port 8000
```

## Docker

```bash
docker build -t proshare-ai-eval .
docker run -p 8000:8000 -e GITHUB_TOKEN=ghp_xxx -e OPENAI_API_KEY=sk-xxx proshare-ai-eval
```

## API

- **POST /evaluate** — Body: `{ "title", "description", "repo_url?", "category?", "tags"? }`  
  Returns: `{ ai_score, backend_score, frontend_score, system_design_score, complexity_note?, scalability_note? }`
- **GET /health** — Health check

The NestJS backend calls this service when `AI_EVAL_SERVICE_URL` is set.
