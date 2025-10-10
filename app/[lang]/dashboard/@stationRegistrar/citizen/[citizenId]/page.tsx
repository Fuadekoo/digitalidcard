import CitizenDetailPage from "@/features/citizen/components/citizen-detail-page";
import PageContainer from "@/components/layout/page-container";

export const metadata = {
  title: "Dashboard: Citizen Details",
};

interface PageProps {
  params: {
    citizenId: string;
  };
}

export default function Page({ params }: PageProps) {
  return (
    <PageContainer scrollable={true}>
      <CitizenDetailPage citizenId={params.citizenId} />
    </PageContainer>
  );
}