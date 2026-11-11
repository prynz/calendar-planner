/** Web preview: a file input for import and a download for export – nothing is uploaded (ADR 0011). */
export function pickCalendarText(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics,text/calendar';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file.text().then(resolve, reject);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export const shareCalendarText = (text: string, fileName: string) => shareTextFile(text, fileName, '', 'text/calendar');

export async function shareTextFile(text: string, fileName: string, _title: string, mimeType: string): Promise<void> {
  const url = URL.createObjectURL(new Blob([text], { type: `${mimeType};charset=utf-8` }));
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
