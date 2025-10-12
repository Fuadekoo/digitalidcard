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
} from "lucide-react";
import { toast } from "sonner";
import useMutation from "@/hooks/useMutation";
import { getOrder, deleteOrder } from "@/actions/stationRegistral/order";
import { CreateOrderDialog, PaymentIntegration } from ".";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
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
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Create stable parameters for useData
  const queryParams = React.useMemo(
    () => ({
      search: globalFilter,
      currentPage: pagination.pageIndex + 1,
      row: pagination.pageSize,
      sort: true as boolean,
    }),
    [globalFilter, pagination.pageIndex, pagination.pageSize]
  );

  // Data fetching
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getOrder(queryParams);
      setData(result);
    } catch (error) {
      console.error("Error fetching order data:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => fetchData();

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
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteAction(orderId);
    }
  };

  // Table columns definition
  const columns: ColumnDef<Order>[] = React.useMemo(
    () => [
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
        header: "Citizen Name",
        cell: ({ row }) => {
          const citizen = row.getValue("citizen") as Order["citizen"];
          return (
            <div className="font-medium">
              {citizen.firstName} {citizen.lastName}
            </div>
          );
        },
      },
      {
        accessorKey: "citizen",
        header: "Registration No",
        cell: ({ row }) => {
          const citizen = row.getValue("citizen") as Order["citizen"];
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(order.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Order
                </DropdownMenuItem>
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
      <div className="flex items-center justify-between gap-4">
        <DataTableToolbar table={table} />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
    </DataTable>
  );
}
