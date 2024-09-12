import React from 'react';
import Image from 'next/image';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageModal({ src, alt, onClose }: ImageModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="max-w-4xl max-h-4xl relative" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          layout="responsive"
          width={800}
          height={600}
          objectFit="contain"
        />
        <button
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}