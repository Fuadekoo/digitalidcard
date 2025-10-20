"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  X,
  RotateCcw,
  Check,
  RefreshCw,
  AlertCircle,
  SwitchCamera,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonSpinner } from "@/components/ui/spinner";

interface CameraDevice {
  deviceId: string;
  label: string;
  facingMode?: string;
}

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  onCancel: () => void;
}

export default function CameraCapture({
  onCapture,
  onCancel,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  useEffect(() => {
    initializeCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Get available cameras
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      const cameras: CameraDevice[] = videoDevices.map((device, index) => {
        let label = device.label || `Camera ${index + 1}`;
        let facingMode = "";

        // Detect camera type from label
        if (
          label.toLowerCase().includes("back") ||
          label.toLowerCase().includes("rear")
        ) {
          facingMode = "environment";
          label = label || "Back Camera";
        } else if (label.toLowerCase().includes("front")) {
          facingMode = "user";
          label = label || "Front Camera";
        }

        return {
          deviceId: device.deviceId,
          label: label,
          facingMode: facingMode,
        };
      });

      setAvailableCameras(cameras);
      return cameras;
    } catch (error) {
      console.error("Error enumerating cameras:", error);
      return [];
    }
  };

  // Initialize camera for the first time
  const initializeCamera = async () => {
    await startCamera();
    const cameras = await getCameras();
    if (cameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(cameras[0].deviceId);
    }
  };

  const startCamera = async (cameraId?: string) => {
    try {
      setIsRetrying(false);
      setPermissionDenied(false);
      setIsCameraReady(false);
      setIsSwitchingCamera(false);

      const constraints: MediaStreamConstraints = {
        video: cameraId
          ? {
              deviceId: { exact: cameraId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraReady(true);
        setPermissionDenied(false);

        // Get cameras after permission is granted
        if (availableCameras.length === 0) {
          const cameras = await getCameras();
          if (cameras.length > 0 && !selectedCameraId) {
            setSelectedCameraId(cameras[0].deviceId);
          }
        }
      }
    } catch (error: unknown) {
      console.error("Error accessing camera:", error);

      // Check if permission was denied
      const errorName = error instanceof Error ? error.name : "";
      if (
        errorName === "NotAllowedError" ||
        errorName === "PermissionDeniedError"
      ) {
        setPermissionDenied(true);
        toast.error("Camera permission denied. Please allow camera access.");
      } else if (errorName === "NotFoundError") {
        toast.error("No camera found on this device.");
        setPermissionDenied(true);
      } else {
        toast.error("Failed to access camera. Please check permissions.");
        setPermissionDenied(true);
      }
      setIsCameraReady(false);
    }
  };

  const handleResetPermission = async () => {
    setIsRetrying(true);
    toast.info("Requesting camera permission again...");
    await startCamera(selectedCameraId || undefined);
    setIsRetrying(false);
  };

  const handleSwitchCamera = async () => {
    if (availableCameras.length < 2) return;

    setIsSwitchingCamera(true);
    stopCamera();

    // Find next camera
    const currentIndex = availableCameras.findIndex(
      (cam) => cam.deviceId === selectedCameraId
    );
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];

    setSelectedCameraId(nextCamera.deviceId);
    await startCamera(nextCamera.deviceId);

    toast.success(
      `Switched to ${nextCamera.label || `Camera ${nextIndex + 1}`}`
    );
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Define target dimensions for profile photo (square aspect ratio)
    const targetSize = 800; // 800x800 for high quality profile photo
    canvas.width = targetSize;
    canvas.height = targetSize;

    // Calculate scaling to cover the entire canvas while maintaining aspect ratio
    const videoAspect = video.videoWidth / video.videoHeight;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (videoAspect > 1) {
      // Video is wider than tall
      drawHeight = targetSize;
      drawWidth = targetSize * videoAspect;
      offsetX = -(drawWidth - targetSize) / 2;
      offsetY = 0;
    } else {
      // Video is taller than wide
      drawWidth = targetSize;
      drawHeight = targetSize / videoAspect;
      offsetX = 0;
      offsetY = -(drawHeight - targetSize) / 2;
    }

    // Draw the video frame centered and cropped to fill the square canvas
    context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          stopCamera();
        }
      },
      "image/jpeg",
      0.95
    );
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
        }
      },
      "image/jpeg",
      0.95
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Camera Controls at the top */}
          {!capturedImage && (
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex-1">
                {permissionDenied ? (
                  <Alert
                    variant="destructive"
                    className="border-red-500 bg-red-50 dark:bg-red-950"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-semibold">
                      Camera Permission Required
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="text-sm">
                        Camera access was denied. Click the button on the right
                        to request permission again. When prompted, click
                        &quot;Allow&quot; to grant camera access.
                      </p>
                    </AlertDescription>
                  </Alert>
                ) : isCameraReady ? (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Camera is ready
                    </span>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-600 animate-pulse" />
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      Initializing camera...
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={handleResetPermission}
                disabled={isRetrying || isSwitchingCamera}
                variant={permissionDenied ? "default" : "outline"}
                size="sm"
                className="shrink-0"
              >
                {isRetrying ? (
                  <>
                    <ButtonSpinner size={16} />
                    <span className="ml-2">Retrying...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Camera
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Camera/Preview Area */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square max-w-xl mx-auto">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isCameraReady && !permissionDenied && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-white text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}
                {isSwitchingCamera && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                    <div className="text-white text-center">
                      <SwitchCamera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                      <p>Switching camera...</p>
                    </div>
                  </div>
                )}
                {permissionDenied && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-white text-center p-6">
                      <AlertCircle className="h-16 w-16 mx-auto mb-3 text-red-400" />
                      <p className="text-lg font-semibold mb-2">
                        Camera Access Denied
                      </p>
                      <p className="text-sm text-gray-400">
                        Please allow camera permission above
                      </p>
                    </div>
                  </div>
                )}
                {/* Camera Switch Button - Top Right */}
                {isCameraReady &&
                  !permissionDenied &&
                  availableCameras.length > 1 && (
                    <div className="absolute top-4 right-4 z-20">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSwitchCamera}
                        disabled={isSwitchingCamera}
                        className="bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 text-white shadow-lg"
                        title="Switch Camera"
                      >
                        <SwitchCamera className="h-4 w-4 mr-2" />
                        Switch Camera
                      </Button>
                    </div>
                  )}
                {/* Camera info badge - Top Left */}
                {isCameraReady &&
                  !permissionDenied &&
                  availableCameras.length > 1 && (
                    <div className="absolute top-4 left-4 z-20">
                      <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1.5 rounded-full">
                        {availableCameras.find(
                          (cam) => cam.deviceId === selectedCameraId
                        )?.label || "Camera"}
                      </div>
                    </div>
                  )}
                {/* Camera guide overlay - Circular frame for profile photo */}
                {isCameraReady && !permissionDenied && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-4 border-white/40 rounded-full">
                      <div className="absolute top-[15%] left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                        Center your face in the circle
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover object-center"
              />
            )}
          </div>

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            {!capturedImage ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!isCameraReady || permissionDenied}
                  className="flex-1"
                  size="lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Photo
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={retakePhoto}
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button
                  type="button"
                  onClick={confirmPhoto}
                  className="flex-1"
                  size="lg"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Use This Photo
                </Button>
              </>
            )}
          </div>

          {!permissionDenied && (
            <p className="text-xs text-center text-muted-foreground">
              Make sure you are in a well-lit area for the best photo quality
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
