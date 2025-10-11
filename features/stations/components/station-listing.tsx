"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import { getStation } from "@/actions/superAdmin/station";
import { type ColumnDef } from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { deleteStation } from "@/actions/superAdmin/station";

// Station data type
export type Station = {
  id: string;
  code: string;
  afanOromoName: string;
  amharicName: string;
  stationAdminName: string;
  stampPhoto?: string;
  signPhoto?: string;
  createdAt: Date;
};

// Main Station Listing Component
export default function StationListingPage() {
  const { data: session } = useSession();
  const { lang } = useParams<{ lang: string }>();
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Handle delete station
  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("Are you sure you want to delete this station? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await deleteStation(stationId);
      if (result.status) {
        toast.success(result.message || "Station deleted successfully");
        refresh();
      } else {
        toast.error(result.message || "Failed to delete station");
      }
    } catch (error) {
      console.error("Error deleting station:", error);
      toast.error("An error occurred while deleting the station");
    }
  };

  // Table columns definition
  const columns: ColumnDef<Station>[] = React.useMemo(() => [
    {
      accessorKey: "code",
      header: "Station Code",
      cell: ({ row }) => (
        <div className="font-medium text-primary">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "amharicName",
      header: "Station Name (Amharic)",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("amharicName")}</div>
      ),
    },
    {
      accessorKey: "afanOromoName",
      header: "Station Name (Oromo)",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("afanOromoName")}</div>
      ),
    },
    {
      accessorKey: "stationAdminName",
      header: "Admin Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("stationAdminName")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const station = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(station.id)}
              >
                Copy station ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/dashboard/station/${station.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/dashboard/station/${station.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Station
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/dashboard/station/${station.id}/stationUser`}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/dashboard/reportData?stationId=${station.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Reports
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDeleteStation(station.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Station
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [lang, handleDeleteStation]);

  // Check if user is super admin
  const isSuperAdmin = session?.user?.role === "superAdmin";

  // Create stable parameters for useData
  const queryParams = React.useMemo(
    () => ({
      search: globalFilter,
      currentPage: pagination.pageIndex + 1,
      row: pagination.pageSize,
      sort: "desc",
    }),
    [globalFilter, pagination.pageIndex, pagination.pageSize]
  );

  // Data fetching
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getStation(queryParams);
      setData(result);
    } catch (error) {
      console.error("Error fetching station data:", error);
      toast.error("Failed to load stations");
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => fetchData();

  // Transform data to match Station type
  const transformedData = React.useMemo(() => {
    if (!data?.list) {
      return [];
    }
    return data.list.map((station: any) => ({
      ...station,
      stampPhoto: station.stampPhoto ?? undefined,
      signPhoto: station.signPhoto ?? undefined,
    }));
  }, [data]);

  // Table configuration
  const table = useReactTable({
    data: transformedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      globalFilter,
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil((data?.totalData || 0) / pagination.pageSize),
  });

  // Show loading only if we're actually loading and have no data
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading stations...</div>
      </div>
    );
  }

  // Show access denied message for non-super admin users
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">
            Access Denied
          </div>
          <p className="text-muted-foreground">
            You need super admin privileges to view stations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      table={table}
      actionBar={
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {table.getFilteredSelectedRowModel().rows.length} selected
          </Badge>
          <Button variant="outline" size="sm">
            Export Selected
          </Button>
        </div>
      }
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
