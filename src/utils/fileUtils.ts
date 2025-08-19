import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Converts an array of objects to a CSV string.
 * Assumes all objects have the same keys.
 * @param data - The array of data to convert.
 * @returns A CSV formatted string.
 */
const convertToCSV = (data: any[]): string => {
  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""'); // Escape double quotes
      return `"${escaped}"`; // Enclose values in double quotes
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Exports an array of objects to a CSV file and opens the share dialog.
 * @param data - The array of data to export.
 * @param fileName - The desired name for the output file (without extension).
 */
export const exportToCSV = async (data: any[], fileName: string): Promise<void> => {
  if (!Sharing.isAvailableAsync()) {
    alert('Sharing is not available on this platform.');
    return;
  }

  try {
    const csvString = convertToCSV(data);
    const fileUri = FileSystem.cacheDirectory + `${fileName}.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csvString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: `Share or Save ${fileName}`,
      UTI: 'public.csv',
    });
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('An error occurred while exporting the file.');
  }
};

/**
 * Exports an array of objects to an XLSX file and opens the share dialog.
 * NOTE: This is a simplified implementation. For full XLSX features (multiple sheets, complex formatting),
 * a dedicated library like 'xlsx' would be required, which is not included in current dependencies.
 * This function currently exports data as CSV content but with an .xlsx extension.
 * @param data - The array of data to export.
 * @param fileName - The desired name for the output file (without extension).
 */
export const exportToXLSX = async (data: any[], fileName: string): Promise<void> => {
  if (!Sharing.isAvailableAsync()) {
    alert('Sharing is not available on this platform.');
    return;
  }

  try {
    // For a true XLSX export, you would use a library like 'xlsx' here.
    // As a placeholder, we'll convert to CSV and save as .xlsx.
    const csvString = convertToCSV(data);
    const fileUri = FileSystem.cacheDirectory + `${fileName}.xlsx`;

    await FileSystem.writeAsStringAsync(fileUri, csvString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

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
