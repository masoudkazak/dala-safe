export type CopyResult = 'copied' | 'manual';
export type ShareResult = 'shared' | 'cancelled' | 'unsupported' | 'failed';

function getClipboard(): Clipboard | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return navigator.clipboard;
}

function copyWithSelection(text: string): CopyResult {
  if (typeof document === 'undefined' || !document.body) return 'manual';

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);

  let copied = false;
  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    copied = typeof document.execCommand === 'function' && document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    textarea.remove();
  }

  return copied ? 'copied' : 'manual';
}

export async function copyText(text: string): Promise<CopyResult> {
  const clipboard = getClipboard();
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return 'copied';
    } catch {
      // Fall back to a manual selection-based copy.
    }
  }
  return copyWithSelection(text);
}

export async function shareText(payload: { title: string; text: string }): Promise<ShareResult> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported';
  }

  try {
    await navigator.share(payload);
    return 'shared';
  } catch (error) {
    const name =
      typeof error === 'object' && error !== null && 'name' in error
        ? (error as { name?: unknown }).name
        : undefined;
    return name === 'AbortError' ? 'cancelled' : 'failed';
  }
}

export function downloadText(content: string, filename: string): boolean {
  if (
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return false;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);

  try {
    anchor.click();
  } finally {
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return true;
}
