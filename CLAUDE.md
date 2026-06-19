# Task Feedback Board — Project Context

## Overview
A full-stack issue-tracking application built as a 1-hour AI coding challenge.
Team members submit technical issues and track their resolution progress.

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend  | Django REST Framework (DRF) |
| Database | PostgreSQL                  |

## Data Model — Issue

| Field        | Type     | Details                              |
|--------------|----------|--------------------------------------|
| title        | string   | Required                             |
| description  | string   | Required                             |
| priority     | enum     | Low, Medium, High                    |
| status       | enum     | Open, In Progress, Done              |
| created_at   | datetime | Auto-generated on creation           |

## API Endpoints

| Method  | Endpoint              | Purpose              |
|---------|-----------------------|----------------------|
| GET     | /api/issues/          | List all issues      |
| POST    | /api/issues/          | Create a new issue   |
| PATCH   | /api/issues/{id}/     | Update issue status  |

## Frontend Requirements
- Page displaying all issues (fetched from Django API)
- Form to create a new issue
- Control to change an issue's status
- Loading states while fetching/mutating
- Error states for failed requests
- Basic client-side validation
- Responsive: works on mobile and desktop

## Backend Requirements
- Django REST API for CRUD operations
- Server-side validation on model/serializer level
- Proper error responses (400 for validation, 404 for not found)

## Acceptance Criteria
1. Issues load from the Django API
2. User can create an issue from the Next.js frontend
3. User can update issue status
4. Invalid submissions show errors
5. Interface is responsive (mobile + desktop)
6. Code is organized and readable

## Project Structure (Planned)

```
task-feedback-board/
├── backend/                    # Django project
│   ├── manage.py
│   ├── config/                 # Django settings, urls
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── issues/                 # Issues app
│       ├── models.py           # Issue model
│       ├── serializers.py      # DRF serializers
│       ├── views.py            # API views (ViewSets)
│       ├── urls.py             # App-level routes
│       └── tests.py            # Backend tests
├── frontend/                   # Next.js project
│   ├── src/
│   │   ├── app/                # App router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Issue list page
│   │   │   └── globals.css
│   │   ├── components/         # Reusable components
│   │   │   ├── IssueList.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   ├── CreateIssueForm.tsx
│   │   │   └── StatusSelector.tsx
│   │   └── lib/                # API client, utils
│   │       └── api.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
└── CLAUDE.md                   # This file
```

## Conventions & Standards
- Step-by-step AI generation (not one-shot prompts)
- All generated code must be reviewed before committing
- Include validation and error handling at every layer
- Production-quality code, concise and readable
- At least one test (backend or frontend)
- Final refactor pass for code quality

## Key Decisions
- Django REST Framework ViewSets for clean CRUD abstraction
- Next.js App Router (modern approach)
- Tailwind CSS for rapid responsive styling
- PATCH for partial updates (status changes only)
- CORS enabled on Django for Next.js dev server
