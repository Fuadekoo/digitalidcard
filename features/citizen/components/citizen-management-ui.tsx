"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import { 
  getFilteredCitizensByDate,
  verifyCitizen,
  unVerifyCitizen,
  deleteCitizen 
} from "@/actions/stationAdmin/citizen";
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
  Phone,
  Calendar as CalendarIcon,
  IdCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
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

// Citizen data type
type Citizen = {
  id: string;
  registralNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  profilePhoto: string | null;
  isVerified: string;
  createdAt: Date;
  stationCitizen: {
    code: string;
    afanOromoName: string | null;
    amharicName: string | null;
  };
  order: {
    id: string;
    orderStatus: string;
  }[];
};

// Verification status badge component
const VerificationBadge = ({ status }: { status: string }) => {
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

// Main Citizen Management Component
export default function CitizenManagementUI({ lang }: { lang: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [unverifyDialogOpen, setUnverifyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);

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
    getFilteredCitizensByDate,
    () => {},
    queryParams
  );

  // Verify citizen mutation
  const [verifyMutation, isVerifying] = useMutation(
    async (citizenId: string) => {
      const result = await verifyCitizen(citizenId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Citizen verified successfully!");
        refresh();
        setVerifyDialogOpen(false);
        setSelectedCitizenId(null);
      } else {
        toast.error(result.message || "Failed to verify citizen");
      }
    }
  );

  // Unverify citizen mutation
  const [unverifyMutation, isUnverifying] = useMutation(
    async (citizenId: string) => {
      const result = await unVerifyCitizen(citizenId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Citizen unverified successfully!");
        refresh();
        setUnverifyDialogOpen(false);
        setSelectedCitizenId(null);
      } else {
        toast.error(result.message || "Failed to unverify citizen");
      }
    }
  );

  // Delete citizen mutation
  const [deleteMutation, isDeleting] = useMutation(
    async (citizenId: string) => {
      const result = await deleteCitizen(citizenId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Citizen deleted successfully!");
        refresh();
        setDeleteDialogOpen(false);
        setSelectedCitizenId(null);
      } else {
        toast.error(result.message || "Failed to delete citizen");
      }
    }
  );

  const handleVerifyClick = (citizenId: string) => {
    setSelectedCitizenId(citizenId);
    setVerifyDialogOpen(true);
  };

  const handleUnverifyClick = (citizenId: string) => {
    setSelectedCitizenId(citizenId);
    setUnverifyDialogOpen(true);
  };

  const handleDeleteClick = (citizenId: string) => {
    setSelectedCitizenId(citizenId);
    setDeleteDialogOpen(true);
  };

  const handleVerifyConfirm = () => {
    if (selectedCitizenId) {
      verifyMutation(selectedCitizenId);
    }
  };

  const handleUnverifyConfirm = () => {
    if (selectedCitizenId) {
      unverifyMutation(selectedCitizenId);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedCitizenId) {
      deleteMutation(selectedCitizenId);
    }
  };

  // Transform data
  const transformedData = React.useMemo(() => {
    if (!data?.list) {
      return [];
    }
    return data.list as Citizen[];
  }, [data]);

  // Table columns definition
  const columns: ColumnDef<Citizen>[] = React.useMemo(
    () => [
      {
        accessorKey: "registralNo",
        header: "Citizen Details",
        cell: ({ row }) => {
          const citizen = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IdCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{citizen.registralNo}</div>
                <div className="text-xs text-muted-foreground">
                  ID: {citizen.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "citizen",
        header: "Personal Information",
        cell: ({ row }) => {
          const citizen = row.original;
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
                  <Phone className="h-3 w-3" />
                  {citizen.phone}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "stationCitizen",
        header: "Station",
        cell: ({ row }) => {
          const station = row.original.stationCitizen;
          return (
            <div>
              <div className="text-sm font-medium">
                {station.afanOromoName || station.amharicName || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">{station.code}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "isVerified",
        header: "Verification Status",
        cell: ({ row }) => {
          const status = row.getValue("isVerified") as string;
          return <VerificationBadge status={status} />;
        },
      },
      {
        accessorKey: "order",
        header: "Orders",
        cell: ({ row }) => {
          const orders = row.getValue("order") as Citizen["order"];
          return (
            <div>
              <Badge variant="outline">
                📋 {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Registration Date",
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
          const citizen = row.original;
          const isVerified = citizen.isVerified === "APPROVED";
          const hasOrders = citizen.order.length > 0;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Citizen Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(citizen.id)}
                >
                  Copy Citizen ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/citizenManagement/${citizen.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isVerified && (
                  <DropdownMenuItem
                    onClick={() => handleVerifyClick(citizen.id)}
                    className="text-green-600 dark:text-green-400"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Verify Citizen
                  </DropdownMenuItem>
                )}
                {isVerified && (
                  <DropdownMenuItem
                    onClick={() => handleUnverifyClick(citizen.id)}
                    className="text-orange-600 dark:text-orange-400"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Unverify Citizen
                  </DropdownMenuItem>
                )}
                {!hasOrders && (
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(citizen.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Citizen
                  </DropdownMenuItem>
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
    manualFiltering: true,
    pageCount: Math.ceil((data?.totalData || 0) / pagination.pageSize),
  });

  // Show loading only if we're actually loading and have no data
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">Loading citizens...</div>
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
                placeholder="Search by name, phone, registral number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination({ ...pagination, pageIndex: 0 });
                }}
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
                            setPagination({ ...pagination, pageIndex: 0 });
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
                        if (!range) {
                          setDateRange(undefined);
                          return;
                        }
                        
                        if (dateRange?.from && dateRange?.to && range?.from && range?.to) {
                          const isSameDate = range.from.getTime() === range.to.getTime();
                          
                          if (isSameDate) {
                            setDateRange({ from: range.from, to: undefined });
                            return;
                          }
                        }
                        
                        if (range?.from && range?.to) {
                          const isSameDate = range.from.getTime() === range.to.getTime();
                          
                          if (isSameDate) {
                            setDateRange({ from: range.from, to: undefined });
                            return;
                          } else {
                            setDateRange(range);
                          }
                        } else if (range?.from && !range?.to) {
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
                              setPagination({ ...pagination, pageIndex: 0 });
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

        {/* Filter Summary */}
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
        
        {/* Date Selection Helper */}
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
              👥 {data?.totalData || 0} Total Citizens
            </Badge>
            <Badge variant="outline">
              ✅ {table.getFilteredSelectedRowModel().rows.length} Selected
            </Badge>
          </div>
        }
      >
        <DataTableToolbar table={table} />
      </DataTable>

      {/* Verify Confirmation Dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Verify Citizen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this citizen? This will mark them as approved and allow them to create orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyConfirm}
              disabled={isVerifying}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isVerifying ? "Verifying..." : "Verify Citizen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unverify Confirmation Dialog */}
      <AlertDialog open={unverifyDialogOpen} onOpenChange={setUnverifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-orange-600" />
              Unverify Citizen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unverify this citizen? This will mark them as rejected and prevent them from creating new orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnverifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnverifyConfirm}
              disabled={isUnverifying}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {isUnverifying ? "Unverifying..." : "Unverify Citizen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Citizen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this citizen? This action cannot be undone. Only citizens without orders can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Citizen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
