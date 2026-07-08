import { toPng } from 'html-to-image';

/**
 * PRD 11 / FR-013 – Share Screen: "Ảnh sẽ được render từ HTML Canvas để đảm
 * bảo chất lượng cao khi lưu và chia sẻ", output quality target 1080x1920.
 * We rasterize the share card DOM node with html-to-image (works fully
 * offline, no server round-trip). The card is laid out at a fixed 270x480
 * CSS box (9:16), so pixelRatio 4 yields an exact 1080x1920 PNG.
 */
export async function renderNodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    pixelRatio: 4,
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

/** Tries the native/Web Share sheet with the image attached; falls back to a
 *  clipboard image copy, and only forces a download as a last resort. */
export async function shareImage(
  dataUrl: string,
  filename: string,
  text: string
): Promise<'shared' | 'copied' | 'unsupported' | 'failed'> {
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
    // FR-015 – "Nếu không hỗ trợ Native Share -> Copy": copy the rendered
    // image to the clipboard so the person can paste it anywhere.
    if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const pngBlob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [pngBlob.type]: pngBlob })]);
      return 'copied';
    }
    return 'unsupported';
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') return 'shared';
    return 'failed';
  }
}
