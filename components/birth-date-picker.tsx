"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BirthDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
  disabled?: boolean;
  className?: string;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export function BirthDatePicker({
  value,
  onChange,
  placeholder = "Select birth date",
  fromYear = 1920,
  toYear = new Date().getFullYear(),
  disabled = false,
  className,
}: BirthDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState(
    value ? value.getFullYear() : 1990
  );
  const [selectedMonth, setSelectedMonth] = React.useState(
    value ? value.getMonth() : 0
  );

  React.useEffect(() => {
    if (value) {
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
    }
  }, [value]);

  const years = Array.from(
    { length: toYear - fromYear + 1 },
    (_, i) => toYear - i
  );

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDayClick = (day: number) => {
    const newDate = new Date(selectedYear, selectedMonth, day);
    onChange(newDate);
    setOpen(false);
  };

  const handleMonthChange = (monthIndex: string) => {
    setSelectedMonth(parseInt(monthIndex));
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          {/* Header with dropdowns */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2 flex-1">
              <Select
                value={selectedMonth.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8 text-sm w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-muted-foreground h-8 flex items-center justify-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-8" />
              ))}

              {/* Actual days */}
              {days.map((day) => {
                const date = new Date(selectedYear, selectedMonth, day);
                const isSelected =
                  value &&
                  value.getDate() === day &&
                  value.getMonth() === selectedMonth &&
                  value.getFullYear() === selectedYear;
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === selectedMonth &&
                  new Date().getFullYear() === selectedYear;

                return (
                  <Button
                    key={day}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 w-full p-0 font-normal",
                      isToday && !isSelected && "border border-primary",
                      isSelected &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
