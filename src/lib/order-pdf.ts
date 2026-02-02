import jsPDF from "jspdf";
import { Order, OrderItem } from "@/types";

export interface OrderPDFData extends Order {
  order_items: Array<{
    variant_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_variants: {
      sku: string;
      products: {
        name: string;
      };
    };
  }>;
}

export function generateOrderInvoicePDF(orderData: OrderPDFData): jsPDF {
  const doc = new jsPDF();

  // Set font
  doc.setFont("helvetica");

  // Header
  doc.setFontSize(20);
  doc.text("KN Biosciences", 20, 20);
  doc.setFontSize(12);
  doc.text("Tax Invoice", 20, 30);

  // Order details
  doc.setFontSize(10);
  doc.text(`Order Number: ${orderData.order_number}`, 20, 45);
  doc.text(
    `Date: ${new Date(orderData.created_at).toLocaleDateString()}`,
    20,
    52,
  );
  doc.text(
    `Payment Status: ${orderData.payment_status.toUpperCase()}`,
    20,
    59,
  );
  doc.text(
    `Order Status: ${orderData.status.toUpperCase()}`,
    20,
    66,
  );

  // Customer details
  doc.setFontSize(12);
  doc.text("Shipping Address:", 20, 80);
  doc.setFontSize(10);
  const addr = orderData.shipping_address as any;
  doc.text(`${addr.first_name || ""} ${addr.last_name || ""}`, 20, 88);
  doc.text(`${addr.address_line1}`, 20, 95);
  if (addr.address_line2) doc.text(`${addr.address_line2}`, 20, 102);
  doc.text(`${addr.city}, ${addr.state} - ${addr.postal_code}`, 20, addr.address_line2 ? 109 : 102);

  // Items table
  let yPosition = 130;

  doc.setFontSize(12);
  doc.text("Order Items:", 20, yPosition);
  yPosition += 10;

  // Table headers
  doc.setFontSize(10);
  doc.text("Product", 20, yPosition);
  doc.text("SKU", 80, yPosition);
  doc.text("Qty", 110, yPosition);
  doc.text("Unit Price", 130, yPosition);
  doc.text("Total", 170, yPosition);
  yPosition += 5;

  // Draw line under headers
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;

  // Table items
  orderData.order_items.forEach((item) => {
    const productName = item.product_variants.products.name;
    const sku = item.product_variants.sku;
    const quantity = item.quantity.toString();
    const unitPrice = `₹${item.unit_price.toLocaleString()}`;
    const total = `₹${item.total_price.toLocaleString()}`;

    const lines = doc.splitTextToSize(productName, 50);

    lines.forEach((line: string, index: number) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      if (index === 0) {
        doc.text(line, 20, yPosition);
        doc.text(sku, 80, yPosition);
        doc.text(quantity, 110, yPosition);
        doc.text(unitPrice, 130, yPosition);
        doc.text(total, 170, yPosition);
      } else {
        doc.text(line, 20, yPosition);
      }

      yPosition += 6;
    });

    yPosition += 2;
  });

  // Summary
  yPosition += 10;
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;

  doc.setFontSize(12);
  doc.text("Summary:", 140, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.text(`Subtotal:`, 140, yPosition);
  doc.text(`₹${orderData.subtotal.toLocaleString()}`, 170, yPosition);
  yPosition += 6;

  doc.text(`Tax:`, 140, yPosition);
  doc.text(`₹${orderData.tax_amount.toLocaleString()}`, 170, yPosition);
  yPosition += 6;

  doc.text(`Shipping:`, 140, yPosition);
  doc.text(`₹${orderData.shipping_amount.toLocaleString()}`, 170, yPosition);
  yPosition += 6;

  if (orderData.discount_amount > 0) {
    doc.text(`Discount:`, 140, yPosition);
    doc.text(`-₹${orderData.discount_amount.toLocaleString()}`, 170, yPosition);
    yPosition += 6;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Paid:`, 140, yPosition);
  doc.text(`₹${orderData.total_amount.toLocaleString()}`, 170, yPosition);

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
    doc.text("KN Biosciences - Sustainable Agriculture Solutions", 105, 290, {
      align: "center",
    });
  }

  return doc;
}

export function downloadOrderInvoice(orderData: OrderPDFData): void {
  const doc = generateOrderInvoicePDF(orderData);
  const filename = `invoice-${orderData.order_number}.pdf`;
  doc.save(filename);
}
