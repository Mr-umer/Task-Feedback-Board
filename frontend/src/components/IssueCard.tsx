"use client";

import { Issue } from "@/lib/api";
import StatusSelector from "./StatusSelector";

interface IssueCardProps {
  issue: Issue;
  onStatusChange: (id: number, status: Issue["status"]) => void;
}

const priorityConfig: Record<Issue["priority"], { border: string; badge: string; icon: string }> = {
  Low: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    icon: "↓",
  },
  Medium: {
    border: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    icon: "→",
  },
  High: {
    border: "border-l-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
    icon: "↑",
  },
};

const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function IssueCard({ issue, onStatusChange }: IssueCardProps) {
  const config = priorityConfig[issue.priority];

  return (
    <div
      className={`group relative rounded-lg border border-gray-200 border-l-4 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 ${config.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {issue.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500 line-clamp-2">
            {issue.description}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.badge}`}
        >
          <span>{config.icon}</span>
          {issue.priority}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <StatusSelector
          currentStatus={issue.status}
          onChange={(status) => onStatusChange(issue.id, status)}
        />
        <span className="text-xs text-gray-400">{timeAgo(issue.created_at)}</span>
      </div>
    </div>
  );
}
