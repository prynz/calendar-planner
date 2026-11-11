import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Calendar files on the device (CAL-09). Nothing leaves the phone unless the user shares it: import uses the
 * system document picker (no storage permission), export writes to the app cache and opens the share sheet.
 */
export async function pickCalendarText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    // Many apps label .ics as octet-stream or plain text; the parser rejects anything that is not a calendar.
    type: ['text/calendar', 'text/x-vcalendar', 'application/ics', 'application/octet-stream', 'text/plain'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  return new File(asset.uri).text();
}

export const shareCalendarText = (text: string, fileName: string, dialogTitle: string) =>
  shareTextFile(text, fileName, dialogTitle, 'text/calendar', 'com.apple.ical.ics');

/** Any local text export (calendar file, data export) through the share sheet. */
export async function shareTextFile(
  text: string,
  fileName: string,
  dialogTitle: string,
  mimeType: string,
  UTI: string,
): Promise<void> {
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  await file.write(text);
  await Sharing.shareAsync(file.uri, { mimeType, UTI, dialogTitle });
}
