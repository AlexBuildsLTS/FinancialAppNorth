import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

/**
 * Exports an array of objects to an XLSX file and opens the share dialog.
 * @param data - The array of data to export.
 * @param fileName - The desired name for the output file (without extension).
 */
export const exportToXLSX = async (data: any[], fileName: string): Promise<void> => {
  if (!Sharing.isAvailableAsync()) {
    alert('Sharing is not available on this platform.');
    return;
  }

  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    // Convert the data to a worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write the workbook to a base64 string
    const base64 = XLSX.write(wb, { type: 'base64' });
    // Define the file URI
    const fileUri = FileSystem.cacheDirectory + `${fileName}.xlsx`;

    // Write the base64 string to the file
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Open the share dialog to save or share the file
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: `Share or Save ${fileName}`,
      UTI: 'com.microsoft.excel.xlsx',
    });
  } catch (error) {
    console.error('Error exporting to XLSX:', error);
    alert('An error occurred while exporting the file.');
  }
};