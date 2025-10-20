import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import CitizenListingPage from "@/features/citizen/components/citizen-listing";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import PageContainer from "@/components/layout/page-container";
import CitizenRegistrationFormDownload from "@/components/citizen-registration-form-download";
import CitizenRegistrationFormPreview from "@/components/citizen-registration-form-preview";

export const metadata = {
  title: "Dashboard: Citizens",
};

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Citizens"
            description="Manage citizen registrations and information."
          />
          <div className="flex items-center gap-2">
            <CitizenRegistrationFormPreview />
            <CitizenRegistrationFormDownload />
            <Link
              href={`/${lang}/dashboard/citizen/new`}
              className={cn(buttonVariants(), "text-xs md:text-sm")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Register New Citizen
            </Link>
          </div>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <CitizenListingPage lang={lang} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
