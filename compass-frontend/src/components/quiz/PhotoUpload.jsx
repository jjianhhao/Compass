import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Upload, Camera, X } from 'lucide-react';

const MAX_SIZE = 1024; // max dimension in px

function resizeImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };
    img.src = url;
  });
}

const PhotoUpload = forwardRef(function PhotoUpload({ disabled = false }, ref) {
  const [preview, setPreview] = useState(null); // data URL
  const [base64, setBase64] = useState(null); // without prefix
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImage(file);
    setPreview(dataUrl);
    setBase64(dataUrl.replace(/^data:image\/png;base64,/, ''));
  };

  const handleRemove = () => {
    setPreview(null);
    setBase64(null);
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  useImperativeHandle(ref, () => ({
    getImage: () => base64,
    isEmpty: () => !base64,
  }));

  if (preview && !disabled) {
    return (
      <div className="relative">
        <img
          src={preview}
          alt="Uploaded work"
          className="w-full max-h-80 object-contain rounded-xl border border-gray-200 bg-gray-50"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 p-1.5 rounded-full shadow transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  if (preview && disabled) {
    return (
      <img
        src={preview}
        alt="Uploaded work"
        className="w-full max-h-80 object-contain rounded-xl border border-gray-200 bg-gray-50 opacity-50"
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
      <p className="text-sm text-gray-400">Upload a photo of your work</p>
      <div className="flex gap-2">
        <label className="flex items-center gap-1.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg cursor-pointer transition-colors">
          <Upload size={15} /> Choose file
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={disabled}
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg cursor-pointer transition-colors">
          <Camera size={15} /> Take photo
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
});

export default PhotoUpload;
