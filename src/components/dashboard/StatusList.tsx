"use client";

import StatusCard, { type StatusReportItem } from "./StatusCard";

type StatusListProps = {
  reports: StatusReportItem[];
};

export default function StatusList({ reports }: StatusListProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.06] p-10 text-center text-white/65">
        Kamu belum memiliki laporan yang dikirim.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <StatusCard key={report.id} report={report} />
      ))}
    </div>
  );
}