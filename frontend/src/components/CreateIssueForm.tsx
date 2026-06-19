"use client";

import { useState } from "react";
import { CreateIssueData, Issue } from "@/lib/api";

interface CreateIssueFormProps {
  onSubmit: (data: CreateIssueData) => Promise<void>;
}

interface FormErrors {
  title?: string;
  description?: string;
  general?: string;
}

export default function CreateIssueForm({ onSubmit }: CreateIssueFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Issue["priority"]>("Medium");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim() || title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters.";
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), priority });
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setIsExpanded(false);
    } catch (err) {
      try {
        const parsed = JSON.parse((err as Error).message);
        setErrors({
          title: parsed.title?.[0],
          description: parsed.description?.[0],
          general: !parsed.title && !parsed.description ? (err as Error).message : undefined,
        });
      } catch {
        setErrors({ general: (err as Error).message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500";
  const inputError = "border-rose-300 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/20";
  const inputNormal = "border-gray-200";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">New Issue</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="border-t border-gray-100 px-6 py-5 space-y-4">
          {errors.general && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="title" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputBase} ${errors.title ? inputError : inputNormal}`}
              placeholder="Brief summary of the issue"
            />
            {errors.title && <p className="mt-1.5 text-xs text-rose-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputBase} resize-none ${errors.description ? inputError : inputNormal}`}
              placeholder="Describe the issue in detail..."
            />
            {errors.description && <p className="mt-1.5 text-xs text-rose-600">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="priority" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
              Priority
            </label>
            <div className="flex gap-2">
              {(["Low", "Medium", "High"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    priority === p
                      ? p === "Low"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20"
                        : p === "Medium"
                        ? "border-amber-300 bg-amber-50 text-amber-700 ring-1 ring-amber-500/20"
                        : "border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-500/20"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Issue"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
