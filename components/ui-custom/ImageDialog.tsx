import * as React from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type ImageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  images: { url: string; altText: string }[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
};

export function ImageDialog({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNext,
  onPrev,
}: ImageDialogProps) {
  if (!isOpen) {
    return null;
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (

    <div
      className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >

      <div className="relative" onClick={handleContentClick}>
        <Zoom>
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].altText}
            width={500}
            height={1000}

            className="max-w-[calc(100vw-4rem)] max-h-[calc(100vh-10rem)] object-contain"
          />
        </Zoom>
      </div>


      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-full"
        onClick={handleContentClick}
      >
        <button
          onClick={onPrev}
          className="text-gray-600 hover:text-gray-900"
          aria-label="Previous image"
        >
          <ChevronLeft size={32} />
        </button>

        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900"
          aria-label="Close dialog"
        >
          <X size={24} />
        </button>

        <button
          onClick={onNext}
          className="text-gray-600 hover:text-gray-900"
          aria-label="Next image"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}