"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Truck,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Download,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";

interface Shipment {
  id: string;
  order_id: string;
  waybill: string;
  status: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  weight: number;
  origin_pincode: string;
  destination_pincode: string;
  created_at: string;
  tracking_info?: any;
  shipping_label_url?: string;
}

interface ShippingRate {
  courier_name: string;
  courier_id: string;
  estimated_delivery_days: number;
  rate: number;
  service_type: string;
  final_rate: number;
  features: string[];
  is_recommended?: boolean;
}

interface ShippingManagementProps {
  userRole?: string;
}

export function ShippingManagement({
  userRole = "admin",
}: ShippingManagementProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );
  const [showTracking, setShowTracking] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [rateQuery, setRateQuery] = useState({
    origin_pin: "",
    destination_pin: "",
    weight: "",
    cod: false,
  });
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/shipments");
      if (response.ok) {
        const data = await response.json();
        setShipments(data.shipments || []);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackShipment = async (waybill: string) => {
    try {
      setTrackingLoading(true);
      const response = await fetch(`/api/shipping/track?waybill=${waybill}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedShipment((prev) => ({
          ...prev,
          tracking_info: data.tracking?.[0],
        }));
        setShowTracking(true);
      }
    } catch (error) {
      console.error("Error tracking shipment:", error);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleDownloadLabel = async (order_id: string) => {
    try {
      const response = await fetch(`/api/shipping/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `waybill_${order_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading label:", error);
    }
  };

  const handleGetRates = async () => {
    if (
      !rateQuery.origin_pin ||
      !rateQuery.destination_pin ||
      !rateQuery.weight
    ) {
      return;
    }

    try {
      setRatesLoading(true);
      const response = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rateQuery),
      });

      if (response.ok) {
        const data = await response.json();
        setRates(data.rates || []);
      }
    } catch (error) {
      console.error("Error getting rates:", error);
    } finally {
      setRatesLoading(false);
    }
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.waybill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customer_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      shipment.order_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      shipment.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in-transit":
        return "bg-blue-100 text-blue-800";
      case "picked":
        return "bg-orange-100 text-orange-800";
      case "manifested":
        return "bg-purple-100 text-purple-800";
      case "rto":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "in-transit":
        return <Truck className="h-4 w-4" />;
      case "picked":
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shipping Management</h1>
        <p className="text-muted-foreground">
          Manage shipments, track deliveries, and calculate shipping rates
        </p>
      </div>

      {/* Shipping Rate Calculator */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipping Rate Calculator
          </CardTitle>
          <CardDescription>
            Calculate shipping rates for different routes and service types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="origin_pin">Origin Pincode</Label>
              <Input
                id="origin_pin"
                placeholder="110001"
                value={rateQuery.origin_pin}
                onChange={(e) =>
                  setRateQuery((prev) => ({
                    ...prev,
                    origin_pin: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="destination_pin">Destination Pincode</Label>
              <Input
                id="destination_pin"
                placeholder="400001"
                value={rateQuery.destination_pin}
                onChange={(e) =>
                  setRateQuery((prev) => ({
                    ...prev,
                    destination_pin: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="1.5"
                value={rateQuery.weight}
                onChange={(e) =>
                  setRateQuery((prev) => ({ ...prev, weight: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cod"
                checked={rateQuery.cod}
                onChange={(e) =>
                  setRateQuery((prev) => ({ ...prev, cod: e.target.checked }))
                }
              />
              <Label htmlFor="cod">Cash on Delivery</Label>
            </div>

            <Button
              onClick={handleGetRates}
              disabled={
                ratesLoading ||
                !rateQuery.origin_pin ||
                !rateQuery.destination_pin ||
                !rateQuery.weight
              }
              className="flex items-center gap-2"
            >
              {ratesLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4" />
                  Get Rates
                </>
              )}
            </Button>
          </div>

          {rates.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="font-semibold">Available Shipping Rates</h3>
              {rates.map((rate, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    rate.is_recommended
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{rate.courier_name}</h4>
                        {rate.is_recommended && (
                          <Badge variant="secondary">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {rate.service_type} • {rate.estimated_delivery_days}{" "}
                        days delivery
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {rate.features.map((feature, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ₹{rate.final_rate}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipments
            </div>
            <Button
              onClick={fetchShipments}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </CardTitle>
          <CardDescription>
            View and manage all outgoing shipments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by waybill, order ID, or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="manifested">Manifested</option>
              <option value="picked">Picked Up</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="rto">Return to Origin</option>
            </select>
          </div>

          {/* Shipments Table */}
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading shipments...</p>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No shipments found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedStatus !== "all"
                  ? "Try adjusting your filters"
                  : "No shipments have been created yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Waybill</th>
                    <th className="text-left p-2">Order ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-2">
                        <div className="font-mono text-sm">
                          {shipment.waybill}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-mono text-sm">
                          {shipment.order_id}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">
                            {shipment.customer_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shipment.customer_email}
                          </p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">
                          ₹{shipment.total_amount}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(shipment.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(shipment.status)}
                            {shipment.status}
                          </div>
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleTrackShipment(shipment.waybill)
                            }
                            disabled={trackingLoading}
                          >
                            <MapPin className="h-3 w-3" />
                            Track
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDownloadLabel(shipment.order_id)
                            }
                          >
                            <Download className="h-3 w-3" />
                            Label
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Modal */}
      {showTracking && selectedShipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shipment Tracking</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTracking(false)}
                >
                  ×
                </Button>
              </div>
              <CardDescription>
                Track waybill:{" "}
                <span className="font-mono">{selectedShipment.waybill}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trackingLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Tracking shipment...</p>
                </div>
              ) : selectedShipment.tracking_info ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-1">
                      Current Status: {selectedShipment.tracking_info.status}
                    </h3>
                    {selectedShipment.tracking_info.expected_delivery_date && (
                      <p className="text-green-700">
                        Expected Delivery:{" "}
                        {new Date(
                          selectedShipment.tracking_info.expected_delivery_date,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {selectedShipment.tracking_info.timeline && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Tracking Timeline</h4>
                      {selectedShipment.tracking_info.timeline.map(
                        (event: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-4 border-l-2 border-gray-200 pl-4 pb-4"
                          >
                            <div className="bg-white border-2 border-gray-300 rounded-full w-4 h-4 mt-1 -ml-[11px]"></div>
                            <div className="flex-1">
                              <p className="font-medium">{event.status}</p>
                              <p className="text-sm text-muted-foreground">
                                {event.location}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(event.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No tracking information available for this shipment.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ShippingManagement;
