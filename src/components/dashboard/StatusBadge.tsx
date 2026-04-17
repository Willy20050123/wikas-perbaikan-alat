"use client";

import { type ReportStatus, formatStatus, getStatusClass } from "@/lib/report-helpers";

type StatusBadgeProps = {
  status: ReportStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold tracking-[0.16em] ${getStatusClass(
        status
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}