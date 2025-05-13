
import React from 'react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  image: File | null;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, className }) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Clean up previous URL object to avoid memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);

      // Clean up on component unmount
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
    
    return undefined;
  }, [image]);

  if (!image || !previewUrl) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative rounded-lg overflow-hidden shadow-md">
        <img
          src={previewUrl}
          alt="Preview"
          className="max-h-64 object-contain"
        />
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {image.name} ({Math.round(image.size / 1024)} KB)
      </div>
    </div>
  );
};

export default ImagePreview;
