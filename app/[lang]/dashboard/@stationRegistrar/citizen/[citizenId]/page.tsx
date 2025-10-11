import CitizenDetailPage from "@/features/citizen/components/citizen-detail-page";
import PageContainer from "@/components/layout/page-container";

export const metadata = {
  title: "Dashboard: Citizen Details",
};

interface PageProps {
  params: Promise<{
    lang: string;
    citizenId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { lang, citizenId } = await params;
  return (
    <PageContainer scrollable={true}>
      <CitizenDetailPage citizenId={citizenId} lang={lang} />
    </PageContainer>
  );
}
