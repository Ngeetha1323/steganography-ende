
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void;
  maxSize?: number;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageUpload,
  maxSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive, 
    isDragAccept, 
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxSize,
    multiple: false
  });

  // Error handling for rejected files
  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.name} className="text-red-500 text-sm mt-2">
      {file.name} - {errors.map(e => e.message).join(', ')}
    </li>
  ));

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          "hover:border-stegano-purple hover:bg-slate-50",
          isDragActive && "border-blue-500 bg-blue-50",
          isDragAccept && "border-green-500 bg-green-50",
          isDragReject && "border-red-500 bg-red-50",
          "flex flex-col items-center justify-center"
        )}
      >
        <input {...getInputProps()} />
        <Upload 
          className={cn(
            "h-12 w-12 mb-4",
            isDragActive ? "text-blue-500" : "text-gray-400",
            isDragAccept && "text-green-500",
            isDragReject && "text-red-500"
          )} 
        />
        <p className="text-sm text-gray-500">
          {isDragActive
            ? 'Drop the image here...'
            : 'Drag & drop an image, or click to select'}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Supports PNG, JPEG (max {Math.round(maxSize / (1024 * 1024))}MB)
        </p>
      </div>
      
      {fileRejectionItems.length > 0 && (
        <ul className="mt-2">{fileRejectionItems}</ul>
      )}
    </div>
  );
};

export default ImageDropzone;
