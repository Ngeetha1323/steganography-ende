
import React, { useState } from 'react';
import ModeToggle from '@/components/ModeToggle';
import EncodeForm from '@/components/EncodeForm';
import DecodeForm from '@/components/DecodeForm';

const Index = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Steganography<span className="text-stegano-purple"> Web</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A simple steganography tool to hide your secret messages inside images
            and decode them later.
          </p>
        </header>

        <div className="flex flex-col items-center mb-10">
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>

        <div className="w-full max-w-6xl mx-auto">
          {mode === 'encode' ? <EncodeForm /> : <DecodeForm />}
        </div>

        <footer className="text-center mt-16 text-sm text-gray-500">
          <p>
            Steganography is the practice of concealing messages within other non-secret data or a physical object.
          </p>
          <p className="mt-2">
            Only PNG and JPEG formats are supported. Maximum file size: 100MB.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
