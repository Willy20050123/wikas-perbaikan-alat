import ReportForm from "@/src/components/reports/ReportForm";

export default function CreateReportPage() {
  return (
    <ReportForm
      mode="create"
      headerBackHref="/dashboard/user"
      headerBackLabel="Kembali ke Dashboard"
    />
  );
}
