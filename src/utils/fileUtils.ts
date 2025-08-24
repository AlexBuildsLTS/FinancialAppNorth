import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
};

export const exportToCSV = async (data: any[], fileName: string): Promise<void> => {
  if (!(await Sharing.isAvailableAsync())) {
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

export const exportToXLSX = async (data: any[], fileName: string): Promise<void> => {
    if (!(await Sharing.isAvailableAsync())) {
        alert('Sharing is not available on this platform.');
        return;
    }
    try {
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