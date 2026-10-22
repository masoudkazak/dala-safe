import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText, shareText } from './shareActions';

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value });
}

function setExecCommand(value: unknown) {
  Object.defineProperty(document, 'execCommand', { configurable: true, value });
}

afterEach(() => {
  setClipboard(undefined);
  Reflect.deleteProperty(document, 'execCommand');
  Reflect.deleteProperty(navigator, 'share');
  vi.restoreAllMocks();
});

describe('copyText', () => {
  it('uses the async clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    await expect(copyText('hello')).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to selection and execCommand when the clipboard is missing', async () => {
    setClipboard(undefined);
    const execCommand = vi.fn(() => true);
    setExecCommand(execCommand);

    await expect(copyText('fallback copy')).resolves.toBe('copied');
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('falls back when the clipboard rejects the write', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    setClipboard({ writeText });
    const execCommand = vi.fn(() => true);
    setExecCommand(execCommand);

    await expect(copyText('fallback copy')).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('fallback copy');
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('reports manual copying when both methods are unavailable', async () => {
    setClipboard(undefined);
    setExecCommand(vi.fn(() => false));

    await expect(copyText('manual copy')).resolves.toBe('manual');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('reports manual copying when execCommand throws', async () => {
    setClipboard(undefined);
    setExecCommand(
      vi.fn(() => {
        throw new Error('blocked');
      }),
    );

    await expect(copyText('manual copy')).resolves.toBe('manual');
    expect(document.querySelector('textarea')).toBeNull();
  });
});

describe('shareText', () => {
  it('reports unsupported when native sharing is unavailable', async () => {
    Reflect.deleteProperty(navigator, 'share');

    await expect(shareText({ title: 'Trip', text: 'Body' })).resolves.toBe('unsupported');
  });

  it('reports a completed share dialog without claiming delivery', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });

    await expect(shareText({ title: 'Trip', text: 'Body' })).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({ title: 'Trip', text: 'Body' });
  });

  it('distinguishes cancellation from failure', async () => {
    const abort = Object.assign(new Error('cancelled'), { name: 'AbortError' });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(abort),
    });
    await expect(shareText({ title: 'Trip', text: 'Body' })).resolves.toBe('cancelled');

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error('blocked')),
    });
    await expect(shareText({ title: 'Trip', text: 'Body' })).resolves.toBe('failed');
  });
});
