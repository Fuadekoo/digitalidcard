import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { SuperPrinterCitizenCardListingPage } from "@/features/citizenCard";
import { cn } from "@/lib/utils";
import { CreditCard, Download, Globe } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import PageContainer from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard: Card Printing (Super Printer)",
  description: "Print approved citizen cards and manage print status across all stations.",
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
              title="Citizen Card Printing (All Stations)"
              description="Print approved citizen cards and manage print status across all stations."
            />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <CreditCard className="mr-1 h-3 w-3" />
                Card Management
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Globe className="mr-1 h-3 w-3" />
                Super Printer
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${lang}/dashboard/printralReport`}
              className={cn(buttonVariants({ variant: "outline" }), "text-xs md:text-sm")}
            >
              <Download className="mr-2 h-4 w-4" />
              View Report
            </Link>
          </div>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton 
              columnCount={9} 
              rowCount={10} 
              filterCount={3}
              withViewOptions={true}
            />
          }
        >
          <SuperPrinterCitizenCardListingPage lang={lang} />
        </Suspense>
      </div>
    </PageContainer>
  );
}