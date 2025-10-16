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
  // User,
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
  // CalendarDays,
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
  isPrinted: boolean;
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
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
      // Only send dates when BOTH from and to are selected
      startDate: dateRange?.from && dateRange?.to
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
      endDate: dateRange?.from && dateRange?.to 
        ? format(dateRange.to, "yyyy-MM-dd") 
        : undefined,
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
        toast.success("Citizen card marked as printed successfully!");
        refresh();
        setApproveDialogOpen(false);
        setSelectedOrderId(null);
      } else {
        toast.error(result.message || "Failed to mark citizen card as printed");
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
        toast.success("Print request rejected successfully!");
        refresh();
        setRejectDialogOpen(false);
        setSelectedOrderId(null);
      } else {
        toast.error(result.message || "Failed to reject print request");
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        header: "Payment Status",
        cell: ({ row }) => {
          const status = row.getValue("orderStatus") as string;
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: "isPrinted",
        header: "Print Status",
        cell: ({ row }) => {
          const isPrinted = row.getValue("isPrinted") as boolean;
          return isPrinted ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="mr-1 h-3 w-3" />
              Printed
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <Printer className="mr-1 h-3 w-3" />
              Not Printed
            </Badge>
          );
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
          const isNotPrinted = !order.isPrinted;

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
                    Generate & Print Card
                  </Link>
                </DropdownMenuItem>
                {isNotPrinted && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleApproveClick(order.id)}
                      className="text-green-600 dark:text-green-400"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Printed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRejectClick(order.id)}
                      className="text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject Print
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    manualPagination: true,
    manualFiltering: true, // Server-side filtering
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
      <div className="flex flex-col gap-3 mb-3">
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
                  variant={dateRange?.from && dateRange?.to ? "default" : "outline"}
                  className={`w-[280px] justify-start text-left font-normal ${
                    (!dateRange?.from || !dateRange?.to) && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from && dateRange?.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : dateRange?.from && !dateRange?.to ? (
                    <span className="text-orange-600">
                      {format(dateRange.from, "LLL dd, y")} - Select end date
                    </span>
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 max-h-[600px] overflow-auto" align="start">
                <div className="p-0 max-w-[95vw]">
                  {/* Quick Date Presets */}
                  <div className="p-3 border-b bg-muted/30 overflow-y-auto max-h-[200px]">
                    <h4 className="font-medium text-sm mb-3 flex items-center justify-between">
                      <span>Quick Filters</span>
                      {(dateRange?.from || dateRange?.to) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDateRange(undefined);
                          }}
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                      )}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          setDateRange({ from: today, to: today });
                          setIsDatePickerOpen(false);
                          setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        className="text-xs"
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const yesterday = new Date(today);
                          yesterday.setDate(yesterday.getDate() - 1);
                          setDateRange({ from: yesterday, to: yesterday });
                          setIsDatePickerOpen(false);
                          setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        className="text-xs"
                      >
                        Yesterday
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const lastWeek = new Date(today);
                          lastWeek.setDate(lastWeek.getDate() - 7);
                          setDateRange({ from: lastWeek, to: today });
                          setIsDatePickerOpen(false);
                          setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        className="text-xs"
                      >
                        Last 7 Days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const lastMonth = new Date(today);
                          lastMonth.setDate(lastMonth.getDate() - 30);
                          setDateRange({ from: lastMonth, to: today });
                          setIsDatePickerOpen(false);
                          setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        className="text-xs"
                      >
                        Last 30 Days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                          setDateRange({ from: firstDayOfMonth, to: today });
                          setIsDatePickerOpen(false);
                          setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        className="text-xs"
                      >
                        This Month
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                          setDateRange({ from: lastMonthStart, to: lastMonthEnd });
                          setIsDatePickerOpen(false);
                          setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        className="text-xs"
                      >
                        Last Month
                      </Button>
                    </div>
                  </div>

                  {/* Custom Date Range Selection */}
                  <div className="p-3 overflow-x-auto">
                    <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                      Or select custom range
                    </h4>
                    <div className="overflow-x-auto">
                      <Calendar
                      mode="range"
                      defaultMonth={dateRange?.from || new Date()}
                      selected={dateRange}
                      onSelect={(range) => {
                        // Handle date range selection properly
                        if (!range) {
                          setDateRange(undefined);
                          return;
                        }
                        
                        // If there's already a complete range and user clicks a new date, start fresh
                        if (dateRange?.from && dateRange?.to && range?.from && range?.to) {
                          const isSameDate = range.from.getTime() === range.to.getTime();
                          
                          if (isSameDate) {
                            // User clicked a single date - start new range selection
                            setDateRange({ from: range.from, to: undefined });
                            return;
                          }
                        }
                        
                        // Check if from and to are the same date (first click)
                        if (range?.from && range?.to) {
                          const isSameDate = range.from.getTime() === range.to.getTime();
                          
                          if (isSameDate) {
                            // Single click - only set the start date
                            setDateRange({ from: range.from, to: undefined });
                            return;
                          } else {
                            // Two different dates selected - complete range
                            setDateRange(range);
                          }
                        } else if (range?.from && !range?.to) {
                          // Only from is set
                          setDateRange({ from: range.from, to: undefined });
                        }
                      }}
                      numberOfMonths={2}
                      modifiers={{
                        today: new Date(),
                      }}
                      modifiersClassNames={{
                        today: "bg-accent/50 font-bold underline",
                      }}
                      />
                    </div>
                    {dateRange?.from && !dateRange?.to && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                          <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                          <div className="text-xs">
                            <div className="font-medium text-orange-700 dark:text-orange-400">
                              Start: {format(dateRange.from, "MMM dd, yyyy")}
                            </div>
                            <div className="text-orange-600/80 dark:text-orange-400/80">
                              Click another date to complete the range
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {dateRange?.from && dateRange?.to && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 p-2 mb-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <div className="text-xs">
                            <div className="font-medium text-green-700 dark:text-green-400">
                              Range Selected
                            </div>
                            <div className="text-green-600/80 dark:text-green-400/80">
                              {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDateRange(undefined);
                            }}
                            size="sm"
                          >
                            Change
                          </Button>
                          <Button
                            onClick={() => {
                              setIsDatePickerOpen(false);
                              setPagination({ ...pagination, pageIndex: 0 });
                            }}
                            size="sm"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear All Filters Button */}
            {(searchQuery || (dateRange?.from && dateRange?.to)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDateRange(undefined);
                  setPagination({ ...pagination, pageIndex: 0 });
                }}
                className="px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Filter Summary - Only show when filters are actually active */}
        {(searchQuery || (dateRange?.from && dateRange?.to)) && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="h-3 w-3" />
                  Search: &quot;{searchQuery}&quot;
                </Badge>
              )}
              {dateRange?.from && dateRange?.to && (
                <Badge variant="secondary" className="gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                </Badge>
              )}
              <span className="text-muted-foreground ml-2">
                • Showing {data?.totalData || 0} results
              </span>
            </div>
          </div>
        )}
        
        {/* Date Selection Helper Message */}
        {dateRange?.from && !dateRange?.to && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <div className="text-sm text-orange-800 dark:text-orange-300">
              <strong>Date selection in progress:</strong> Start date selected ({format(dateRange.from, "MMM dd, yyyy")}). Please select an end date to apply the date filter.
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateRange(undefined)}
              className="ml-auto text-orange-600 hover:text-orange-700"
            >
              <X className="h-4 w-4" />
            </Button>
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
              Mark Card as Printed
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this citizen card as printed? This
              will update the print status and assign you as the printer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={isApproving}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isApproving ? "Marking as Printed..." : "Mark as Printed"}
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
              Reject Print Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this print request? This will mark
              the card as not printed and remove the printer assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              disabled={isRejecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRejecting ? "Rejecting..." : "Reject Print"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
