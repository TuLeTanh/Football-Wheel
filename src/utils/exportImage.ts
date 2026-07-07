import { toPng } from 'html-to-image';

/**
 * PRD 11 – Share Screen: "Ảnh sẽ được render từ HTML Canvas để đảm bảo chất
 * lượng cao khi lưu và chia sẻ." We rasterize the share card DOM node with
 * html-to-image (works fully offline, no server round-trip).
 */
export async function renderNodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

/** Tries the native/Web Share sheet with the image attached; falls back to text-only share. */
export async function shareImage(dataUrl: string, filename: string, text: string): Promise<'shared' | 'unsupported' | 'failed'> {
  try {
    const file = await dataUrlToFile(dataUrl, filename);
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] }) && navigator.share) {
      await navigator.share({ files: [file], text, title: 'Team Wheel' });
      return 'shared';
    }
    if (navigator.share) {
      await navigator.share({ text, title: 'Team Wheel' });
      return 'shared';
    }
    return 'unsupported';
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') return 'shared';
    return 'failed';
  }
}
