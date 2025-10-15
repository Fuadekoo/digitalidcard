"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import { getCitizen } from "@/actions/stationRegistral/citizen";
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
  User,
  Phone,
  Calendar,
  IdCard,
  ShieldCheck,
  ShieldX,
  XCircle,
  Clock,
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
import Link from "next/link";
import useMutation from "@/hooks/useMutation";
import {
  deleteCitizen,
  verifyCitizen,
  unVerifyCitizen,
} from "@/actions/stationAdmin/citizen";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Citizen data type
export type Citizen = {
  id: string;
  registralNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  phone: string;
  isVerified: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
};

// Main Citizen Listing Component
export default function CitizenListingPage({ lang }: { lang: string }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [citizenToDelete, setCitizenToDelete] = useState<string | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [citizenToVerify, setCitizenToVerify] = useState<{
    id: string;
    name: string;
    newStatus: string;
  } | null>(null);

  // Memoize query parameters
  const queryParams = React.useMemo(
    () => ({
      search: globalFilter,
      currentPage: pagination.pageIndex + 1,
      row: pagination.pageSize,
      sort: false,
    }),
    [globalFilter, pagination.pageIndex, pagination.pageSize]
  );

  // Data fetching
  const [data, isLoading, refresh] = useData(getCitizen, () => {}, queryParams);

  // Delete citizen mutation
  const [deleteCitizenMutation, isDeleting] = useMutation(
    async (citizenId: string) => {
      const result = await deleteCitizen(citizenId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Citizen deleted successfully!");
        refresh();
        setDeleteDialogOpen(false);
        setCitizenToDelete(null);
      } else {
        toast.error(result.message || "Failed to delete citizen");
      }
    }
  );

  const handleDeleteClick = (citizenId: string) => {
    setCitizenToDelete(citizenId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (citizenToDelete) {
      deleteCitizenMutation(citizenToDelete);
    }
  };

  const handleVerifyClick = (
    citizenId: string,
    name: string,
    newStatus: string
  ) => {
    setCitizenToVerify({ id: citizenId, name, newStatus });
    setVerifyDialogOpen(true);
  };

  // Update citizen status mutation
  const [verifyCitizenMutation, isVerifying] = useMutation(
    async (citizenId: string, newStatus: string) => {
      // Call the appropriate action based on status
      if (newStatus === "APPROVED") {
        return await verifyCitizen(citizenId);
      } else if (newStatus === "REJECTED" || newStatus === "PENDING") {
        return await unVerifyCitizen(citizenId);
      }
      return { status: false, message: "Invalid status" };
    },
    (result) => {
      if (result && result.status) {
        toast.success(result.message || "Status updated successfully");
        refresh();
        setVerifyDialogOpen(false);
        setCitizenToVerify(null);
      } else {
        toast.error(result?.message || "Failed to update verification status");
      }
    }
  );

  const handleVerifyConfirm = () => {
    if (citizenToVerify) {
      verifyCitizenMutation(citizenToVerify.id, citizenToVerify.newStatus);
    }
  };

  // Transform data to match Citizen type
  const transformedData = React.useMemo(() => {
    if (!data?.list) {
      return [];
    }
    return data.list.map((citizen: any) => ({
      ...citizen,
    }));
  }, [data]);

  // Table columns definition
  const columns: ColumnDef<Citizen>[] = React.useMemo(
    () => [
      {
        accessorKey: "registralNo",
        header: "Registration No",
        cell: ({ row }) => {
          const citizen = row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <IdCard className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">{citizen.registralNo}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "fullName",
        header: "Full Name",
        cell: ({ row }) => {
          const citizen = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium">
                  {citizen.firstName} {citizen.middleName} {citizen.lastName}
                </div>
                <div className="text-xs text-muted-foreground">
                  ID: {citizen.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => {
          const gender = row.getValue("gender") as string;
          return (
            <Badge variant={gender === "Male" ? "default" : "secondary"}>
              {gender}
            </Badge>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Contact",
        cell: ({ row }) => {
          const citizen = row.original;
          return (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{citizen.phone}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "isVerified",
        header: "Verification Status",
        cell: ({ row }) => {
          const citizen = row.original;
          const status = citizen.isVerified;

          // Display status with appropriate styling
          if (status === "APPROVED") {
            return (
              <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            );
          } else if (status === "REJECTED") {
            return (
              <Badge className="bg-red-500 hover:bg-red-600 text-white border-0">
                <XCircle className="h-3 w-3 mr-1" />
                Rejected
              </Badge>
            );
          } else {
            // PENDING status
            return (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            );
          }
        },
      },
      {
        accessorKey: "createdAt",
        header: "Registered",
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
          const citizen = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Actions</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Citizen Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(citizen.id)}
                >
                  Copy citizen ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/citizen/${citizen.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/citizen/${citizen.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Citizen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Verification Actions */}
                {citizen.isVerified !== "APPROVED" && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleVerifyClick(
                        citizen.id,
                        `${citizen.firstName} ${citizen.lastName}`,
                        "APPROVED"
                      )
                    }
                    className="text-green-600"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Approve Citizen
                  </DropdownMenuItem>
                )}
                {citizen.isVerified !== "REJECTED" && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleVerifyClick(
                        citizen.id,
                        `${citizen.firstName} ${citizen.lastName}`,
                        "REJECTED"
                      )
                    }
                    className="text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Citizen
                  </DropdownMenuItem>
                )}
                {citizen.isVerified !== "PENDING" && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleVerifyClick(
                        citizen.id,
                        `${citizen.firstName} ${citizen.lastName}`,
                        "PENDING"
                      )
                    }
                    className="text-orange-600"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Set to Pending
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {/* Delete Action */}
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(citizen.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Citizen
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
        <div className="text-muted-foreground">Loading citizens...</div>
      </div>
    );
  }

  const totalPages = Math.ceil((data?.totalData || 0) / pagination.pageSize);
  const currentPage = pagination.pageIndex + 1;

  return (
    <>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          {/* Page Info */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
            <div className="text-sm text-muted-foreground">•</div>
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium">
                {pagination.pageIndex * pagination.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  data?.totalData || 0
                )}
              </span>{" "}
              of <span className="font-medium">{data?.totalData || 0}</span>{" "}
              citizens
            </div>
          </div>

          {/* Page Controls */}
          <div className="flex items-center gap-2">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }
              disabled={currentPage === 1 || isLoading}
            >
              First
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1,
                }))
              }
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        pageIndex: pageNum - 1,
                      }))
                    }
                    disabled={isLoading}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1,
                }))
              }
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: totalPages - 1,
                }))
              }
              disabled={currentPage === totalPages || isLoading}
            >
              Last
            </Button>
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <select
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination({
                  pageIndex: 0,
                  pageSize: Number(e.target.value),
                })
              }
              className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {citizenToVerify?.newStatus === "APPROVED" && (
                <>
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  Approve Citizen
                </>
              )}
              {citizenToVerify?.newStatus === "REJECTED" && (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Citizen
                </>
              )}
              {citizenToVerify?.newStatus === "PENDING" && (
                <>
                  <Clock className="h-5 w-5 text-orange-600" />
                  Set to Pending
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {citizenToVerify?.newStatus === "APPROVED" && (
                <>
                  Are you sure you want to <strong>approve</strong>{" "}
                  <span className="font-semibold">{citizenToVerify?.name}</span>
                  ? This will mark the citizen as verified and they can proceed
                  with ID card generation.
                </>
              )}
              {citizenToVerify?.newStatus === "REJECTED" && (
                <>
                  Are you sure you want to <strong>reject</strong>{" "}
                  <span className="font-semibold">{citizenToVerify?.name}</span>
                  ? This will mark the citizen as rejected and they cannot
                  proceed with ID card generation.
                </>
              )}
              {citizenToVerify?.newStatus === "PENDING" && (
                <>
                  Are you sure you want to set{" "}
                  <span className="font-semibold">{citizenToVerify?.name}</span>{" "}
                  back to <strong>pending</strong> status? This will require
                  re-verification.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyConfirm}
              disabled={isVerifying}
              className={
                citizenToVerify?.newStatus === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : citizenToVerify?.newStatus === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {isVerifying
                ? "Processing..."
                : citizenToVerify?.newStatus === "APPROVED"
                ? "Approve"
                : citizenToVerify?.newStatus === "REJECTED"
                ? "Reject"
                : "Set to Pending"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              citizen record and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
