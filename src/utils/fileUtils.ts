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
