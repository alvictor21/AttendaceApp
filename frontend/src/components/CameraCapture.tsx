"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, X } from "lucide-react";

interface CameraCaptureProps {
  onPhotoTaken: (file: File) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onPhotoTaken, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<"preview" | "captured">("preview");
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Mulai kamera
  const startCamera = async (mode: "user" | "environment") => {
    try {
      // Hentikan stream lama kalau ada
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Tidak bisa mengakses kamera. Pastikan izin kamera sudah diberikan.");
      console.error(err);
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    // Cleanup: matikan kamera saat komponen di-unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  // Ambil foto dari frame video saat ini
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontal kalau kamera depan (mirror effect)
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    // Convert canvas ke File object
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      setCapturedUrl(url);
      setPhase("captured");

      // Matikan kamera setelah foto diambil
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    }, "image/jpeg", 0.9);
  };

  // Kirim foto yang sudah diambil ke parent
  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      onPhotoTaken(file);
    }, "image/jpeg", 0.9);
  };

  // Ulangi foto
  const handleRetake = () => {
    setCapturedUrl(null);
    setPhase("preview");
    startCamera(facingMode);
  };

  // Flip kamera depan/belakang
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setPhase("preview");
    setCapturedUrl(null);
  };

  const handleCancel = () => {
  // Matikan stream dulu sebelum panggil onCancel
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onCancel();
  };
  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col">

      {/* Tombol tutup */}
      <button
        onClick={handleCancel}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Area kamera / preview foto */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full text-white text-center px-6">
            <p className="text-sm">{error}</p>
          </div>
        ) : phase === "preview" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
          />
        ) : (
          capturedUrl && (
            <img
              src={capturedUrl}
              alt="Preview selfie"
              className="w-full h-full object-cover"
            />
          )
        )}

        {/* Canvas tersembunyi, dipakai untuk ambil frame dari video */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Kontrol bawah */}
      <div className="bg-black py-8 px-6 flex items-center justify-center gap-8">
        {phase === "preview" ? (
          <>
            {/* Flip kamera */}
            <button
              onClick={handleFlipCamera}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
            >
              <RefreshCw size={20} className="text-white" />
            </button>

            {/* Tombol foto */}
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white/50 shadow-lg active:scale-95 transition-transform"
            >
              <Camera size={32} className="text-gray-900" />
            </button>

            {/* Placeholder kosong biar tombol foto tetap di tengah */}
            <div className="w-12 h-12" />
          </>
        ) : (
          <>
            {/* Ulangi */}
            <button
              onClick={handleRetake}
              className="px-6 py-3 rounded-xl bg-white/20 text-white font-semibold text-sm"
            >
              Ulangi
            </button>

            {/* Gunakan foto ini */}
            <button
              onClick={handleConfirm}
              className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold text-sm"
            >
              Gunakan Foto
            </button>
          </>
        )}
      </div>

    </div>
  );
}