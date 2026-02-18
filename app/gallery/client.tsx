'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Maximize2, X } from 'lucide-react';
import { Database } from '@/types/database.types';
import { UploadPhotoModal } from '@/components/gallery/UploadPhotoModal';
import { format } from 'date-fns';

type Photo = Database['public']['Tables']['photos']['Row'] & { publicUrl: string };

export function GalleryClient({ initialPhotos }: { initialPhotos: Photo[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    return (
        <>
            <div className="flex justify-end mb-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brown-900 text-paper px-6 py-3 rounded-full font-jua text-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                    <Upload size={20} />
                    사진 올리기
                </motion.button>
            </div>

            {initialPhotos.length === 0 ? (
                <div className="text-center py-20 text-brown-900/40 font-gamja text-xl border-dashed border-2 border-brown-200 rounded-3xl">
                    아직 공유된 추억이 없어요. 첫 번째 사진을 올려주세요!
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {initialPhotos.map((photo, index) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            break-inside="avoid"
                            className="bg-white p-3 shadow-md rounded-xl hover:shadow-xl transition-shadow cursor-pointer group break-inside-avoid-column"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <div className="relative overflow-hidden rounded-lg aspect-auto">
                                <img
                                    src={photo.publicUrl}
                                    alt={photo.caption || 'Uploaded photo'}
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Maximize2 className="text-white drop-shadow-lg" />
                                </div>
                            </div>

                            <div className="mt-3 px-1">
                                <div className="font-jua text-brown-900 truncate">
                                    {photo.author_name}
                                </div>
                                {photo.caption && (
                                    <p className="text-sm font-gamja text-brown-900/70 truncate">
                                        {photo.caption}
                                    </p>
                                )}
                                <div className="text-xs text-brown-900/30 text-right mt-1 font-mono">
                                    {format(new Date(photo.created_at), 'yy.MM.dd')}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <UploadPhotoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <motion.img
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={selectedPhoto.publicUrl}
                        alt={selectedPhoto.caption || 'Full view'}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    />
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white"
                    >
                        <X size={32} />
                    </button>

                    {(selectedPhoto.caption || selectedPhoto.author_name) && (
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white p-4 bg-black/50 backdrop-blur-md">
                            <p className="font-jua text-xl">{selectedPhoto.author_name}</p>
                            {selectedPhoto.caption && <p className="font-gamja text-lg opacity-80">{selectedPhoto.caption}</p>}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

