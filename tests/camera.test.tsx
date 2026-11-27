import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CameraCapture from '../src/components/CameraCapture';

const stop = vi.fn();
const track = { stop, getCapabilities: () => ({}), getSettings: () => ({ deviceId: 'rear' }) };
const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
const getUserMedia = vi.fn();
const enumerateDevices = vi.fn();
const props = { title: 'Nuova foto', onCapture: vi.fn(), onClose: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia, enumerateDevices } });
  getUserMedia.mockResolvedValue(stream);
  enumerateDevices.mockResolvedValue([{ kind: 'videoinput', deviceId: 'rear' }]);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Camera lifecycle', () => {
  it('requests permission before listing devices and releases the stream on close', async () => {
    const view = render(<CameraCapture {...props} />);
    await waitFor(() => expect(enumerateDevices).toHaveBeenCalled());
    expect(getUserMedia.mock.invocationCallOrder[0]).toBeLessThan(enumerateDevices.mock.invocationCallOrder[0]);
    view.unmount();
    expect(stop).toHaveBeenCalledOnce();
  });

  it('stops a stream even when camera permission resolves after closing', async () => {
    let resolve!: (value: unknown) => void;
    getUserMedia.mockImplementation(() => new Promise(done => { resolve = done; }));
    const view = render(<CameraCapture {...props} />);
    view.unmount();
    resolve(stream);
    await waitFor(() => expect(stop).toHaveBeenCalledOnce());
    expect(enumerateDevices).not.toHaveBeenCalled();
  });

  it('allows a gallery photo when camera access fails, revoking its preview on close', async () => {
    getUserMedia.mockRejectedValue(new Error('denied'));
    const view = render(<CameraCapture {...props} />);
    await screen.findByRole('alert');
    const file = new File(['photo'], 'photo.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Scegli una foto dalla galleria'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Conferma foto' }));
    await waitFor(() => expect(props.onCapture).toHaveBeenCalledWith(file));
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });
});
