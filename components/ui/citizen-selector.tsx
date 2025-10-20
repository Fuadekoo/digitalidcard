"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, Phone, Search, Loader2, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MyStationCitizen } from "@/actions/stationRegistral/order";
import useMutation from "@/hooks/useMutation";
import { toast } from "sonner";
import { Spinner, ButtonSpinner } from "@/components/ui/spinner";

interface Citizen {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  registralNo: string;
  phone: string;
  gender: string;
  isVerified?: string;
}

interface CitizenSelectorProps {
  onSelect: (citizen: Citizen | null) => void;
  selectedCitizen: Citizen | null;
  lang: string;
  placeholder?: string;
  className?: string;
}

export function CitizenSelector({
  onSelect,
  selectedCitizen,
  lang,
  placeholder = "Search and select a citizen...",
  className = "",
}: CitizenSelectorProps) {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [filteredCitizens, setFilteredCitizens] = useState<Citizen[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loadCitizensAction, isLoadLoading] = useMutation(
    MyStationCitizen,
    (state) => {
      if (state?.status && state?.data) {
        const citizensData = state.data as Citizen[];
        setCitizens(citizensData);
        setFilteredCitizens(citizensData);
      }
      setIsLoading(false);
    }
  );

  const loadCitizens = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadCitizensAction();
    } catch (error) {
      console.error("Failed to load citizens:", error);
      toast.error("Failed to load citizens");
      setIsLoading(false);
    }
  }, [loadCitizensAction]);

  // Load citizens on component mount
  useEffect(() => {
    loadCitizens();
  }, [loadCitizens]);

  // Filter citizens based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCitizens(citizens);
      return;
    }

    const filtered = citizens.filter((citizen) => {
      const fullName = `${citizen.firstName} ${citizen.middleName || ""} ${
        citizen.lastName
      }`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();

      return (
        fullName.includes(searchLower) ||
        citizen.phone.includes(searchQuery) ||
        citizen.registralNo.toLowerCase().includes(searchLower)
      );
    });

    setFilteredCitizens(filtered);
  }, [searchQuery, citizens]);

  const handleCitizenSelect = (citizen: Citizen) => {
    onSelect(citizen);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClearSelection = () => {
    onSelect(null);
    setSearchQuery("");
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery("");
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <div
        className="flex items-center justify-between w-full px-3 py-2 border border-input bg-background rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={toggleDropdown}
      >
        <div className="flex items-center gap-2 flex-1">
          {selectedCitizen ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedCitizen.firstName} {selectedCitizen.middleName || ""}{" "}
                {selectedCitizen.lastName}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedCitizen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }}
              className="p-1 hover:bg-destructive/10 rounded-sm"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden">
          <CardContent className="p-0">
            {/* Search Input */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or registration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            {/* Citizens List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading || isLoadLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size={24} />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading citizens...
                  </span>
                </div>
              ) : filteredCitizens.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredCitizens.map((citizen) => (
                    <div
                      key={citizen.id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleCitizenSelect(citizen)}
                    >
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {citizen.firstName} {citizen.middleName || ""}{" "}
                          {citizen.lastName}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{citizen.phone}</span>
                          </div>
                          <span>Reg: {citizen.registralNo}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant="outline" className="text-xs">
                          {citizen.gender}
                        </Badge>
                        {citizen.isVerified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            ✅ APPROVED
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No approved citizens found matching your search"
                      : "No approved citizens available for order creation"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only approved citizens can create orders. Please approve
                    citizens first.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-muted/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  loadCitizens();
                }}
                disabled={isLoading || isLoadLoading}
                className="w-full"
              >
                {isLoading || isLoadLoading ? (
                  <>
                    <ButtonSpinner size={12} />
                    <span className="ml-2">Loading...</span>
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-3 w-3" />
                    Refresh Citizens
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
