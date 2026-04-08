"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";

type OrderRow = {
  id: string;
  customer: string;
  chickCount: number;
  status: string;
  pickupDate: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to load orders.");
        }

        const data = (await response.json()) as { orders: OrderRow[] };
        setOrders(data.orders);
      } catch (error) {
        setRequestError(error instanceof Error ? error.message : "Failed to load orders.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrders();
  }, []);

  const rows = orders.map((order) => ({
    customer: order.customer,
    chickCount: String(order.chickCount),
    status: toTitleCase(order.status),
    pickupDate: formatDate(order.pickupDate),
  }));

  return (
    <div className="space-y-4">
      {requestError ? <p className="text-sm text-[#b34b75]">{requestError}</p> : null}
      <DataTable
        title="Orders"
        description={
          isLoading
            ? "Loading orders..."
            : "Order records shaped for fulfillment, analytics, waitlist conversion, and future automation."
        }
        columns={[
          { key: "customer", label: "Customer" },
          { key: "chickCount", label: "Chick Count" },
          { key: "status", label: "Status" },
          { key: "pickupDate", label: "Pickup Date" },
        ]}
        rows={rows}
      />
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
