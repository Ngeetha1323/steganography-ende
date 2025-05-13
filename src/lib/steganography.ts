
/**
 * Simple steganography implementation using the Least Significant Bit (LSB) technique
 */

// Function to encode a message into an image
export const encodeMessage = (
  imageData: ImageData,
  message: string,
  password?: string
): ImageData => {
  // Create a copy of the image data to avoid modifying the original
  const encodedData = new Uint8ClampedArray(imageData.data);
  
  // If password is provided, simple encryption using XOR
  let processedMessage = message;
  if (password && password.length > 0) {
    processedMessage = encryptMessage(message, password);
  }
  
  // Convert the message to binary
  const binaryMessage = toBinary(processedMessage + "END_OF_MESSAGE");
  
  // Check if the message is too large for the image
  if (binaryMessage.length > encodedData.length * 0.25) {
    throw new Error("Message is too large for this image");
  }
  
  // Encode the message length first (32 bits for length)
  const messageLengthBinary = binaryMessage.length.toString(2).padStart(32, '0');
  
  // Encode the message length
  for (let i = 0; i < 32; i++) {
    // Only modify the least significant bit
    encodedData[i] = (encodedData[i] & 0xFE) | parseInt(messageLengthBinary[i]);
  }
  
  // Encode the actual message
  for (let i = 0; i < binaryMessage.length; i++) {
    // Start after the length encoding (index 32)
    encodedData[i + 32] = (encodedData[i + 32] & 0xFE) | parseInt(binaryMessage[i]);
  }
  
  // Create a new ImageData object with the encoded data
  return new ImageData(encodedData, imageData.width, imageData.height);
};

// Function to decode a message from an image
export const decodeMessage = (
  imageData: ImageData,
  password?: string
): string => {
  const data = imageData.data;
  
  // Extract the message length first
  let messageLengthBinary = '';
  for (let i = 0; i < 32; i++) {
    messageLengthBinary += (data[i] & 1).toString();
  }
  
  // Convert the binary message length to decimal
  const messageLength = parseInt(messageLengthBinary, 2);
  
  // Extract the message
  let binaryMessage = '';
  for (let i = 0; i < messageLength; i++) {
    binaryMessage += (data[i + 32] & 1).toString();
  }
  
  // Convert the binary message back to text
  let decodedMessage = fromBinary(binaryMessage);
  
  // Check for the end marker
  const endMarkerIndex = decodedMessage.indexOf("END_OF_MESSAGE");
  if (endMarkerIndex === -1) {
    throw new Error("Invalid encoded image or wrong password");
  }
  
  // Remove the end marker
  decodedMessage = decodedMessage.substring(0, endMarkerIndex);
  
  // Decrypt if password was used
  if (password && password.length > 0) {
    try {
      decodedMessage = decryptMessage(decodedMessage, password);
    } catch (e) {
      throw new Error("Invalid password");
    }
  }
  
  return decodedMessage;
};

// Helper function to convert text to binary
function toBinary(text: string): string {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

// Helper function to convert binary to text
function fromBinary(binary: string): string {
  let result = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    result += String.fromCharCode(parseInt(byte, 2));
  }
  return result;
}

// Simple XOR encryption/decryption for demonstration
function encryptMessage(message: string, password: string): string {
  return message
    .split('')
    .map((char, index) => {
      const keyChar = password.charCodeAt(index % password.length);
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    })
    .join('');
}

// Decrypt XOR encrypted message
function decryptMessage(encrypted: string, password: string): string {
  return encryptMessage(encrypted, password); // XOR is symmetric
}

// Function to convert ImageData to a Blob
export const imageDataToBlob = (
  imageData: ImageData,
  type: string = 'image/png'
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Create a canvas to draw the image data
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    // Get the canvas context and put the image data
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Convert the canvas to a Blob
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Could not create blob from canvas'));
      }
    }, type);
  });
};

// Function to convert a file to ImageData
export const fileToImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    // Create image element
    const img = new Image();
    img.onload = () => {
      // Create canvas and get context
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      try {
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      } catch (e) {
        reject(new Error('Could not get image data'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Set image source from file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
