import { parseCSV, parseExcel } from '../import-parser';

describe('Import Parser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV content', async () => {
      const csv = 'name,price,segment\nProduct A,100,agriculture\nProduct B,200,aquaculture';
      const result = await parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Product A');
      expect(result[0].price).toBe(100);
      expect(result[1].segment).toBe('aquaculture');
    });

    it('should handle empty input', async () => {
      const result = await parseCSV('');
      expect(result).toHaveLength(0);
    });
  });

  describe('parseExcel', () => {
    it('should parse Excel buffer', async () => {
      // Create a minimal XLSX workbook using exceljs
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');
      worksheet.columns = [
        { header: 'name', key: 'name', width: 10 },
        { header: 'price', key: 'price', width: 10 },
        { header: 'segment', key: 'segment', width: 10 },
      ];
      worksheet.addRow({ name: 'ExcelJS P1', price: 500, segment: 'seeds' });
      const buffer = await workbook.xlsx.writeBuffer();

      const result = await parseExcel(buffer);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('ExcelJS P1');
    });
  });
});
