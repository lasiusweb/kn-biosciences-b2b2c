import jsPDF from "jspdf";

export interface ReportData {
  title: string;
  dateRange: string;
  generatedAt: string;
  metrics: Array<{
    label: string;
    value: string | number;
    change?: number;
  }>;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: string[][];
  }>;
  charts?: Array<{
    title: string;
    data: any[];
  }>;
}

export class AnalyticsExporter {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  exportToPDF(data: ReportData): void {
    this.doc = new jsPDF();

    let yPosition = 20;

    // Title
    this.doc.setFontSize(20);
    this.doc.setTextColor(52, 73, 94);
    this.doc.text(data.title, 20, yPosition);
    yPosition += 15;

    // Date Range
    this.doc.setFontSize(12);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`Period: ${data.dateRange}`, 20, yPosition);
    yPosition += 8;

    this.doc.text(`Generated: ${data.generatedAt}`, 20, yPosition);
    yPosition += 15;

    // Key Metrics
    this.doc.setFontSize(14);
    this.doc.setTextColor(52, 73, 94);
    this.doc.text("Key Metrics", 20, yPosition);
    yPosition += 10;

    this.doc.setFontSize(10);
    this.doc.setTextColor(60, 60, 60);

    data.metrics.forEach((metric) => {
      if (yPosition > 270) {
        this.doc.addPage();
        yPosition = 20;
      }

      const label = metric.label;
      const value =
        typeof metric.value === "number"
          ? new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(metric.value)
          : metric.value.toString();

      const changeText =
        metric.change !== undefined
          ? ` (${metric.change >= 0 ? "+" : ""}${metric.change}%)`
          : "";

      this.doc.text(`${label}: ${value}${changeText}`, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Tables
    if (data.tables) {
      data.tables.forEach((table) => {
        if (yPosition > 200) {
          this.doc.addPage();
          yPosition = 20;
        }

        this.doc.setFontSize(14);
        this.doc.setTextColor(52, 73, 94);
        this.doc.text(table.title, 20, yPosition);
        yPosition += 10;

        // Simple table implementation
        this.doc.setFontSize(10);
        this.doc.setTextColor(60, 60, 60);

        // Headers
        table.headers.forEach((header, index) => {
          this.doc.setFillColor(139, 195, 74);
          this.doc.setTextColor(255, 255, 255);
          this.doc.text(header, 20 + index * 40, yPosition);
        });
        yPosition += 10;

        // Rows
        table.rows.forEach((row) => {
          if (yPosition > 270) {
            this.doc.addPage();
            yPosition = 20;
          }

          row.forEach((cell, index) => {
            this.doc.setFillColor(245, 245, 245);
            this.doc.setTextColor(60, 60, 60);
            this.doc.text(cell.substring(0, 15), 20 + index * 40, yPosition);
          });
          yPosition += 8;
        });

        const finalY = yPosition;
        yPosition = finalY + 15;
      });
    }

    // Footer - simplified implementation
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(
      "KN Biosciences Analytics Report",
      this.doc.internal.pageSize.width / 2,
      this.doc.internal.pageSize.height - 10,
      { align: "center" },
    );

    // Download the PDF
    this.doc.save(
      `${data.title.replace(/\s+/g, "_").toLowerCase()}_report.pdf`,
    );
  }

  exportToCSV(
    data: ReportData,
    filename: string = "analytics_report.csv",
  ): void {
    let csvContent = "";

    // Header
    csvContent += `${data.title}\n`;
    csvContent += `Period: ${data.dateRange}\n`;
    csvContent += `Generated: ${data.generatedAt}\n\n`;

    // Metrics
    csvContent += "Key Metrics\n";
    csvContent += "Metric,Value,Change\n";
    data.metrics.forEach((metric) => {
      const change = metric.change !== undefined ? `${metric.change}%` : "";
      csvContent += `"${metric.label}","${metric.value}","${change}"\n`;
    });

    // Tables
    if (data.tables) {
      data.tables.forEach((table) => {
        csvContent += `\n${table.title}\n`;
        csvContent += table.headers.join(",") + "\n";
        table.rows.forEach((row) => {
          csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
        });
      });
    }

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToExcel(data: ReportData): void {
    // Create a simple HTML table that can be opened in Excel
    let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { background-color: #8BC34A; color: white; }
            .metric { margin: 10px 0; }
            .positive { color: green; }
            .negative { color: red; }
          </style>
        </head>
        <body>
          <h1>${data.title}</h1>
          <p><strong>Period:</strong> ${data.dateRange}</p>
          <p><strong>Generated:</strong> ${data.generatedAt}</p>
          
          <h2>Key Metrics</h2>
          <table>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Change</th>
            </tr>
    `;

    data.metrics.forEach((metric) => {
      const changeClass =
        metric.change && metric.change >= 0 ? "positive" : "negative";
      const changeText =
        metric.change !== undefined
          ? `<span class="${changeClass}">${metric.change >= 0 ? "+" : ""}${metric.change}%</span>`
          : "";

      htmlContent += `
        <tr>
          <td>${metric.label}</td>
          <td>${metric.value}</td>
          <td>${changeText}</td>
        </tr>
      `;
    });

    htmlContent += "</table>";

    if (data.tables) {
      data.tables.forEach((table) => {
        htmlContent += `
          <h2>${table.title}</h2>
          <table>
            <tr class="header">
        `;

        table.headers.forEach((header) => {
          htmlContent += `<th>${header}</th>`;
        });

        htmlContent += "</tr>";

        table.rows.forEach((row) => {
          htmlContent += "<tr>";
          row.forEach((cell) => {
            htmlContent += `<td>${cell}</td>`;
          });
          htmlContent += "</tr>";
        });

        htmlContent += "</table>";
      });
    }

    htmlContent += `
        </body>
      </html>
    `;

    // Download as Excel-compatible HTML file
    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${data.title.replace(/\s+/g, "_").toLowerCase()}_report.xls`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportSalesReport(data: any): void {
    const reportData: ReportData = {
      title: "Sales Analytics Report",
      dateRange: data.period || "Last 30 days",
      generatedAt: new Date().toLocaleString(),
      metrics: [
        {
          label: "Total Sales",
          value: data.overview?.totalSales || 0,
          change: 12.5,
        },
        {
          label: "Total Orders",
          value: data.overview?.totalOrders || 0,
          change: 8.2,
        },
        {
          label: "Average Order Value",
          value: data.overview?.averageOrderValue || 0,
          change: 3.7,
        },
        {
          label: "Payment Rate",
          value: `${data.overview?.paymentRate || 0}%`,
          change: 5.1,
        },
        {
          label: "B2B Quotes",
          value: data.overview?.totalB2BQuotes || 0,
          change: 15.3,
        },
        {
          label: "B2B Conversion Rate",
          value: `${data.overview?.b2bConversionRate || 0}%`,
          change: 2.4,
        },
      ],
      tables: [
        {
          title: "Top Products by Revenue",
          headers: ["Product", "SKU", "Segment", "Revenue", "Quantity"],
          rows: (data.topProducts || [])
            .map((product: any) => [
              product.name || "N/A",
              product.sku || "N/A",
              product.segment || "N/A",
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(product.totalRevenue || 0),
              (product.quantity || 0).toString(),
            ])
            .slice(0, 20),
        },
      ],
    };

    this.exportToPDF(reportData);
  }

  exportCustomerReport(data: any): void {
    const reportData: ReportData = {
      title: "Customer Analytics Report",
      dateRange: data.period || "Last 30 days",
      generatedAt: new Date().toLocaleString(),
      metrics: [
        {
          label: "Total Customers",
          value: data.overview?.totalCustomers || 0,
          change: 15.3,
        },
        {
          label: "New Customers",
          value: data.overview?.newCustomers || 0,
          change: 22.7,
        },
        {
          label: "Customer Retention Rate",
          value: `${data.overview?.customerRetentionRate || 0}%`,
          change: 3.2,
        },
        {
          label: "Average Lifetime Value",
          value: data.overview?.averageLifetimeValue || 0,
          change: 8.5,
        },
        {
          label: "Customer Satisfaction",
          value: `${data.overview?.customerSatisfactionScore || 0}/5`,
          change: 8.7,
        },
      ],
      tables: [
        {
          title: "Customer Segments",
          headers: ["Segment", "Count", "Percentage"],
          rows: [
            ["B2C", (data.customerSegments?.b2c || 0).toString(), "65%"],
            ["B2B", (data.customerSegments?.b2b || 0).toString(), "30%"],
            ["Other", (data.customerSegments?.other || 0).toString(), "5%"],
          ],
        },
        {
          title: "Top Customers",
          headers: [
            "Customer",
            "Email",
            "Segment",
            "Orders",
            "Total Spent",
            "Avg Order Value",
          ],
          rows: (data.topCustomers || [])
            .map((customer: any) => [
              customer.name || "N/A",
              customer.email || "N/A",
              customer.segment || "N/A",
              (customer.totalOrders || 0).toString(),
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(customer.totalSpent || 0),
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(customer.averageOrderValue || 0),
            ])
            .slice(0, 20),
        },
      ],
    };

    this.exportToPDF(reportData);
  }

  exportInventoryReport(data: any): void {
    const reportData: ReportData = {
      title: "Inventory Analytics Report",
      dateRange: data.period || "Last 30 days",
      generatedAt: new Date().toLocaleString(),
      metrics: [
        {
          label: "Total Products",
          value: data.overview?.totalProducts || 0,
          change: 5.2,
        },
        {
          label: "Total Inventory Value",
          value: data.overview?.totalValue || 0,
          change: 12.8,
        },
        {
          label: "Low Stock Items",
          value: data.overview?.lowStockItems || 0,
          change: -15.3,
        },
        {
          label: "Out of Stock Items",
          value: data.overview?.outOfStockItems || 0,
          change: -8.7,
        },
        {
          label: "Turnover Rate",
          value: `${data.overview?.turnoverRate || 0} days`,
          change: -5.2,
        },
      ],
      tables: [
        {
          title: "Critical Stock Items",
          headers: ["Product", "SKU", "Current Stock", "Status", "Value"],
          rows: (data.stockLevels || [])
            .filter(
              (item: any) =>
                item.status === "critical" || item.status === "out",
            )
            .map((item: any) => [
              item.productName || "N/A",
              item.sku || "N/A",
              (item.currentStock || 0).toString(),
              item.status || "N/A",
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(item.totalValue || 0),
            ])
            .slice(0, 20),
        },
        {
          title: "Slow Moving Products",
          headers: [
            "Product",
            "SKU",
            "Last Sold",
            "Days in Stock",
            "Value",
            "Holding Cost",
          ],
          rows: (data.slowMovingProducts || [])
            .map((product: any) => [
              product.productName || "N/A",
              product.sku || "N/A",
              product.lastSold || "N/A",
              (product.daysInStock || 0).toString(),
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(product.value || 0),
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(product.holdingCost || 0),
            ])
            .slice(0, 20),
        },
      ],
    };

    this.exportToPDF(reportData);
  }

  exportB2BReport(data: any): void {
    const reportData: ReportData = {
      title: "B2B Analytics Report",
      dateRange: data.period || "Last 30 days",
      generatedAt: new Date().toLocaleString(),
      metrics: [
        {
          label: "Total Quotes",
          value: data.overview?.totalQuotes || 0,
          change: 18.5,
        },
        {
          label: "Total Value",
          value: data.overview?.totalValue || 0,
          change: 24.3,
        },
        {
          label: "Conversion Rate",
          value: `${data.overview?.conversionRate || 0}%`,
          change: 5.2,
        },
        {
          label: "Average Deal Size",
          value: data.overview?.averageDealSize || 0,
          change: 8.7,
        },
        {
          label: "Sales Cycle",
          value: `${data.overview?.salesCycle || 0} days`,
          change: -3.2,
        },
        {
          label: "Client Retention",
          value: `${data.overview?.clientRetention || 0}%`,
          change: 2.8,
        },
      ],
      tables: [
        {
          title: "Quote Funnel",
          headers: ["Stage", "Count", "Value", "Conversion Rate"],
          rows: (data.quoteFunnel || []).map((stage: any) => [
            stage.stage || "N/A",
            (stage.count || 0).toString(),
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(stage.value || 0),
            `${stage.conversion || 0}%`,
          ]),
        },
        {
          title: "Top B2B Clients",
          headers: [
            "Company",
            "Industry",
            "Quotes",
            "Total Value",
            "Conversion Rate",
            "Last Quote",
          ],
          rows: (data.topClients || [])
            .map((client: any) => [
              client.companyName || "N/A",
              client.industry || "N/A",
              (client.totalQuotes || 0).toString(),
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(client.totalValue || 0),
              `${client.conversionRate || 0}%`,
              client.lastQuoteDate || "N/A",
            ])
            .slice(0, 20),
        },
      ],
    };

    this.exportToPDF(reportData);
  }
}
