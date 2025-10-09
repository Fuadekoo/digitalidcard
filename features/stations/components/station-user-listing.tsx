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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MoreHorizontal,
  Eye,
  UserPlus,
  Shield,
  UserCheck,
  UserX,
  Phone,
  Calendar,
  ArrowLeft,
  User,
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

// Station User data type
export type StationUser = {
  id: string;
  username: string;
  phone: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface StationUserListingProps {
  stationId: string;
}

// Table columns definition
const createColumns = (
  isSuperAdmin: boolean,
  stationId: string
): ColumnDef<StationUser>[] => [
  {
    accessorKey: "username",
    header: "User",
    cell: ({ row }) => {
      const username = row.getValue("username") as string;
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
            <span className="text-sm font-semibold text-primary">
              {username?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground truncate">
              {username || "Unknown"}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {row.original.id?.slice(0, 8)}...
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
      const phone = row.getValue("phone") as string;
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
            <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-mono text-sm font-medium">
              {phone || "No phone"}
            </div>
            <div className="text-xs text-muted-foreground">Phone</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const getRoleConfig = (role: string) => {
        switch (role) {
          case "stationAdmin":
            return {
              variant: "default" as const,
              label: "Station Admin",
              icon: Shield,
              className:
                "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
            };
          case "stationRegistrar":
            return {
              variant: "secondary" as const,
              label: "Registrar",
              icon: UserPlus,
              className:
                "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
            };
          case "stationPrinter":
            return {
              variant: "outline" as const,
              label: "Printer",
              icon: FileText,
              className:
                "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
            };
          default:
            return {
              variant: "secondary" as const,
              label: role,
              icon: User,
              className:
                "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800",
            };
        }
      };

      const config = getRoleConfig(role);
      const IconComponent = config.icon;

      return (
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${config.className}`}
          >
            <IconComponent className="h-4 w-4" />
          </div>
          <Badge
            variant={config.variant}
            className={`text-xs font-medium ${config.className}`}
          >
            {config.label}
          </Badge>
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
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              isActive
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}
          >
            {isActive ? (
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <Badge
              variant={isActive ? "default" : "destructive"}
              className={`text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">{status}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "isAdmin",
    header: "Admin",
    cell: ({ row }) => {
      const isAdmin = row.getValue("isAdmin") as boolean;
      return (
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              isAdmin
                ? "bg-purple-100 dark:bg-purple-900/20"
                : "bg-gray-100 dark:bg-gray-900/20"
            }`}
          >
            {isAdmin ? (
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div>
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className={`text-xs font-medium ${
                isAdmin
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800"
              }`}
            >
              {isAdmin ? "Admin" : "User"}
            </Badge>
          </div>
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
          <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {date.toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      const canManage = isSuperAdmin;

      return (
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                User Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
                className="text-xs"
              >
                <User className="mr-2 h-3 w-3" />
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link
                href={`/dashboard/station/${stationId}/stationUser/${user.id}`}
              >
                <DropdownMenuItem className="text-xs">
                  <Eye className="mr-2 h-3 w-3" />
                  View Details
                </DropdownMenuItem>
              </Link>
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs">
                    {user.isActive ? (
                      <>
                        <UserX className="mr-2 h-3 w-3" />
                        Deactivate User
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-3 w-3" />
                        Activate User
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

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
      sort: "desc",
    }),
    [stationId, globalFilter, pagination.pageIndex, pagination.pageSize]
  );

  // Data fetching
  const [data, isLoading, refresh] = useData(getStationUser, null, queryParams);
  // Transform data to match StationUser type
  const transformedData = React.useMemo(() => {
    if (!data?.list) {
      return [];
    }

    const users = data.list as any[];
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));
  }, [data]);

  // Create columns with role checking
  const columns = React.useMemo(
    () => createColumns(isSuperAdmin, stationId),
    [isSuperAdmin, stationId]
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
    manualPagination: false, // Use client-side pagination for now
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  // Show access denied message for non-super admin users
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/station/${stationId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Station
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Station Users</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 mx-auto text-destructive" />
              <div className="text-destructive text-lg font-semibold">
                Access Denied
              </div>
              <p className="text-muted-foreground">
                You need super admin privileges to view station users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state - only if we have an error and no data
  if (!isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/station/${stationId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Station
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Station Users</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-destructive text-lg font-semibold">
                Error Loading Users
              </div>
              <p className="text-muted-foreground">
                Failed to load station users. Please try again.
              </p>
              <Button onClick={refresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/station/${stationId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Station
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Station Users</h1>
            <p className="text-muted-foreground">
              Manage users for this station
            </p>
          </div>
        </div>
        {/* <div className="flex gap-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data?.totalData || 0}
            </div>
            <p className="text-xs text-muted-foreground">All station users</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {transformedData.filter((user) => user.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {transformedData.filter((user) => user.isAdmin).length}
            </div>
            <p className="text-xs text-muted-foreground">Admin privileges</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registrars
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {
                transformedData.filter(
                  (user) => user.role === "stationRegistrar"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Registration staff</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            table={table}
            actionBar={
              <div className="flex items-center gap-2 px-6 py-3 border-t bg-muted/30">
                <Badge variant="secondary" className="text-xs">
                  {table.getFilteredSelectedRowModel().rows.length} selected
                </Badge>
                <Button variant="outline" size="sm" className="text-xs">
                  <FileText className="mr-2 h-3 w-3" />
                  Export Selected
                </Button>
              </div>
            }
          >
            <DataTableToolbar table={table} />
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}
