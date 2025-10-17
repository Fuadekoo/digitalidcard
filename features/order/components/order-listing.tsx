"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import useMutation from "@/hooks/useMutation";
import { getOrder, deleteOrder } from "@/actions/stationRegistral/order";
import { CreateOrderDialog, PaymentIntegration } from ".";
import { DataTable } from "@/components/ui/table/data-table";
import { useData } from "@/hooks/useData";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface OrderListingProps {
  lang: string;
}

export type Order = {
  id: string;
  orderNumber: string;
  orderType: string;
  orderStatus: "PENDING" | "APPROVED" | "REJECTED";
  paymentMethod: string;
  paymentReference: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  citizen: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    phone: string;
    registralNo: string;
  };
};

export function OrderListing({ lang }: OrderListingProps) {
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Create stable parameters for useData
  const queryParams = React.useMemo(
    () => ({
      search: searchInput,
      currentPage: pagination.pageIndex + 1,
      row: pagination.pageSize,
      sort: true as boolean,
    }),
    [searchInput, pagination.pageIndex, pagination.pageSize]
  );

  // Data fetching using useData hook
  const [data, isLoading, refresh] = useData(getOrder, null, queryParams);

  // Reset pagination when search changes
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchInput]);

  const [deleteAction, isDeleting] = useMutation(deleteOrder, (state) => {
    if (state?.status) {
      toast.success("Order deleted successfully");
      refresh();
    } else {
      toast.error(state?.message || "Failed to delete order");
    }
  });

  // Transform data to match Order type
  const transformedData = React.useMemo(() => {
    if (!data?.list) {
      return [];
    }
    return data.list.map((order: any) => ({
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
    }));
  }, [data]);

  // Helper functions for status and badges
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "APPROVED":
        return <Badge variant="default">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrderTypeBadge = (orderType: string) => {
    switch (orderType) {
      case "URGENT":
        return <Badge variant="destructive">Urgent</Badge>;
      case "NORMAL":
        return <Badge variant="outline">Normal</Badge>;
      default:
        return <Badge variant="secondary">{orderType}</Badge>;
    }
  };

  const handleDelete = async (orderId: string) => {
    await deleteAction(orderId);
  };

  // Table columns definition
  const columns: ColumnDef<Order>[] = React.useMemo(
    () => [
      {
        id: "rowNumber",
        header: "#",
        cell: ({ row }) => (
          <div className="font-medium text-muted-foreground">
            {pagination.pageIndex * pagination.pageSize + row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "orderNumber",
        header: "Order Number",
        cell: ({ row }) => (
          <div className="font-medium text-primary">
            {row.getValue("orderNumber")}
          </div>
        ),
      },
      {
        accessorKey: "citizen",
        id: "citizenName",
        header: "Citizen Name",
        cell: ({ row }) => {
          const citizen = row.original.citizen;
          return (
            <div className="font-medium">
              {citizen.firstName} {citizen.lastName}
            </div>
          );
        },
      },
      {
        accessorKey: "citizen",
        id: "citizenRegNo",
        header: "Registration No",
        cell: ({ row }) => {
          const citizen = row.original.citizen;
          return (
            <div className="text-muted-foreground">{citizen.registralNo}</div>
          );
        },
      },
      {
        accessorKey: "orderType",
        header: "Order Type",
        cell: ({ row }) => getOrderTypeBadge(row.getValue("orderType")),
      },
      {
        accessorKey: "orderStatus",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("orderStatus") as string;
          return (
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              {getStatusBadge(status)}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("amount")} ETB</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div className="text-muted-foreground">
              {date.toLocaleDateString()}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const order = row.original;

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
                  onClick={() => navigator.clipboard.writeText(order.id)}
                >
                  Copy order ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button className="w-full text-left">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button className="w-full text-left">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Order
                  </button>
                </DropdownMenuItem>
                {order.orderStatus === "PENDING" && (
                  <DropdownMenuItem asChild>
                    <PaymentIntegration
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                      amount={order.amount}
                      orderType={order.orderType}
                      citizenName={`${order.citizen.firstName} ${order.citizen.lastName}`}
                      citizenId={order.citizen.id}
                      lang={lang}
                      onPaymentSuccess={refresh}
                    />
                  </DropdownMenuItem>
                )}
                {order.orderStatus === "PENDING" && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Order
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Order</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete order{" "}
                            <span className="font-semibold text-primary">
                              {order.orderNumber}
                            </span>{" "}
                            for{" "}
                            <span className="font-semibold">
                              {order.citizen.firstName} {order.citizen.lastName}
                            </span>
                            ?
                            <br />
                            <br />
                            This action cannot be undone and will permanently
                            remove the order from the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(order.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Order
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [lang, handleDelete]
  );

  // Table configuration
  const table = useReactTable({
    data: transformedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil((data?.totalData || 0) / pagination.pageSize),
  });

  // Show loading only if we're actually loading and have no data
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading orders...</div>
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
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by order number, citizen name, or registration number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Select a citizen and create a new ID card order.
                </DialogDescription>
              </DialogHeader>
              <CreateOrderDialog
                lang={lang}
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  refresh();
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Table Toolbar */}
        <DataTableToolbar table={table} />
      </div>
    </DataTable>
  );
}
