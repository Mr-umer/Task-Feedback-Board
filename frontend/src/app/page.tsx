"use client";

import { useEffect, useState, useCallback } from "react";
import { Issue, CreateIssueData, fetchIssues, createIssue, updateIssueStatus } from "@/lib/api";
import CreateIssueForm from "@/components/CreateIssueForm";
import IssueList from "@/components/IssueList";

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchIssues();
      setIssues(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleCreate = async (data: CreateIssueData) => {
    const newIssue = await createIssue(data);
    setIssues((prev) => [newIssue, ...prev]);
  };

  const handleStatusChange = async (id: number, status: Issue["status"]) => {
    try {
      const updated = await updateIssueStatus(id, status);
      setIssues((prev) => prev.map((issue) => (issue.id === id ? updated : issue)));
    } catch (err) {
      setError(`Failed to update status: ${(err as Error).message}`);
    }
  };

  const openCount = issues.filter((i) => i.status === "Open").length;
  const inProgressCount = issues.filter((i) => i.status === "In Progress").length;
  const doneCount = issues.filter((i) => i.status === "Done").length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Task Feedback Board</h1>
              <p className="text-sm text-gray-500">Submit and track team technical issues</p>
            </div>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{openCount}</p>
                <p className="text-xs text-gray-500">Open</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{doneCount}</p>
                <p className="text-xs text-gray-500">Done</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <CreateIssueForm onSubmit={handleCreate} />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Issues</h2>
            {!loading && !error && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {issues.length} total
              </span>
            )}
          </div>
          <IssueList
            issues={issues}
            loading={loading}
            error={error}
            onStatusChange={handleStatusChange}
          />
        </section>
      </div>
    </main>
  );
}
