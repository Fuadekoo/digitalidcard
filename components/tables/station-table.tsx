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

// Table columns definition
const columns: ColumnDef<Station>[] = [
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
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Station
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              View Reports
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Station
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Main Station Table Component
export function StationTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

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

  // Temporary: Test with direct data fetching
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Stations</h2>
            <p className="text-muted-foreground">
              Manage all stations in the system
            </p>
          </div>
          <Button disabled>
            <Users className="mr-2 h-4 w-4" />
            Add Station
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading stations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stations</h2>
          <p className="text-muted-foreground">
            Manage all stations in the system
          </p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Add Station
        </Button>
      </div>

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
    </div>
  );
}
