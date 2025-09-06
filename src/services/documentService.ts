// Minimal document service stub used by camera.tsx and other screens.

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadDocument(
  file: any,
  options?: { folder?: string }
): Promise<UploadResult> {
  if (!file) return { success: false, error: 'No file provided' };
  try {
    const name = file.name ?? file.fileName ?? 'document';
    const fakeUrl = `https://example.com/uploads/${encodeURIComponent(String(name))}`;
    return { success: true, url: fakeUrl };
  } catch (err: unknown) {
    return { success: false, error: String(err ?? 'Unknown error') };
  }
}

const documentService = { uploadDocument };
export default documentService;