
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import ImageDropzone from './ImageDropzone';
import ImagePreview from './ImagePreview';
import { decodeMessage, fileToImageData } from '@/lib/steganography';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const DecodeForm: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setImage(file);
    // Reset decoded message when a new image is uploaded
    setDecodedMessage(null);
  };

  const handleDecode = async () => {
    if (!image) {
      toast.error('Please upload an encoded image first');
      return;
    }

    try {
      setIsDecoding(true);
      
      // Convert File to ImageData
      const imageData = await fileToImageData(image);
      
      // Decode the message from the image
      const message = decodeMessage(imageData, password);
      
      setDecodedMessage(message);
      toast.success('Message successfully decoded!');
    } catch (error) {
      toast.error(`Decoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDecodedMessage(null);
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Upload Encoded Image</h3>
              <ImageDropzone 
                onImageUpload={handleImageUpload} 
                maxSize={MAX_FILE_SIZE} 
              />
              {image && (
                <div className="mt-4">
                  <ImagePreview image={image} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Decode Secret Message</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password (if required)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password if the message was encrypted"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If the message was encrypted with a password, enter it here.
                  </p>
                </div>
                
                <Button 
                  className="w-full bg-stegano-blue hover:bg-blue-500"
                  onClick={handleDecode}
                  disabled={!image || isDecoding}
                >
                  {isDecoding ? 'Decoding...' : 'Reveal Hidden Message'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {decodedMessage !== null && (
        <Card className="mt-6 animate-fade-in">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Revealed Message</h3>
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="whitespace-pre-wrap break-words">{decodedMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DecodeForm;
