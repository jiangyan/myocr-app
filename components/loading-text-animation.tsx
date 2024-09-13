"use client"

import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface LoadingTextAnimationProps {
  text: string
}

export function LoadingTextAnimationComponent({ text }: LoadingTextAnimationProps) {
  return (
    <div className={`h-full flex items-center ${inter.className}`}>
      <div className="relative overflow-hidden w-full">
        <div
          className="whitespace-nowrap inline-block animate-slide"
          style={{
            backgroundImage: 'linear-gradient(to right, #9CA3AF 0%, #9CA3AF 40%, #111827 50%, #9CA3AF 60%, #9CA3AF 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            backgroundSize: '200% 100%',
          }}
        >
          {text}
        </div>
      </div>
      <style jsx>{`
        @keyframes slide {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-slide {
          animation: slide 3s linear infinite;
        }
      `}</style>
    </div>
  );
}