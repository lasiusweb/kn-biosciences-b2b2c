import Papa from 'papaparse';
import * as ExcelJS from 'exceljs';

export interface ParsedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  segment: string;
}

export function parseCSV(fileContent: string): Promise<ParsedProduct[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products = results.data.map((row: any) => ({
          name: row.name,
          slug: row.slug || row.name?.toLowerCase().replace(/ /g, '-'),
          description: row.description || '',
          price: parseFloat(row.price) || 0,
          category_id: row.category_id,
          segment: row.segment,
        }));
        resolve(products);
      },
      error: (error: any) => reject(error),
    });
  });
}

export async function parseExcel(buffer: ArrayBuffer): Promise<ParsedProduct[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.getWorksheet(1); // Get the first worksheet
  if (!worksheet) {
    return [];
  }

  const products: ParsedProduct[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row
    
    const rowData: any = {};
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row
    
    const rowData: any = {};
    row.eachCell((cell, colNumber) => {
      rowData[headers[colNumber - 1]] = cell.value;
    });

    products.push({
      name: rowData.name,
      slug: rowData.slug || rowData.name?.toLowerCase().replace(/ /g, '-'),
      description: rowData.description || '',
      price: parseFloat(rowData.price) || 0,
      category_id: rowData.category_id,
      segment: rowData.segment,
    });
  });
  });

  return products;
}
