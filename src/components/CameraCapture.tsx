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

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera(); // Ferma il flusso precedente prima di iniziare quello nuovo
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        // Importante per iOS: forza il play
        videoRef.current.play().catch(e => console.error("Auto-play failed", e));
      }
    } catch (err) {
      console.error("Errore fotocamera:", err);
      alert("Impossibile accedere alla fotocamera. Verifica i permessi del browser.");
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
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
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
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <AvatarSilhouette />
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
