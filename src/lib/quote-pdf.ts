import jsPDF from "jspdf";
import { B2BQuote } from "@/types";

export interface QuotePDFData extends B2BQuote {
  user: {
    company_name: string;
    email: string;
    phone?: string;
    first_name: string;
    last_name: string;
  };
  b2b_quote_items: Array<{
    variant_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_variants: {
      sku: string;
      weight: number;
      weight_unit: string;
      packing_type: string;
      form: string;
      products: {
        name: string;
      };
    };
  }>;
}

export function generateQuotePDF(quoteData: QuotePDFData): jsPDF {
  const doc = new jsPDF();

  // Set font
  doc.setFont("helvetica");

  // Header
  doc.setFontSize(20);
  doc.text("KN Biosciences", 20, 20);
  doc.setFontSize(12);
  doc.text("B2B Quotation", 20, 30);

  // Quote details
  doc.setFontSize(10);
  doc.text(`Quote ID: ${quoteData.id.substring(0, 8).toUpperCase()}`, 20, 45);
  doc.text(
    `Date: ${new Date(quoteData.created_at).toLocaleDateString()}`,
    20,
    52,
  );
  doc.text(
    `Valid Until: ${new Date(quoteData.valid_until).toLocaleDateString()}`,
    20,
    59,
  );
  doc.text(
    `Status: ${quoteData.status.replace("_", " ").toUpperCase()}`,
    20,
    66,
  );

  // Customer details
  doc.setFontSize(12);
  doc.text("Customer Details:", 20, 80);
  doc.setFontSize(10);
  doc.text(`Company: ${quoteData.user.company_name || "N/A"}`, 20, 88);
  doc.text(
    `Name: ${quoteData.user.first_name} ${quoteData.user.last_name}`,
    20,
    95,
  );
  doc.text(`Email: ${quoteData.user.email}`, 20, 102);
  if (quoteData.user.phone) {
    doc.text(`Phone: ${quoteData.user.phone}`, 20, 109);
  }

  // Items table
  let yPosition = 125;

  doc.setFontSize(12);
  doc.text("Quote Items:", 20, yPosition);
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
  quoteData.b2b_quote_items.forEach((item) => {
    const productName = item.product_variants.products.name;
    const sku = item.product_variants.sku;
    const quantity = item.quantity.toString();
    const unitPrice = `₹${item.unit_price.toLocaleString()}`;
    const total = `₹${item.total_price.toLocaleString()}`;

    // Wrap long product names
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
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;

  doc.setFontSize(12);
  doc.text("Summary:", 140, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.text(`Subtotal:`, 140, yPosition);
  doc.text(`₹${quoteData.subtotal.toLocaleString()}`, 170, yPosition);
  yPosition += 6;

  doc.text(`GST (18%):`, 140, yPosition);
  doc.text(`₹${quoteData.tax_amount.toLocaleString()}`, 170, yPosition);
  yPosition += 6;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total:`, 140, yPosition);
  doc.text(`₹${quoteData.total_amount.toLocaleString()}`, 170, yPosition);

  // Notes
  if (quoteData.notes) {
    yPosition += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Notes:", 20, yPosition);
    yPosition += 6;

    const noteLines = doc.splitTextToSize(quoteData.notes, 170);
    noteLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
  }

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

export function downloadQuotePDF(quoteData: QuotePDFData): void {
  const doc = generateQuotePDF(quoteData);
  const filename = `quote-${quoteData.id.substring(0, 8).toUpperCase()}.pdf`;
  doc.save(filename);
}
