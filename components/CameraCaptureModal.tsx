import React, { useRef, useEffect, useState } from 'react';
import { XIcon, CheckIcon, ArrowPathIcon } from './icons';

interface CameraCaptureModalProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

type CameraStatus = 'initializing' | 'streaming' | 'captured' | 'error';

const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CameraStatus>('initializing');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retakeCounter, setRetakeCounter] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    
    // Always reset to initializing when this effect runs
    setStatus('initializing');
    setCapturedImage(null);

    const startStream = async () => {
      // Clean up any existing stream before starting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (!videoRef.current) {
        if (!isCancelled) {
          setStatus('error');
          setErrorMessage('Video element failed to load. Please try again.');
        }
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });

        if (isCancelled) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Await the play() promise to ensure the video is ready
          await videoRef.current.play();
          
          if (!isCancelled) {
            setStatus('streaming');
          }
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if (!isCancelled) {
          let msg = "Could not access camera. Please check permissions.";
          if (err instanceof Error && err.name === 'NotAllowedError') {
            msg = "Camera access was denied. Please grant permission in your browser settings.";
          }
          setErrorMessage(msg);
          setStatus('error');
        }
      }
    };

    startStream();

    // Cleanup function runs on unmount or before the effect re-runs
    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [retakeCounter]); // Re-run effect only when retakeCounter changes

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && status === 'streaming') {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
        setStatus('captured');
        
        // Stop stream and video element after capture
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }
      }
    }
  };

  const handleRetake = () => {
    setRetakeCounter(prev => prev + 1);
  };
  
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const renderControls = () => {
      switch (status) {
          case 'streaming':
            return (
                <button
                    onClick={handleCapture}
                    className="w-20 h-20 rounded-full bg-white/20 border-4 border-white p-1 flex items-center justify-center transition-transform active:scale-95"
                    aria-label="Capture photo"
                >
                    <div className="w-full h-full rounded-full bg-white" />
                </button>
            );
          case 'captured':
            return (
                <div className="flex items-center justify-around w-full max-w-sm">
                  <button
                    onClick={handleRetake}
                    className="flex flex-col items-center text-white/90 hover:text-white transition-colors space-y-1"
                    aria-label="Retake photo"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowPathIcon className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-semibold">Retake</span>
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex flex-col items-center text-white/90 hover:text-white transition-colors space-y-1"
                    aria-label="Use this photo"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckIcon className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-semibold">Use Photo</span>
                  </button>
                </div>
            );
          default:
              return null;
      }
  }
  
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black animate-fadeIn"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-20">
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors bg-black/30 rounded-full p-2"
          aria-label="Close camera view"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'streaming' ? 'opacity-100' : 'opacity-0'}`}
        />

        {capturedImage && (
            <img
                src={capturedImage}
                alt="Captured preview"
                className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
            />
        )}
        
        {/* Overlays for different states */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${status === 'initializing' || status === 'error' ? 'opacity-100' : 'opacity-0'}`}>
            {status === 'initializing' && (
                <div className="flex flex-col items-center justify-center text-white text-center p-8">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                    <p className="text-lg font-semibold">Starting Camera...</p>
                </div>
            )}
            {status === 'error' && (
                <div className="text-white text-center p-8">
                    <p className="text-lg font-semibold">Camera Error</p>
                    <p className="mt-2 text-sm">{errorMessage}</p>
                    <button
                        onClick={handleRetake}
                        className="mt-6 px-4 py-2 bg-white/20 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center z-20">
        {renderControls()}
      </div>
    </div>
  );
};

export default CameraCaptureModal;