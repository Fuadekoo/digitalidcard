"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import { getStationUser } from "@/actions/superAdmin/station";
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
  UserCheck,
  UserX,
  Phone,
  Calendar,
  User,
  Shield,
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

// Station User data type
export type StationUser = {
  id: string;
  username: string;
  phone: string;
  role: string;
  status: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
};

interface StationUserListingProps {
  stationId: string;
}

// Main Station User Listing Component
export default function StationUserListing({
  stationId,
}: StationUserListingProps) {
  const { data: session } = useSession();
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Check if user is super admin
  const isSuperAdmin = session?.user?.role === "superAdmin";

  // Create stable parameters for useData
  const queryParams = React.useMemo(
    () => ({
      stationId,
      search: globalFilter,
      currentPage: pagination.pageIndex + 1,
      row: pagination.pageSize,
      sort: "desc", // desc or asc
    }),
    [stationId, globalFilter, pagination.pageIndex, pagination.pageSize]
  );

  // Data fetching
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching station users with params:", queryParams);
      const result = await getStationUser(queryParams);
      console.log("Station users result:", result);
      setData(result);
    } catch (error) {
      console.error("Error fetching station user data:", error);
      toast.error("Failed to load station users");
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => fetchData();

  // Transform data to match StationUser type
  const transformedData = React.useMemo(() => {
    console.log("Transforming data:", data);
    if (!data?.list) {
      return [];
    }
    return data.list.map((user: any) => ({
      ...user,
    }));
  }, [data]);

  // Table columns definition
  const columns: ColumnDef<StationUser>[] = React.useMemo(
    () => [
      {
        accessorKey: "username",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">{user.username}</div>
                <div className="text-xs text-muted-foreground">
                  ID: {user.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Contact",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{user.phone}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          const isAdmin = row.original.isAdmin;

          // Map old roles to new ones for display
          let displayRole = role;
          let badgeVariant:
            | "destructive"
            | "default"
            | "secondary"
            | "outline" = "outline";

          if (
            role === "stationAdmin" ||
            role === "admin" ||
            role === "superAdmin"
          ) {
            displayRole = "Station Admin";
            badgeVariant = "destructive";
          } else if (role === "stationRegistral" || role === "user") {
            displayRole = "Station Registral";
            badgeVariant = "default";
          } else if (role === "stationPrintral") {
            displayRole = "Station Printral";
            badgeVariant = "secondary";
          }

          return (
            <div className="flex items-center gap-2">
              <Badge variant={badgeVariant}>{displayRole}</Badge>
              {isAdmin && <Shield className="h-3 w-3 text-primary" />}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const isActive = row.original.isActive;
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  status === "ACTIVE" && isActive ? "default" : "destructive"
                }
              >
                {status === "ACTIVE" && isActive ? "Active" : "Blocked"}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{date.toLocaleDateString()}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user.id)}
                >
                  Copy user ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/user/${user.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/user/${user.id}/edit`}>
                    <User className="mr-2 h-4 w-4" />
                    Edit User
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

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
        <div className="text-muted-foreground">Loading station users...</div>
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
            You need super admin privileges to view station users.
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
