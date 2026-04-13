'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check } from 'lucide-react';
import AvatarSilhouette from './AvatarSilhouette';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
  title: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  // Stati per lo Zoom
  const [zoom, setZoom] = useState(1);
  const [zoomCaps, setZoomCaps] = useState({ min: 1, max: 3, step: 0.1 });
  const [isNativeZoomSupported, setIsNativeZoomSupported] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 }, // Alziamo la qualità per lo zoom digitale
          height: { ideal: 1080 }
        }, 
        audio: false 
      });
      
      const track = s.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities?.() || {};
      
      if (capabilities.zoom) {
        setIsNativeZoomSupported(true);
        setZoomCaps({
          min: capabilities.zoom.min || 1,
          max: capabilities.zoom.max || 4,
          step: capabilities.zoom.step || 0.1
        });
        setZoom(capabilities.zoom.min || 1);
      } else {
        setIsNativeZoomSupported(false);
        setZoom(1);
        setZoomCaps({ min: 1, max: 3, step: 0.1 }); // Fallback digitale
      }

      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(e => console.error("Auto-play failed", e));
      }
    } catch (err) {
      console.error("Errore fotocamera:", err);
      alert("Impossibile accedere alla fotocamera. Verifica i permessi.");
    }
  };

  const handleZoomChange = async (newZoom: number) => {
    setZoom(newZoom);
    if (isNativeZoomSupported && stream) {
      const track = stream.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ zoom: newZoom } as any]
        });
      } catch (e) {
        console.warn("Native zoom apply failed, using digital fallback", e);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });
      setStream(null);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capture = () => {
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
        }, 'image/jpeg', 0.95);
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
          <RefreshCw onClick={toggleCamera} size={24} style={{ cursor: 'pointer', opacity: 0.8 }} />
          <X onClick={onClose} size={24} style={{ cursor: 'pointer' }} />
        </div>
      </div>

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
                objectFit: 'cover',
                // Zoom Digitale visivo (se non supportato nativamente)
                transform: !isNativeZoomSupported ? `scale(${zoom})` : 'scale(1)',
                transition: 'transform 0.1s ease-out'
              }} 
            />
            <AvatarSilhouette />
            
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
          <img src={capturedImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center', gap: '40px', background: 'rgba(0,0,0,0.5)' }}>
        {!capturedImage ? (
          <div 
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
          </div>
        ) : (
          <>
            <div onClick={() => setCapturedImage(null)} style={{ padding: '15px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <RefreshCw size={30} />
            </div>
            <div 
              onClick={() => capturedBlob && onCapture(capturedBlob)} 
              style={{ padding: '15px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}
            >
              <Check size={30} />
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;
