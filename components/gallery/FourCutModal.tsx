'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, RefreshCw, Check, Download, Upload, AlertCircle } from 'lucide-react';
import { uploadPhoto } from '@/app/actions/gallery';
import { cn } from '@/utils/cn';

interface FourCutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'idle' | 'capturing' | 'preview' | 'uploading';

export function FourCutModal({ isOpen, onClose }: FourCutModalProps) {
    const [step, setStep] = useState<Step>('idle');
    const [photos, setPhotos] = useState<string[]>([]);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [authorName, setAuthorName] = useState('');
    const [password, setPassword] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    const currentSlot = photos.length;

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Initialize camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', aspectRatio: 3 / 4 },
                audio: false,
            });
            streamRef.current = stream;
            setStep('capturing');
            setError(null);
            setPhotos([]);
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('카메라를 사용할 수 없습니다. 권한을 확인해주세요!');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        if (step === 'capturing' && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [step]);

    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setStep('idle');
            setPhotos([]);
            setCountdown(null);
            setError(null);
            setPassword('');
            setIsPrivate(false);
        }
        return () => stopCamera();
    }, [isOpen]);

    // Auto-trigger next countdown
    useEffect(() => {
        if (step === 'capturing' && photos.length > 0 && photos.length < 4 && countdown === null) {
            const timer = setTimeout(() => {
                startCountdown();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [photos.length, step, countdown]);

    const SLOT_CONFIG = [
        { key: 'right_up', x: 0.52, y: 0.02, w: 0.44, h: 0.35, overlay: '/photo_booth/right_up.PNG' },
        { key: 'right_down', x: 0.52, y: 0.39, w: 0.44, h: 0.35, overlay: '/photo_booth/right_down.PNG' },
        { key: 'left_up', x: 0.04, y: 0.26, w: 0.44, h: 0.35, overlay: '/photo_booth/left_up.PNG' },
        { key: 'left_down', x: 0.04, y: 0.63, w: 0.44, h: 0.35, overlay: '/photo_booth/left_down.PNG' },
    ];

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;
                const targetRatio = 0.838; // Matches slot ratio (approx 5:6 or 4:5)

                let sourceX = 0;
                let sourceY = 0;
                let sourceWidth = videoWidth;
                let sourceHeight = videoHeight;

                if (videoWidth / videoHeight > targetRatio) {
                    sourceWidth = videoHeight * targetRatio;
                    sourceX = (videoWidth - sourceWidth) / 2;
                } else {
                    sourceHeight = videoWidth / targetRatio;
                    sourceY = (videoHeight - sourceHeight) / 2;
                }

                // Output size for each cut
                canvas.width = 600;
                canvas.height = 716;

                // Flip horizontally for a mirror effect
                context.translate(600, 0);
                context.scale(-1, 1);

                context.drawImage(
                    video,
                    sourceX, sourceY, sourceWidth, sourceHeight,
                    0, 0, 600, 716
                );

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                setPhotos(prev => [...prev, dataUrl]);

                // We handle step progression either here or in another useEffect
                if (photos.length >= 3) {
                    setTimeout(() => {
                        setStep('preview');
                        stopCamera();
                    }, 500);
                }
            }
        }
    };

    const startCountdown = () => {
        if (countdown !== null) return;

        let count = 3;
        setCountdown(count);

        const timer = setInterval(() => {
            count -= 1;
            if (count === 0) {
                clearInterval(timer);
                setCountdown(null);
                capturePhoto();
            } else {
                setCountdown(count);
            }
        }, 1000);
    };

    const generateCollage = async (): Promise<File> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Canvas context not found');

            const frameImg = new Image();
            frameImg.onload = () => {
                const frameWidth = frameImg.width;
                const frameHeight = frameImg.height;
                canvas.width = frameWidth;
                canvas.height = frameHeight;

                // 1. Draw frame base
                ctx.drawImage(frameImg, 0, 0);

                let loadedCount = 0;
                photos.forEach(async (photoData, index) => {
                    const photoImg = new Image();
                    const overlayImg = new Image();

                    const config = SLOT_CONFIG[index];
                    const slotX = config.x * frameWidth;
                    const slotY = config.y * frameHeight;
                    const slotW = config.w * frameWidth;
                    const slotH = config.h * frameHeight;

                    const loadElements = () => {
                        return new Promise<void>((res) => {
                            let pLoaded = false;
                            let oLoaded = false;

                            photoImg.onload = () => {
                                pLoaded = true;
                                if (oLoaded) res();
                            };
                            overlayImg.onload = () => {
                                oLoaded = true;
                                if (pLoaded) res();
                            };

                            photoImg.src = photoData;
                            overlayImg.src = config.overlay;
                        });
                    };

                    await loadElements();

                    // Draw photo
                    ctx.drawImage(photoImg, slotX, slotY, slotW, slotH);
                    // Draw overlay
                    ctx.drawImage(overlayImg, slotX, slotY, slotW, slotH);

                    loadedCount++;
                    if (loadedCount === 4) {
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(new File([blob], 'four_cut.jpg', { type: 'image/jpeg' }));
                            } else {
                                reject('Failed to create blob');
                            }
                        }, 'image/jpeg', 0.95);
                    }
                });
            };
            frameImg.src = '/photo_booth/frame.jpeg?v=1';
        });
    };

    const handleDownload = async () => {
        setError(null);
        try {
            const collageFile = await generateCollage();
            const url = URL.createObjectURL(collageFile);
            const link = document.createElement('a');
            link.href = url;
            link.download = `인생네컷_${authorName || 'graduation'}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            setError('이미지 다운로드 중 오류가 발생했습니다.');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authorName) {
            setError('이름을 입력해주세요!');
            return;
        }

        setStep('uploading');
        setError(null);

        try {
            const collageFile = await generateCollage();
            const formData = new FormData();
            formData.append('file', collageFile);
            formData.append('author_name', authorName);
            formData.append('password', password);
            formData.append('is_public', (!isPrivate).toString());

            const result = await uploadPhoto(formData);

            if (result.error) {
                setError(result.error);
                setStep('preview');
            } else {
                onClose();
            }
        } catch (err) {
            console.error('Collage generation/upload error:', err);
            setError('이미지 생성 중 오류가 발생했습니다.');
            setStep('preview');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-black transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="flex-1 bg-white flex flex-col relative p-6 overflow-y-auto custom-scrollbar">
                            {step === 'idle' && (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-12">
                                    <div className="w-32 h-32 bg-black text-white rounded-full flex items-center justify-center shadow-2xl">
                                        <Camera size={64} />
                                    </div>
                                    <h3 className="text-4xl font-manseh">인생네컷 찍을 준비 됐나?</h3>
                                    <button
                                        onClick={startCamera}
                                        className="bg-black text-white px-12 py-5 font-manseh text-4xl hover:bg-gray-800 transition-all rounded-full shadow-lg"
                                    >
                                        시작하기!
                                    </button>
                                </div>
                            )}

                            {step === 'capturing' && (
                                <div className="w-full flex flex-col items-center justify-center space-y-6">
                                    <div className="relative aspect-[3/4] w-full max-w-[400px] bg-black rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-50">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover scale-x-[-1]"
                                        />

                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                            <div className="relative w-full h-full">
                                                {SLOT_CONFIG[currentSlot] && (
                                                    <img
                                                        src={SLOT_CONFIG[currentSlot].overlay}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {countdown !== null && (
                                                <motion.div
                                                    initial={{ scale: 2, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.5, opacity: 0 }}
                                                    className="absolute inset-0 flex items-center justify-center z-20"
                                                >
                                                    <span className="text-[140px] font-manseh text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                                                        {countdown}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <div id="flash" className="absolute inset-0 bg-white opacity-0 pointer-events-none transition-opacity duration-100 z-30" />
                                    </div>

                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            {[0, 1, 2, 3].map(i => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "w-5 h-5 rounded-full transition-all duration-300",
                                                        i < photos.length ? "bg-green-500 scale-110" : i === photos.length ? "bg-black animate-pulse scale-125" : "bg-gray-200"
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={startCountdown}
                                            disabled={countdown !== null}
                                            className="bg-black text-white px-12 py-4 rounded-full font-manseh text-3xl hover:bg-gray-800 disabled:opacity-50 shadow-xl transition-all active:scale-95"
                                        >
                                            찰칵! ({Math.min(photos.length + 1, 4)}/4)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(step === 'preview' || step === 'uploading') && (
                                <div className="w-full flex flex-col items-center space-y-10 py-4">
                                    {/* Collage Preview */}
                                    <div className="w-full max-w-[420px] aspect-[2/3] bg-white shadow-2xl relative border-8 border-gray-50 overflow-hidden flex-shrink-0">
                                        <img src="/photo_booth/frame.JPEG?v=1" className="w-full h-full object-contain" />
                                        {photos.map((photo, index) => {
                                            const config = SLOT_CONFIG[index];
                                            return (
                                                <div
                                                    key={index}
                                                    className="absolute overflow-hidden"
                                                    style={{
                                                        top: `${config.y * 100}%`,
                                                        left: `${config.x * 100}%`,
                                                        width: `${config.w * 100}%`,
                                                        height: `${config.h * 100}%`,
                                                        background: 'white'
                                                    }}
                                                >
                                                    <img src={photo} className="w-full h-full object-cover" />
                                                    <img
                                                        src={config.overlay}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Actions & Inputs Area */}
                                    <div className="w-full max-w-[420px] space-y-8 pb-10">
                                        {error && (
                                            <div className="p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 text-xl font-manseh">
                                                <AlertCircle size={24} /> {error}
                                            </div>
                                        )}

                                        <form onSubmit={handleUpload} className="space-y-8">
                                            <div className="space-y-6">
                                                <div className="border-b-4 border-gray-100 focus-within:border-black transition-colors px-2">
                                                    <label className="text-2xl text-gray-400 font-manseh">보내는 사람</label>
                                                    <input
                                                        type="text"
                                                        value={authorName}
                                                        onChange={e => setAuthorName(e.target.value)}
                                                        className="w-full py-4 outline-none text-4xl font-manseh bg-transparent text-center"
                                                        placeholder="이름을 입력해주세요"
                                                        required
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-4">
                                                    <div className="border-b-4 border-gray-100 focus-within:border-black transition-colors px-2">
                                                        <label className="text-2xl text-gray-400 font-manseh">비밀번호 (PIN)</label>
                                                        <input
                                                            type="password"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            value={password}
                                                            onChange={e => setPassword(e.target.value)}
                                                            className="w-full py-4 outline-none text-4xl font-manseh bg-transparent text-center"
                                                            placeholder="숫자 4자리"
                                                            maxLength={4}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="flex justify-center">
                                                        <div className="flex items-center gap-4 select-none group cursor-pointer">
                                                            <div className="relative w-10 h-10 flex items-center justify-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="is_private"
                                                                    checked={isPrivate}
                                                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                                                    className="peer sr-only"
                                                                />
                                                                <label
                                                                    htmlFor="is_private"
                                                                    className="absolute inset-0 border-4 border-gray-800 rounded-xl cursor-pointer transition-all group-hover:border-black peer-checked:bg-gray-800"
                                                                ></label>
                                                                <span className="absolute text-4xl text-white opacity-0 peer-checked:opacity-100 transition-opacity transform -rotate-12 translate-y-[-4px] pointer-events-none">
                                                                    v
                                                                </span>
                                                            </div>
                                                            <label
                                                                htmlFor="is_private"
                                                                className="text-3xl text-gray-800 cursor-pointer font-manseh group-hover:text-black"
                                                            >
                                                                🔒 승섭이만 보기 (비공개)
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {step === 'preview' && (
                                                <div className="flex flex-col gap-6">
                                                    <button
                                                        type="submit"
                                                        className="w-full bg-black text-white py-6 rounded-2xl font-manseh text-4xl hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-4 active:scale-[0.98]"
                                                    >
                                                        <Upload size={32} /> 게시하기
                                                    </button>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={handleDownload}
                                                            className="bg-blue-600 text-white py-5 rounded-2xl font-manseh text-2xl xs:text-3xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-3 whitespace-nowrap px-2"
                                                        >
                                                            <Download size={24} className="flex-shrink-0" /> 저장하기
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={startCamera}
                                                            className="border-4 border-gray-200 py-5 rounded-2xl font-manseh text-2xl xs:text-3xl hover:border-black transition-all flex items-center justify-center gap-3 whitespace-nowrap px-2"
                                                        >
                                                            <RefreshCw size={24} className="flex-shrink-0" /> 다시 찍기
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {step === 'uploading' && (
                                                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                                                    <div className="w-20 h-20 border-8 border-black border-t-transparent rounded-full animate-spin" />
                                                    <p className="text-4xl font-manseh">추억 인화 중...</p>
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Hidden canvas for generation */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            )}
        </AnimatePresence>
    );
}
