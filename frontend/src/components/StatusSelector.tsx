"use client";

import { Issue } from "@/lib/api";

interface StatusSelectorProps {
  currentStatus: Issue["status"];
  onChange: (status: Issue["status"]) => void;
  disabled?: boolean;
}

const statusConfig: Record<Issue["status"], { dot: string; bg: string }> = {
  Open: { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  "In Progress": { dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  Done: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function StatusSelector({
  currentStatus,
  onChange,
  disabled = false,
}: StatusSelectorProps) {
  const config = statusConfig[currentStatus];

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      <select
        value={currentStatus}
        onChange={(e) => onChange(e.target.value as Issue["status"])}
        disabled={disabled}
        className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${config.bg}`}
      >
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>
    </div>
  );
}
