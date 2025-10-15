"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import {
  getFilteredCitizenCardByDate,
  aproveCitizenCard,
  rejectCitizenCard,
} from "@/actions/stationPrintral/citizenCard";
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
  Check,
  X,
  User,
  Phone,
  Calendar as CalendarIcon,
  IdCard,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  Search,
  CalendarDays,
  Filter,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

// Citizen Card data type
export type CitizenCard = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  orderType: string;
  createdAt: Date;
  citizen: {
    id: string;
    registralNo: string;
    firstName: string;
    middleName: string;
    lastName: string;
    phone: string;
    profilePhoto: string | null;
  };
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          variant: "default" as const,
          icon: CheckCircle,
          className:
            "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        };
      case "REJECTED":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          className:
            "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        };
      case "PENDING":
        return {
          variant: "secondary" as const,
          icon: AlertCircle,
          className:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        };
      default:
        return {
          variant: "outline" as const,
          icon: Clock,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {status}
    </Badge>
  );
};

// Order type badge component
const OrderTypeBadge = ({ type }: { type: string }) => {
  return (
    <Badge variant={type === "URGENT" ? "destructive" : "outline"}>
      {type === "URGENT" ? "🚨 URGENT" : "📋 NORMAL"}
    </Badge>
  );
};

// Main Citizen Card Listing Component
export default function CitizenCardListingPage({ lang }: { lang: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Memoize query parameters
  const queryParams = React.useMemo(
    () => ({
      search: searchQuery,
      startDate: dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
      endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      currentPage: pagination.pageIndex + 1,
      row: pagination.pageSize,
      sort: false,
    }),
    [searchQuery, dateRange, pagination.pageIndex, pagination.pageSize]
  );

  // Data fetching
  const [data, isLoading, refresh] = useData(
    getFilteredCitizenCardByDate,
    () => {},
    queryParams
  );

  // Approve citizen card mutation
  const [approveMutation, isApproving] = useMutation(
    async (orderId: string) => {
      const result = await aproveCitizenCard(orderId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Citizen card approved successfully!");
        refresh();
        setApproveDialogOpen(false);
        setSelectedOrderId(null);
      } else {
        toast.error(result.message || "Failed to approve citizen card");
      }
    }
  );

  // Reject citizen card mutation
  const [rejectMutation, isRejecting] = useMutation(
    async (orderId: string) => {
      const result = await rejectCitizenCard(orderId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Citizen card rejected successfully!");
        refresh();
        setRejectDialogOpen(false);
        setSelectedOrderId(null);
      } else {
        toast.error(result.message || "Failed to reject citizen card");
      }
    }
  );

  const handleApproveClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setRejectDialogOpen(true);
  };

  const handleApproveConfirm = () => {
    if (selectedOrderId) {
      approveMutation(selectedOrderId);
    }
  };

  const handleRejectConfirm = () => {
    if (selectedOrderId) {
      rejectMutation(selectedOrderId);
    }
  };

  // Transform data to match CitizenCard type
  const transformedData = React.useMemo(() => {
    if (!data?.list) {
      return [];
    }
    return data.list.map((order: any) => ({
      ...order,
    }));
  }, [data]);

  // Table columns definition
  const columns: ColumnDef<CitizenCard>[] = React.useMemo(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order Details",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{order.orderNumber}</div>
                <div className="text-xs text-muted-foreground">
                  Order ID: {order.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "citizen",
        header: "Citizen Information",
        cell: ({ row }) => {
          const { citizen } = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={citizen.profilePhoto || ""}
                  alt={citizen.firstName}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  {citizen.firstName.charAt(0)}
                  {citizen.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">
                  {citizen.firstName} {citizen.middleName} {citizen.lastName}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <IdCard className="h-3 w-3" />
                  {citizen.registralNo}
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
          const { citizen } = row.original;
          return (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{citizen.phone}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "orderType",
        header: "Priority",
        cell: ({ row }) => {
          const type = row.getValue("orderType") as string;
          return <OrderTypeBadge type={type} />;
        },
      },
      {
        accessorKey: "orderStatus",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("orderStatus") as string;
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Order Date",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              <div>
                <div className="text-sm">{date.toLocaleDateString()}</div>
                <div className="text-xs text-muted-foreground">
                  {date.toLocaleTimeString()}
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
          const order = row.original;
          const isPending = order.orderStatus === "PENDING";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(order.id)}
                >
                  Copy Order ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/generateCard/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Card
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/generateCard/${order.id}`}>
                    <Printer className="mr-2 h-4 w-4" />
                    Generate Card
                  </Link>
                </DropdownMenuItem>
                {isPending && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleApproveClick(order.id)}
                      className="text-green-600 dark:text-green-400"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve Order
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRejectClick(order.id)}
                      className="text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject Order
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [lang]
  );

  // Table configuration
  const table = useReactTable({
    data: transformedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setSearchQuery,
    onPaginationChange: setPagination,
    state: {
      globalFilter: searchQuery,
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil((data?.totalData || 0) / pagination.pageSize),
  });

  // Show loading only if we're actually loading and have no data
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">Loading citizen cards...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-2">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={
                    dateRange?.from || dateRange?.to ? "default" : "outline"
                  }
                  className={`w-[280px] justify-start text-left font-normal ${
                    !dateRange?.from &&
                    !dateRange?.to &&
                    "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">
                      Filter by Date Range
                    </h4>
                    {(dateRange?.from || dateRange?.to) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDateRange(undefined);
                          setIsDatePickerOpen(false);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      if (range?.from && range?.to) {
                        setIsDatePickerOpen(false);
                      }
                    }}
                    numberOfMonths={2}
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear All Filters Button */}
            {(searchQuery || dateRange?.from || dateRange?.to) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDateRange(undefined);
                }}
                className="px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        {(searchQuery || dateRange?.from || dateRange?.to) && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="h-3 w-3" />
                  Search: "{searchQuery}"
                </Badge>
              )}
              {dateRange?.from && dateRange?.to && (
                <Badge variant="secondary" className="gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {format(dateRange.from, "MMM dd")} -{" "}
                  {format(dateRange.to, "MMM dd, yyyy")}
                </Badge>
              )}
              {dateRange?.from && !dateRange?.to && (
                <Badge variant="secondary" className="gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  From: {format(dateRange.from, "MMM dd, yyyy")}
                </Badge>
              )}
              <span className="text-muted-foreground ml-2">
                • Showing {data?.totalData || 0} results
              </span>
            </div>
          </div>
        )}
      </div>

      <DataTable
        table={table}
        actionBar={
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/20"
            >
              📊 {data?.totalData || 0} Total Orders
            </Badge>
            <Badge variant="outline">
              ✅ {table.getFilteredSelectedRowModel().rows.length} Selected
            </Badge>
          </div>
        }
      >
        <DataTableToolbar table={table} />
      </DataTable>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Citizen Card Order
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this citizen card order? This
              will allow the card to be printed and issued to the citizen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={isApproving}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isApproving ? "Approving..." : "Approve Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Citizen Card Order
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this citizen card order? This
              action cannot be undone and the citizen will need to resubmit
              their application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              disabled={isRejecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRejecting ? "Rejecting..." : "Reject Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
