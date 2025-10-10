"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import { getUser } from "@/actions/superAdmin/user";
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
  UserCheck,
  UserX,
  Key,
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
import useMutation from "@/hooks/useMutation";
import {
  blockUser,
  unblockUser,
  resetUserPassword,
} from "@/actions/superAdmin/user";

// User data type
export type User = {
  id: string;
  username: string;
  phone: string;
  role: string;
  status: string;
  isAdmin: boolean;
  isActive: boolean;
  stationId?: string;
  createdAt: Date;
};

// Main User Listing Component
export default function UserListingPage() {
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
      search: globalFilter,
      currentPage: pagination.pageIndex + 1,
      row: pagination.pageSize,
      sort: false, // false = desc, true = asc
    }),
    [globalFilter, pagination.pageIndex, pagination.pageSize]
  );

  // Data fetching
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getUser(queryParams);
      setData(result);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => fetchData();

  // Block user mutation
  const [blockUserMutation] = useMutation(
    async (userId: string) => {
      const result = await blockUser(userId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("User blocked successfully!");
        refresh();
      } else {
        toast.error(result.message || "Failed to block user");
      }
    }
  );

  // Unblock user mutation
  const [unblockUserMutation] = useMutation(
    async (userId: string) => {
      const result = await unblockUser(userId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("User unblocked successfully!");
        refresh();
      } else {
        toast.error(result.message || "Failed to unblock user");
      }
    }
  );

  // Reset password mutation
  const [resetPasswordMutation] = useMutation(
    async (userId: string) => {
      const result = await resetUserPassword(userId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Password reset successfully! New password: 123456");
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    }
  );

  const handleBlockUser = (userId: string) => {
    blockUserMutation(userId);
  };

  const handleUnblockUser = (userId: string) => {
    unblockUserMutation(userId);
  };

  const handleResetPassword = (userId: string) => {
    resetPasswordMutation(userId);
  };

  // Table columns definition
  const columns: ColumnDef<User>[] = React.useMemo(
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
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  role === "stationAdmin"
                    ? "destructive"
                    : role === "stationRegistral"
                    ? "default"
                    : role === "stationPrintral"
                    ? "secondary"
                    : "outline"
                }
              >
                {role === "stationAdmin" && "Station Admin"}
                {role === "stationRegistral" && "Station Registral"}
                {role === "stationPrintral" && "Station Printral"}
                {![
                  "stationAdmin",
                  "stationRegistral",
                  "stationPrintral",
                ].includes(role) && role}
              </Badge>
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
                    <Edit className="mr-2 h-4 w-4" />
                    Edit User
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.status === "ACTIVE" && user.isActive ? (
                  <DropdownMenuItem
                    onClick={() => handleBlockUser(user.id)}
                    className="text-destructive"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Block User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleUnblockUser(user.id)}
                    className="text-green-600"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Unblock User
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleBlockUser, handleUnblockUser, handleResetPassword]
  );

  // Transform data to match User type
  const transformedData = React.useMemo(() => {
    if (!data?.list) {
      return [];
    }
    return data.list.map((user: any) => ({
      ...user,
      stationId: user.stationId ?? undefined,
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
        <div className="text-muted-foreground">Loading users...</div>
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
            You need super admin privileges to view users.
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
