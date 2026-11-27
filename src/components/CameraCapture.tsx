'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check } from 'lucide-react';
import AvatarSilhouette from './AvatarSilhouette';
import GarmentSilhouette from './GarmentSilhouette';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void | Promise<void>;
  onClose: () => void;
  title: string;
  mode?: 'avatar' | 'garment';
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, title, mode = 'garment' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>();
  const [showSilhouette, setShowSilhouette] = useState(true);
  
  // Stati per lo Zoom
  const [zoom, setZoom] = useState(1);
  const [zoomCaps, setZoomCaps] = useState({ min: 1, max: 3, step: 0.1 });
  const [isNativeZoomSupported, setIsNativeZoomSupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let acquired: MediaStream | null = null;
    setReady(false);
    setCameraError(null);
    const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('camera-unavailable');
      const constraints: any = { 
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' },
        audio: false 
      };
      
      // Aggiungiamo risoluzione ideale
      if (typeof constraints.video === 'object') {
        constraints.video.width = { ideal: 1920 };
        constraints.video.height = { ideal: 1080 };
      }

      const s = await navigator.mediaDevices.getUserMedia(constraints);
      acquired = s;
      if (cancelled) { s.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = s;
      // Request permission first: some browsers hide devices until access is granted.
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      if (cancelled) return;
      setDevices(allDevices.filter(d => d.kind === 'videoinput'));
      
      const track = s.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities?.() || {};
      
      if (capabilities.zoom) {
        setIsNativeZoomSupported(true);
        const minZ = capabilities.zoom.min || 1;
        setZoomCaps({
          min: minZ,
          max: capabilities.zoom.max || 4,
          step: capabilities.zoom.step || 0.1
        });
        setZoom(minZ);
        // Forza lo zoom al minimo all'avvio
        try {
          await track.applyConstraints({
            advanced: [{ zoom: minZ } as any]
          });
        } catch (e) { console.warn("Initial zoom apply failed"); }
      } else {
        setIsNativeZoomSupported(false);
        setZoom(1);
        setZoomCaps({ min: 1, max: 3, step: 0.1 }); // Fallback digitale
      }

      if (cancelled) return;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
        if (!cancelled) setReady(true);
      }
    } catch (err) {
      console.error("Errore fotocamera:", err);
      acquired?.getTracks().forEach(track => track.stop());
      if (!cancelled) setCameraError('Impossibile accedere alla fotocamera. Verifica i permessi oppure scegli una foto.');
    }
    };
    void startCamera();
    return () => {
      cancelled = true;
      acquired?.getTracks().forEach(track => track.stop());
      if (streamRef.current === acquired) streamRef.current = null;
    };
  }, [deviceId]);

  useEffect(() => {
    if (!capturedImage && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => setReady(false));
    }
    return () => { if (capturedImage) URL.revokeObjectURL(capturedImage); };
  }, [capturedImage]);

  const submit = async () => {
    if (!capturedBlob || submitting) return;
    setSubmitting(true);
    try { await onCapture(capturedBlob); }
    finally { setSubmitting(false); }
  };

  const handleZoomChange = async (newZoom: number) => {
    setZoom(newZoom);
    if (isNativeZoomSupported && streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ zoom: newZoom } as any]
        });
      } catch (e) {
        setIsNativeZoomSupported(false);
        setZoomCaps({ min: 1, max: 3, step: 0.1 });
        setZoom(1);
      }
    }
  };

  const toggleCamera = () => {
    if (devices.length > 1) {
      const currentId = streamRef.current?.getVideoTracks()[0]?.getSettings().deviceId;
      const idx = devices.findIndex(device => device.deviceId === currentId);
      setDeviceId(devices[(idx + 1) % devices.length].deviceId);
    }
  };

  const capture = () => {
    if (!ready || !videoRef.current?.videoWidth) return;
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Risoluzione nativa del video
        const vW = video.videoWidth;
        const vH = video.videoHeight;
        
        canvas.width = vW;
        canvas.height = vH;
        
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        if (isNativeZoomSupported) {
          // Se lo zoom è nativo, disegnamo tutto il frame
          context.drawImage(video, 0, 0, vW, vH);
        } else {
          // Se lo zoom è digitale, dobbiamo ritagliare la sorgente
          const zoomFactor = zoom;
          const sW = vW / zoomFactor;
          const sH = vH / zoomFactor;
          const sX = (vW - sW) / 2;
          const sY = (vH - sH) / 2;
          
          context.drawImage(video, sX, sY, sW, sH, 0, 0, vW, vH);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            setCapturedBlob(blob);
            setCapturedImage(URL.createObjectURL(blob));
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'black',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', margin: 0 }}>{title}</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Tasto Trasparenza Silhouette */}
          <div 
            onClick={() => setShowSilhouette(!showSilhouette)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '20px', 
              border: '1px solid white', 
              fontSize: '10px', 
              fontWeight: 'bold',
              opacity: showSilhouette ? 1 : 0.4,
              cursor: 'pointer',
              backgroundColor: showSilhouette ? 'rgba(124, 77, 255, 0.3)' : 'transparent'
            }}
          >
            GUIDA: {showSilhouette ? 'ON' : 'OFF'}
          </div>
          <button type="button" aria-label="Cambia fotocamera" onClick={toggleCamera} disabled={devices.length < 2 || !!capturedImage}><RefreshCw size={24} /></button>
          <button type="button" aria-label="Chiudi fotocamera" onClick={onClose} disabled={submitting}><X size={24} /></button>
        </div>
      </div>

      {cameraError && <p role="alert" style={{ padding: '12px 20px' }}>{cameraError}</p>}
      <label style={{ padding: '12px 20px', cursor: 'pointer' }}>
        Scegli una foto dalla galleria
        <input type="file" accept="image/*" disabled={submitting} onChange={event => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (!file.type.startsWith('image/') || file.size > 20 * 1024 * 1024) {
            setCameraError('Scegli un’immagine fino a 20 MB.');
            return;
          }
          setCapturedBlob(file);
          setCapturedImage(URL.createObjectURL(file));
        }} />
      </label>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain', // Cambiato da 'cover' a 'contain' per vedere tutto
                backgroundColor: '#000',
                // Zoom Digitale visivo (se non supportato nativamente)
                transform: !isNativeZoomSupported ? `scale(${zoom})` : 'scale(1)',
                transition: 'transform 0.1s ease-out'
              }} 
            />
            {showSilhouette && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{ width: '80%', height: '80%', position: 'relative' }}>
                   {mode === 'avatar' ? <AvatarSilhouette /> : <GarmentSilhouette />}
                </div>
              </div>
            )}
            
            {/* Cursore Zoom */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '200px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              padding: '12px 20px',
              borderRadius: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', fontWeight: 'bold' }}>
                <span>1x</span>
                <span style={{ color: 'var(--primary)' }}>{zoom.toFixed(1)}x</span>
                <span>{zoomCaps.max}x</span>
              </div>
              <input 
                type="range"
                min={zoomCaps.min}
                max={zoomCaps.max}
                step={zoomCaps.step}
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Anteprima della foto" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        )}
      </div>

      <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center', gap: '40px', background: 'rgba(0,0,0,0.5)' }}>
        {!capturedImage ? (
          <button type="button" aria-label="Scatta foto" disabled={!ready}
            onClick={capture}
            style={{ 
              width: '70px', 
              height: '70px', 
              borderRadius: '50%', 
              backgroundColor: 'white', 
              border: '5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid black' }} />
          </button>
        ) : (
          <>
            <button type="button" aria-label="Ripeti foto" disabled={submitting} onClick={() => { setCapturedImage(null); setCapturedBlob(null); }} style={{ padding: '15px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <RefreshCw size={30} />
            </button>
            <button type="button" disabled={submitting}
              aria-label="Conferma foto" onClick={submit}
              style={{ padding: '15px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}
            >
              <Check size={30} />
            </button>
          </>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;
