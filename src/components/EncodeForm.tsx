import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import ImageDropzone from './ImageDropzone';
import ImagePreview from './ImagePreview';
import { encodeMessage, fileToImageData, imageDataToBlob } from '@/lib/steganography';
import { Download } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 1000;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const EncodeForm: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isEncoding, setIsEncoding] = useState<boolean>(false);
  const [encodedImageUrl, setEncodedImageUrl] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setImage(file);
    // Reset encoded image when a new image is uploaded
    if (encodedImageUrl) {
      URL.revokeObjectURL(encodedImageUrl);
      setEncodedImageUrl(null);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length <= MAX_MESSAGE_LENGTH) {
      setMessage(newMessage);
    }
  };

  const handleEncode = async () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    if (!message) {
      toast.error('Please enter a message to hide');
      return;
    }

    try {
      setIsEncoding(true);
      
      // Convert File to ImageData
      const imageData = await fileToImageData(image);
      
      // Encode the message into the image
      const encodedImageData = encodeMessage(imageData, message, password);
      
      // Convert the encoded ImageData back to a blob
      const encodedBlob = await imageDataToBlob(encodedImageData);
      
      // Create a URL for the blob
      const encodedUrl = URL.createObjectURL(encodedBlob);
      
      // Clean up previous URL if it exists
      if (encodedImageUrl) {
        URL.revokeObjectURL(encodedImageUrl);
      }
      
      setEncodedImageUrl(encodedUrl);
      toast.success('Message successfully encoded into the image!');
    } catch (error) {
      toast.error(`Encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsEncoding(false);
    }
  };

  const handleDownload = () => {
    if (encodedImageUrl) {
      const a = document.createElement('a');
      a.href = encodedImageUrl;
      a.download = `encoded-${image?.name || 'image.png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Upload Image</h3>
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
              <h3 className="text-lg font-medium mb-4">Secret Message</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Message to Hide</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your secret message here..."
                    value={message}
                    onChange={handleMessageChange}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Character Count:</span>
                    <span className={`${message.length > MAX_MESSAGE_LENGTH * 0.9 ? 'text-amber-500' : ''} ${message.length === MAX_MESSAGE_LENGTH ? 'text-red-500' : ''}`}>
                      {message.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password (Optional)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Add an optional password for encryption"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    A password will encrypt your message for additional security.
                  </p>
                </div>
                
                <Button 
                  className="w-full bg-stegano-purple hover:bg-stegano-lightPurple"
                  onClick={handleEncode}
                  disabled={!image || !message || isEncoding}
                >
                  {isEncoding ? 'Encoding...' : 'Encode Message'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {encodedImageUrl && (
        <Card className="mt-6 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Encoded Image</h3>
              <Button 
                variant="outline"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
            <div className="flex justify-center">
              <img 
                src={encodedImageUrl} 
                alt="Encoded" 
                className="max-h-64 rounded shadow-md" 
              />
            </div>
            <p className="text-center mt-4 text-sm text-muted-foreground">
              Your message has been successfully hidden in this image. 
              {password && " Remember the password to decode it later!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EncodeForm;
