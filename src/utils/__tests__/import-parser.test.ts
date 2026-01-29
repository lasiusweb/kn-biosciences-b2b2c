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
    it('should parse Excel buffer', () => {
      // Create a minimal XLSX workbook
      const XLSX = require('xlsx');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([
        { name: 'XLSX P1', price: 500, segment: 'seeds' }
      ]);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcel(buffer);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('XLSX P1');
    });
  });
});
