import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { CitizenCardListingPage } from "@/features/citizenCard";
import { cn } from "@/lib/utils";
import { CreditCard, Filter, Download } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import PageContainer from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard: Citizen Cards",
  description: "Manage citizen card orders and printing requests.",
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
          <div className="space-y-1">
            <Heading
              title="Citizen Card Orders"
              description="Review, approve, and manage citizen card printing requests."
            />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <CreditCard className="mr-1 h-3 w-3" />
                Card Management
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Filter className="mr-1 h-3 w-3" />
                Station Printer
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${lang}/dashboard/reports/cards`}
              className={cn(buttonVariants({ variant: "outline" }), "text-xs md:text-sm")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Link>
            <Link
              href={`/${lang}/dashboard/generateCard/bulk`}
              className={cn(buttonVariants(), "text-xs md:text-sm")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Bulk Print Cards
            </Link>
          </div>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton 
              columnCount={7} 
              rowCount={10} 
              filterCount={3}
              withViewOptions={true}
            />
          }
        >
          <CitizenCardListingPage lang={lang} />
        </Suspense>
      </div>
    </PageContainer>
  );
}