import CitizenCreatePage from "@/features/citizen/components/citizen-create-page";
import PageContainer from "@/components/layout/page-container";

export const metadata = {
  title: "Dashboard: Register New Citizen",
};

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  return (
    <PageContainer scrollable={true}>
      <CitizenCreatePage lang={lang} />
    </PageContainer>
  );
}
