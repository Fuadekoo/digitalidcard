"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Station {
  id: string;
  code: string;
  afanOromoName: string;
  amharicName: string;
  stationAdminName: string;
}

interface StationSelectorProps {
  stations: Station[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function StationSelector({
  stations,
  value,
  onValueChange,
  placeholder = "Select station...",
  disabled = false,
}: StationSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedStation = useMemo(() => {
    return stations.find((station) => station.id === value);
  }, [stations, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedStation ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedStation.code}</span>
              <span className="text-muted-foreground">
                - {selectedStation.amharicName}
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search stations..." />
          <CommandList>
            <CommandEmpty>No station found.</CommandEmpty>
            <CommandGroup>
              {stations.map((station) => (
                <CommandItem
                  key={station.id}
                  value={`${station.code} ${station.amharicName} ${station.afanOromoName} ${station.stationAdminName}`}
                  onSelect={() => {
                    onValueChange(station.id === value ? "" : station.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === station.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{station.code}</span>
                      <span className="text-muted-foreground">
                        - {station.amharicName}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {station.afanOromoName} • Admin:{" "}
                      {station.stationAdminName}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
