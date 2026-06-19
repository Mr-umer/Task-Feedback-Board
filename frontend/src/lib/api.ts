const API_BASE = "http://localhost:8000/api";

export interface Issue {
  id: number;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Done";
  created_at: string;
}

export type CreateIssueData = Omit<Issue, "id" | "created_at">;

export async function fetchIssues(): Promise<Issue[]> {
  const res = await fetch(`${API_BASE}/issues/`);
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export async function createIssue(data: CreateIssueData): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errors = await res.json();
    throw new Error(JSON.stringify(errors));
  }
  return res.json();
}

export async function updateIssueStatus(
  id: number,
  status: Issue["status"]
): Promise<Issue> {
  const res = await fetch(`${API_BASE}/issues/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update issue status");
  return res.json();
}
