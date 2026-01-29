import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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

export function parseExcel(buffer: ArrayBuffer): ParsedProduct[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  return data.map((row: any) => ({
    name: row.name,
    slug: row.slug || row.name?.toLowerCase().replace(/ /g, '-'),
    description: row.description || '',
    price: parseFloat(row.price) || 0,
    category_id: row.category_id,
    segment: row.segment,
  }));
}
