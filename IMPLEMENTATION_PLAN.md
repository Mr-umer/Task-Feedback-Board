# Task Feedback Board — Implementation Plan

## Phase 1: Backend Setup (Django + DRF) — ~20 minutes

### 1.1 Project Initialization
```
task-feedback-board/
└── backend/
    ├── manage.py
    ├── requirements.txt
    ├── config/
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    └── issues/
        ├── models.py
        ├── serializers.py
        ├── views.py
        ├── urls.py
        └── tests.py
```

**Steps:**
1. Create Django project: `django-admin startproject config .`
2. Create issues app: `python manage.py startapp issues`
3. Install dependencies: `djangorestframework`, `django-cors-headers`, `psycopg2-binary`
4. Configure `settings.py`:
   - Add `rest_framework`, `corsheaders`, `issues` to INSTALLED_APPS
   - Configure CORS to allow Next.js dev server (localhost:3000)
   - Set up PostgreSQL database connection
   - Configure REST framework defaults

### 1.2 Issue Model (`issues/models.py`)
```python
class Issue(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Done', 'Done'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
```

**Key decisions:**
- Use `CharField` with choices for priority/status (simple, explicit)
- `auto_now_add=True` for created_at (automatic, immutable)
- No user authentication (challenge scope)

### 1.3 Serializer (`issues/serializers.py`)
```python
class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['id', 'title', 'description', 'priority', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters")
        return value
    
    def validate_description(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters")
        return value
```

**Validation rules:**
- Title: required, min 3 chars
- Description: required, min 10 chars
- Priority: required, must be in choices
- Status: defaults to 'Open', must be in choices if provided

### 1.4 Views (`issues/views.py`)
```python
class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all().order_by('-created_at')
    serializer_class = IssueSerializer
    http_method_names = ['get', 'post', 'patch']  # No PUT/DELETE for this challenge
```

**Design choices:**
- Use `ModelViewSet` for clean CRUD abstraction
- Order by `-created_at` (newest first)
- Restrict to GET/POST/PATCH only (matches API spec)

### 1.5 URL Routing
**`config/urls.py`:**
```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('issues.urls')),
]
```

**`issues/urls.py`:**
```python
router = DefaultRouter()
router.register(r'issues', IssueViewSet)
urlpatterns = [
    path('', include(router.urls)),
]
```

### 1.6 Database Setup
```bash
# Create PostgreSQL database
createdb task_feedback_board

# Run migrations
python manage.py makemigrations issues
python manage.py migrate
```

### 1.7 Backend Tests (`issues/tests.py`)
```python
class IssueModelTest(TestCase):
    def test_create_issue(self):
        issue = Issue.objects.create(
            title='Test Issue',
            description='Test description',
            priority='High',
            status='Open'
        )
        self.assertEqual(issue.title, 'Test Issue')
        self.assertEqual(issue.status, 'Open')

class IssueAPITest(TestCase):
    def test_create_issue_api(self):
        data = {
            'title': 'API Test',
            'description': 'API test description',
            'priority': 'Medium'
        }
        response = self.client.post('/api/issues/', data)
        self.assertEqual(response.status_code, 201)
```

---

## Phase 2: Frontend Setup (Next.js + TypeScript + Tailwind) — ~20 minutes

### 2.1 Project Initialization
```bash
npx create-next-app@latest frontend --typescript --tailwind --app
```

**Structure:**
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── IssueList.tsx
│   │   ├── IssueCard.tsx
│   │   ├── CreateIssueForm.tsx
│   │   └── StatusSelector.tsx
│   └── lib/
│       └── api.ts
├── tailwind.config.ts
└── package.json
```

### 2.2 API Client (`src/lib/api.ts`)
```typescript
const API_BASE = 'http://localhost:8000/api';

export interface Issue {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Done';
  created_at: string;
}

export async function fetchIssues(): Promise<Issue[]> {
  const res = await fetch(`${API_BASE}/issues/`);
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
}

export async function createIssue(data: Omit<Issue, 'id' | 'created_at'>): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errors = await res.json();
    throw new Error(JSON.stringify(errors));
  }
  return res.json();
}

export async function updateIssueStatus(id: number, status: Issue['status']): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update issue');
  return res.json();
}
```

### 2.3 Components

**`IssueCard.tsx`** — Displays single issue with status selector
- Props: `issue: Issue`, `onStatusChange: (id, status) => void`
- Shows title, description, priority badge, status dropdown, created date
- Priority color coding: Low=green, Medium=yellow, High=red

**`StatusSelector.tsx`** — Dropdown for status changes
- Props: `currentStatus`, `onChange`
- Three options: Open, In Progress, Done

**`CreateIssueForm.tsx`** — Form with validation
- Fields: title (input), description (textarea), priority (select)
- Client-side validation (title ≥3 chars, description ≥10 chars)
- Loading state during submission
- Error display for validation failures

**`IssueList.tsx`** — Container component
- Fetches issues on mount
- Loading spinner while fetching
- Error message on failure
- Maps over issues, renders `IssueCard` for each

### 2.4 Main Page (`src/app/page.tsx`)
```typescript
'use client';

export default function Home() {
  // State: issues, loading, error
  // Fetch issues on mount
  // Render CreateIssueForm + IssueList
  // Handle create and status change
}
```

**Layout:**
- Header with title
- Create form at top
- Issue list below
- Responsive grid (mobile: stack, desktop: side-by-side or full-width)

### 2.5 Styling (Tailwind)
- Use utility classes for rapid styling
- Responsive breakpoints: `md:` for desktop layouts
- Color scheme: neutral background, colored priority badges
- Loading states: spinner or skeleton
- Error states: red border/text

### 2.6 Frontend Tests (optional, if time permits)
- Test `CreateIssueForm` validation
- Test API client error handling

---

## Phase 3: Integration & Testing — ~10 minutes

### 3.1 Start Services
```bash
# Terminal 1: Django backend
cd backend
python manage.py runserver

# Terminal 2: Next.js frontend
cd frontend
npm run dev
```

### 3.2 Test Scenarios
1. **Happy path**: Create issue → appears in list → change status → updates
2. **Validation errors**: Submit empty form → see errors
3. **Network errors**: Stop backend → see error state on frontend
4. **Responsive**: Resize browser → layout adapts

### 3.3 Debug Common Issues
- CORS errors: Check Django `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
- 404 on API: Verify URLs match `/api/issues/`
- Form not submitting: Check network tab for request/response

---

## Phase 4: Refinement & Code Review — ~10 minutes

### 4.1 Code Quality Checks
- Remove console.logs
- Add TypeScript types everywhere (no `any`)
- Ensure all error states handled
- Check for accessibility (labels, aria attributes)

### 4.2 Refactoring Opportunities
- Extract shared types to `types.ts`
- Move hardcoded strings to constants
- Add loading skeletons instead of spinners (if time)

### 4.3 Final Review
- Does it meet all acceptance criteria?
- Is code organized and readable?
- Are validation and error handling present at every layer?

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| PostgreSQL not available | Fall back to SQLite for challenge |
| CORS issues | Use `django-cors-headers` with explicit origins |
| Time pressure | Skip tests, focus on core functionality |
| API integration bugs | Test backend with curl first, then frontend |

---

## Success Criteria Checklist
- [ ] Django API serves `/api/issues/` (GET, POST, PATCH)
- [ ] Next.js page displays issues from API
- [ ] Form creates issues with validation
- [ ] Status updates via PATCH
- [ ] Loading/error states present
- [ ] Responsive on mobile + desktop
- [ ] Code is clean and organized
