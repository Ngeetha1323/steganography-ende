
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface ModeToggleProps {
  mode: 'encode' | 'decode';
  onModeChange: (mode: 'encode' | 'decode') => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center justify-center gap-4 p-2 bg-slate-100 rounded-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('encode')}
        className={cn(
          "rounded-full px-6 py-2 transition-all",
          mode === 'encode' && "bg-white shadow-md text-stegano-purple font-medium"
        )}
      >
        <ToggleLeft className="mr-2 h-4 w-4" />
        Encode
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('decode')}
        className={cn(
          "rounded-full px-6 py-2 transition-all",
          mode === 'decode' && "bg-white shadow-md text-stegano-blue font-medium"
        )}
      >
        <ToggleRight className="mr-2 h-4 w-4" />
        Decode
      </Button>
    </div>
  );
};

export default ModeToggle;
