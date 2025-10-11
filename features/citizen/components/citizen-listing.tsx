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
import { deleteCitizen } from "@/actions/stationRegistral/citizen";
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
                  <span className="sr-only">Open menu</span>
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
