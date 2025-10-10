import CitizenCreatePage from "@/features/citizen/components/citizen-create-page";
import PageContainer from "@/components/layout/page-container";

export const metadata = {
  title: "Dashboard: Register New Citizen",
};

export default function Page() {
  return (
    <PageContainer scrollable={true}>
      <CitizenCreatePage />
    </PageContainer>
  );
}