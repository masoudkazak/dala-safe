import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  POOR_ACCURACY_THRESHOLD_METERS,
  useGeolocation,
  type GeolocationErrorLike,
  type GeolocationPositionLike,
  type GeolocationProvider,
} from './useGeolocation';

type SuccessCallback = (position: GeolocationPositionLike) => void;
type ErrorCallback = (error: GeolocationErrorLike) => void;

const VALID_POSITION: GeolocationPositionLike = {
  coords: { latitude: 43.23895, longitude: 76.88971, accuracy: 35 },
};

function Harness({ provider }: { provider?: GeolocationProvider | null }) {
  const geo = useGeolocation({ provider });
  return (
    <div>
      <output data-testid="status">{geo.status}</output>
      <output data-testid="position">
        {geo.position ? `${geo.position.latitude},${geo.position.longitude}` : 'none'}
      </output>
      <output data-testid="accuracy">{geo.position?.accuracy ?? 'none'}</output>
      <output data-testid="poor">{geo.isPoorAccuracy ? 'yes' : 'no'}</output>
      <output data-testid="threshold">{geo.poorAccuracyThreshold}</output>
      <button type="button" onClick={geo.requestLocation}>
        request
      </button>
      <button type="button" onClick={geo.reset}>
        reset
      </button>
    </div>
  );
}

function installGeolocation(
  impl?: (success: SuccessCallback, error: ErrorCallback) => void,
): ReturnType<typeof vi.fn> {
  const getCurrentPosition = vi.fn((success: SuccessCallback, error?: ErrorCallback) => {
    impl?.(success, error ?? (() => undefined));
  });
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition },
  });
  return getCurrentPosition;
}

let originalGeolocation: PropertyDescriptor | undefined;

beforeEach(() => {
  originalGeolocation = Object.getOwnPropertyDescriptor(navigator, 'geolocation');
});

afterEach(() => {
  if (originalGeolocation) {
    Object.defineProperty(navigator, 'geolocation', originalGeolocation);
  } else {
    Reflect.deleteProperty(navigator as object, 'geolocation');
  }
});

describe('useGeolocation', () => {
  it('reports unsupported when the browser has no geolocation API and never throws', async () => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined });
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByTestId('status')).toHaveTextContent('unsupported');
    await user.click(screen.getByRole('button', { name: 'request' }));
    expect(screen.getByTestId('status')).toHaveTextContent('unsupported');
  });

  it('starts in prompt and moves to requesting without a position', async () => {
    installGeolocation();
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByTestId('status')).toHaveTextContent('prompt');
    await user.click(screen.getByRole('button', { name: 'request' }));

    expect(screen.getByTestId('status')).toHaveTextContent('requesting');
    expect(screen.getByTestId('position')).toHaveTextContent('none');
  });

  it('reports granted with position and accuracy', async () => {
    let successCallback: SuccessCallback | undefined;
    installGeolocation((success) => {
      successCallback = success;
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() => successCallback?.(VALID_POSITION));

    expect(screen.getByTestId('status')).toHaveTextContent('granted');
    expect(screen.getByTestId('position')).toHaveTextContent('43.23895,76.88971');
    expect(screen.getByTestId('accuracy')).toHaveTextContent('35');
    expect(screen.getByTestId('poor')).toHaveTextContent('no');
  });

  it('flags poor accuracy above the configured threshold', async () => {
    let successCallback: SuccessCallback | undefined;
    installGeolocation((success) => {
      successCallback = success;
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() =>
      successCallback?.({ coords: { latitude: 43.23895, longitude: 76.88971, accuracy: 420 } }),
    );

    expect(screen.getByTestId('status')).toHaveTextContent('granted');
    expect(screen.getByTestId('poor')).toHaveTextContent('yes');
    expect(screen.getByTestId('threshold')).toHaveTextContent(String(POOR_ACCURACY_THRESHOLD_METERS));
  });

  it('handles a missing accuracy value without claiming it is precise', async () => {
    let successCallback: SuccessCallback | undefined;
    installGeolocation((success) => {
      successCallback = success;
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() => successCallback?.({ coords: { latitude: 43.2, longitude: 76.9 } }));

    expect(screen.getByTestId('status')).toHaveTextContent('granted');
    expect(screen.getByTestId('accuracy')).toHaveTextContent('none');
    expect(screen.getByTestId('poor')).toHaveTextContent('no');
  });

  it('maps permission denial to denied', async () => {
    let errorCallback: ErrorCallback | undefined;
    installGeolocation((_success, error) => {
      errorCallback = error;
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() => errorCallback?.({ code: 1, message: 'denied' }));

    expect(screen.getByTestId('status')).toHaveTextContent('denied');
    expect(screen.getByTestId('position')).toHaveTextContent('none');
  });

  it('maps timeout to timeout', async () => {
    let errorCallback: ErrorCallback | undefined;
    installGeolocation((_success, error) => {
      errorCallback = error;
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() => errorCallback?.({ code: 3, message: 'timeout' }));

    expect(screen.getByTestId('status')).toHaveTextContent('timeout');
  });

  it.each([
    [2, 'unavailable'],
    [99, 'unavailable'],
  ] as const)('maps error code %s to %s', async (code, expected) => {
    let errorCallback: ErrorCallback | undefined;
    installGeolocation((_success, error) => {
      errorCallback = error;
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() => errorCallback?.({ code }));

    expect(screen.getByTestId('status')).toHaveTextContent(expected);
  });

  it('rejects malformed coordinates without throwing', async () => {
    let successCallback: SuccessCallback | undefined;
    installGeolocation((success) => {
      successCallback = success;
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() =>
      successCallback?.({
        coords: { latitude: Number.NaN, longitude: 76.9, accuracy: 20 },
      }),
    );

    expect(screen.getByTestId('status')).toHaveTextContent('unavailable');
  });

  it('never throws when the service throws synchronously', async () => {
    installGeolocation(() => {
      throw new Error('hardware failure');
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    expect(screen.getByTestId('status')).toHaveTextContent('unavailable');
  });

  it('supports retry after a denial', async () => {
    let successCallback: SuccessCallback | undefined;
    let errorCallback: ErrorCallback | undefined;
    const getCurrentPosition = installGeolocation((success, error) => {
      successCallback = success;
      errorCallback = error;
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() => errorCallback?.({ code: 1 }));
    expect(screen.getByTestId('status')).toHaveTextContent('denied');

    await user.click(screen.getByRole('button', { name: 'request' }));
    expect(screen.getByTestId('status')).toHaveTextContent('requesting');
    act(() => successCallback?.(VALID_POSITION));

    expect(screen.getByTestId('status')).toHaveTextContent('granted');
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
  });

  it('reset returns to prompt and clears the position', async () => {
    let successCallback: SuccessCallback | undefined;
    installGeolocation((success) => {
      successCallback = success;
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() => successCallback?.(VALID_POSITION));
    expect(screen.getByTestId('status')).toHaveTextContent('granted');

    await user.click(screen.getByRole('button', { name: 'reset' }));
    expect(screen.getByTestId('status')).toHaveTextContent('prompt');
    expect(screen.getByTestId('position')).toHaveTextContent('none');
  });

  it('accepts an injected provider for deterministic tests', async () => {
    let successCallback: SuccessCallback | undefined;
    const provider: GeolocationProvider = {
      getCurrentPosition: (success) => {
        successCallback = success;
      },
    };
    const user = userEvent.setup();
    render(<Harness provider={provider} />);

    expect(screen.getByTestId('status')).toHaveTextContent('prompt');
    await user.click(screen.getByRole('button', { name: 'request' }));
    act(() => successCallback?.(VALID_POSITION));

    expect(screen.getByTestId('status')).toHaveTextContent('granted');
  });

  it('ignores callbacks after unmount and does not throw', async () => {
    let successCallback: SuccessCallback | undefined;
    let errorCallback: ErrorCallback | undefined;
    installGeolocation((success, error) => {
      successCallback = success;
      errorCallback = error;
    });
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'request' }));
    unmount();

    expect(() => successCallback?.(VALID_POSITION)).not.toThrow();
    expect(() => errorCallback?.({ code: 1 })).not.toThrow();
  });
});
