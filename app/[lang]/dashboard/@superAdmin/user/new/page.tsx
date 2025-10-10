import FormCardSkeleton from "@/components/form-card-skeleton";
import PageContainer from "@/components/layout/page-container";
import { Suspense } from "react";
import UserCreatePage from "@/features/users/components/user-create-page";

export const metadata = {
  title: "Dashboard: Create User",
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          <UserCreatePage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
