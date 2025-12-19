import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../types';

export const ExportService = {
  /**
   * 📊 Export transactions to CSV
   */
  async exportTransactionsToCSV(transactions: Transaction[]) {
    const header = "Date,Description,Category,Amount,Type\n";
    const rows = transactions.map(t => 
      `${t.date},"${t.description}",${t.category},${t.amount},${t.type}`
    ).join("\n");
    
    const csvContent = header + rows;
    const filePath = `${FileSystem.documentDirectory}NorthFinance_Export_${Date.now()}.csv`;
    
    await FileSystem.writeAsStringAsync(filePath, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(filePath);
  },

  /**
   * 📄 Export simple Summary to Text/PDF logic
   */
  async exportReport(data: any) {
    const content = JSON.stringify(data, null, 2);
    const filePath = `${FileSystem.documentDirectory}Financial_Report.txt`;
    await FileSystem.writeAsStringAsync(filePath, content);
    await Sharing.shareAsync(filePath);
  }
};