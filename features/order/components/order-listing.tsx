"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Suspense } from "react";
import useMutation from "@/hooks/useMutation";
import { getOrder, deleteOrder } from "@/actions/stationRegistral/order";
import { CreateOrderDialog, PaymentIntegration } from ".";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [deleteAction, isDeleting] = useMutation(deleteOrder, (state) => {
    if (state?.status) {
      toast.success("Order deleted successfully");
      fetchOrders();
    } else {
      toast.error(state?.message || "Failed to delete order");
    }
  });

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const result = await getOrder({
        search: "",
        currentPage: 1,
        row: 100,
        sort: true,
      });

      if (result?.list) {
        setOrders(result.list as Order[]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Orders"
            description="Manage ID card orders and payments."
          />
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <div>Loading...</div>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <div className="flex items-start justify-between">
        <Heading
          title="Orders"
          description="Manage ID card orders and payments."
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-xs md:text-sm">
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
                fetchOrders();
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Separator />

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground">
                Create your first order to get started.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.citizen.firstName} {order.citizen.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.citizen.registralNo}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getOrderTypeBadge(order.orderType)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.orderStatus)}
                          {getStatusBadge(order.orderStatus)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{order.amount} ETB</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <button className="w-full text-left">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
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
                                  onPaymentSuccess={fetchOrders}
                                />
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <button className="w-full text-left">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Order
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(order.id)}
                              disabled={isDeleting}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
