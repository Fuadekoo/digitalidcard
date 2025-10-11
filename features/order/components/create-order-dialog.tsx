"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone,
  CreditCard,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import useMutation from "@/hooks/useMutation";
import { createOrder } from "@/actions/stationRegistral/order";
import { CitizenSelector } from "@/components/ui/citizen-selector";

interface CreateOrderDialogProps {
  lang: string;
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

interface Citizen {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  registralNo: string;
  phone: string;
  gender: string;
}

const ORDER_TYPES = [
  {
    value: "NORMAL",
    label: "Normal Processing",
    description: "Standard processing time",
    price: 500,
    duration: "5-7 business days",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: "URGENT",
    label: "Urgent Processing",
    description: "Fast processing time",
    price: 750,
    duration: "2-3 business days",
    icon: <AlertCircle className="h-4 w-4" />,
  },
] as const;

export function CreateOrderDialog({
  lang,
  onSuccess,
  onCancel,
}: CreateOrderDialogProps) {
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<
    "NORMAL" | "URGENT"
  >("NORMAL");

  const [createOrderAction, isCreating] = useMutation(createOrder, (state) => {
    if (state?.status) {
      toast.success("Order created successfully!");
      onSuccess(state.data?.id || "");
    } else {
      toast.error(state?.message || "Failed to create order");
    }
  });

  const selectedOrderTypeInfo = ORDER_TYPES.find(
    (type) => type.value === selectedOrderType
  );

  const handleCreateOrder = async () => {
    if (!selectedCitizen) {
      toast.error("Please select a citizen");
      return;
    }

    if (!selectedOrderType) {
      toast.error("Please select an order type");
      return;
    }

    const orderData = {
      citizenId: selectedCitizen.id,
      orderType: selectedOrderType,
      paymentMethod: "CASH", // Default to cash, can be changed later
      paymentReference: `CASH-${Date.now()}`,
      amount: selectedOrderTypeInfo?.price || 500,
    };

    await createOrderAction(orderData);
  };

  const handleCitizenSelect = (citizen: Citizen | null) => {
    setSelectedCitizen(citizen);
  };

  return (
    <div className="space-y-6">
      {/* Citizen Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Select Citizen</Label>
          <p className="text-sm text-muted-foreground">
            Search and select a citizen to create an order for
          </p>
        </div>

        <CitizenSelector
          onSelect={handleCitizenSelect}
          selectedCitizen={selectedCitizen}
          lang={lang}
          placeholder="Search by name, phone, or registration number..."
        />

        {selectedCitizen && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {selectedCitizen.firstName}{" "}
                    {selectedCitizen.middleName || ""}{" "}
                    {selectedCitizen.lastName}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {selectedCitizen.phone}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reg: {selectedCitizen.registralNo}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Type Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Order Type</Label>
          <p className="text-sm text-muted-foreground">
            Select the processing type for the ID card
          </p>
        </div>

        <div className="grid gap-4">
          {ORDER_TYPES.map((orderType) => (
            <div
              key={orderType.value}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedOrderType === orderType.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() =>
                setSelectedOrderType(orderType.value as "NORMAL" | "URGENT")
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      selectedOrderType === orderType.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {orderType.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{orderType.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {orderType.description}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Processing time: {orderType.duration}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-lg font-bold">
                    {orderType.price} ETB
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      {/* {selectedCitizen && selectedOrderTypeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Citizen:</span>
              <span className="font-medium">
                {selectedCitizen.firstName} {selectedCitizen.middleName || ""}{" "}
                {selectedCitizen.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{selectedCitizen.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Type:</span>
              <span className="font-medium">{selectedOrderTypeInfo.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing Time:</span>
              <span className="font-medium">
                {selectedOrderTypeInfo.duration}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">
                  {selectedOrderTypeInfo.price} ETB
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateOrder}
          disabled={!selectedCitizen || isCreating}
          className="min-w-[120px]"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Create Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
