import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import {
  Camera,
  Upload,
  X,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

/**
 * Extracts certificate ID from any scanned QR text or verification URL
 * @param {string} rawText 
 * @returns {string} Clean certificate ID or path
 */
export function extractCertificateIdFromQr(rawText) {
  if (!rawText) return '';
  const trimmed = rawText.trim();

  // If it's a URL (e.g., https://domain.com/credentials/CERT-2026-0001 or /verify/CERT-2026-0001)
  try {
    const url = new URL(trimmed);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      // The last segment is usually the certificate ID or UUID
      return pathParts[pathParts.length - 1].replace(/\?.*$/, '');
    }
  } catch (e) {
    // Not a strict URL, check standard path or raw ID
    const match = trimmed.match(/(?:credentials|verify)\/([A-Za-z0-9-]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Raw Certificate ID e.g. CERT-2026-0001 or f3e7b730-f86d-49ba-b5d0-19e0cbc3d103
  return trimmed;
}

export default function QrScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'file'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const [scanError, setScanError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [detectedCode, setDetectedCode] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera helper
  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start camera helper
  const startCamera = async () => {
    stopCamera();
    setScanError('');
    setDetectedCode(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const constraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
        setCameraActive(true);
        setScanning(true);
        scanFrame();
      }
    } catch (err) {
      console.error('[QR Scanner] Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setScanError('Camera permission was denied. Please allow camera access in your browser settings or upload an image below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setScanError('No camera found on this device. You can upload a photo of the certificate QR code instead.');
      } else {
        setScanError(err.message || 'Unable to access camera.');
      }
      setCameraActive(false);
    }
  };

  // Continuous frame analysis loop
  const scanFrame = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameIdRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      handleQrFound(code.data);
      return; // Stop scanning loop
    }

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  // Handle successful detection
  const handleQrFound = (rawText) => {
    stopCamera();
    const certId = extractCertificateIdFromQr(rawText);
    setDetectedCode({ raw: rawText, certId });

    // Short success delay before redirecting
    setTimeout(() => {
      onClose();
      navigate(`/credentials/${certId}`);
    }, 1200);
  };

  // Handle file upload scanning
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError('');
    setDetectedCode(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleQrFound(code.data);
        } else {
          setScanError('No QR code could be detected in this image. Please upload a clear photo or screenshot containing the certificate QR code.');
        }
      };
      img.onerror = () => {
        setScanError('Failed to load image file.');
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  // Toggle camera facing (front vs rear)
  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      setDetectedCode(null);
      setScanError('');
      if (activeTab === 'camera') {
        startCamera();
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, cameraFacing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-serif">Certificate QR Scanner</h3>
              <p className="text-xs text-slate-300">Instant Authenticity & Real-Time Verification</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls: Camera vs File Upload */}
        <div className="flex p-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setScanError('');
            }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-gold-500" />
            <span>Live Camera Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('file');
              setScanError('');
            }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'file'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-gold-500" />
            <span>Upload Certificate / Image</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Success Overlay when QR Code is detected */}
          {detectedCode ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-bold text-navy-950 font-serif">Certificate QR Verified!</h4>
              <p className="text-xs text-slate-600">
                Identified Credential: <span className="font-mono font-bold text-navy-950">{detectedCode.certId}</span>
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Redirecting to Official Credsverse Record...</span>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: LIVE CAMERA VIEW */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  <div className="relative aspect-square max-h-[320px] w-full mx-auto rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-slate-300 shadow-inner">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                    />

                    {/* Viewfinder Target Framing Graphic */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* Target Box */}
                        <div className="w-56 h-56 relative border-2 border-gold-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(15,31,56,0.6)]">
                          {/* Corner Brackets */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-gold-400 rounded-tl" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-gold-400 rounded-tr" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-gold-400 rounded-bl" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-gold-400 rounded-br" />

                          {/* Animated Laser Scanning Line */}
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] absolute top-0 animate-scan-line" />
                        </div>
                      </div>
                    )}

                    {!cameraActive && !scanError && (
                      <div className="text-center p-6 space-y-2 text-slate-400">
                        <Camera className="w-10 h-10 mx-auto animate-pulse text-gold-400" />
                        <p className="text-xs font-semibold">Starting camera stream...</p>
                      </div>
                    )}
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <p className="leading-snug">
                      Align the QR code on the certificate within the frame to verify authenticity.
                    </p>
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition-colors shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-navy-800" />
                      <span>Flip Camera</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD IMAGE / SCREENSHOT */}
              {activeTab === 'file' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-gold-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/60 hover:bg-gold-50/20 transition-all space-y-3 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto text-gold-500 group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-navy-950 text-sm">
                        Click to upload certificate photo or screenshot
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports PNG, JPG, JPEG, WEBP files
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-semibold">
                        Browse Files
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    HR & Recruiters: You can drag and drop any certificate scan or phone photo here to instantly verify validity against the central registry.
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {scanError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{scanError}</p>
                    {activeTab === 'camera' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('file')}
                        className="text-navy-900 font-bold underline block"
                      >
                        Try Uploading an Image Instead →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Direct Central Registry Verification</span>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
