import { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import SignaturePad from 'signature_pad';
import { Undo2, Trash2 } from 'lucide-react';

const DrawingCanvas = forwardRef(function DrawingCanvas({ disabled = false }, ref) {
  const canvasRef = useRef(null);
  const padRef = useRef(null);
  const containerRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = container.clientWidth;
    const height = 300;

    // Save current data
    const data = padRef.current?.toData();

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Restore data
    if (data && data.length > 0) {
      padRef.current?.fromData(data);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePad(canvas, {
      penColor: '#1e293b',
      minWidth: 1.5,
      maxWidth: 3,
      throttle: 16,
      backgroundColor: 'rgb(255, 255, 255)',
    });

    pad.addEventListener('endStroke', () => {
      setIsEmpty(pad.isEmpty());
    });

    padRef.current = pad;
    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      pad.off();
    };
  }, [resizeCanvas]);

  useEffect(() => {
    if (padRef.current) {
      disabled ? padRef.current.off() : padRef.current.on();
    }
  }, [disabled]);

  const handleUndo = () => {
    const pad = padRef.current;
    if (!pad) return;
    const data = pad.toData();
    if (data.length > 0) {
      data.pop();
      pad.fromData(data);
      setIsEmpty(pad.isEmpty());
    }
  };

  const handleClear = () => {
    const pad = padRef.current;
    if (!pad) return;
    pad.clear();

    // Re-fill white background after clear
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    setIsEmpty(true);
  };

  // Expose getImage to parent via ref
  useImperativeHandle(ref, () => ({
    getImage: () => {
      const pad = padRef.current;
      if (!pad || pad.isEmpty()) return null;
      // toDataURL returns "data:image/png;base64,..." — strip prefix
      const dataUrl = pad.toDataURL('image/png');
      return dataUrl.replace(/^data:image\/png;base64,/, '');
    },
    isEmpty: () => isEmpty,
  }));

  return (
    <div ref={containerRef} className="w-full">
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className={`touch-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'}`}
        />
        {isEmpty && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-300 text-sm">Draw your answer here...</p>
          </div>
        )}
      </div>
      {!disabled && (
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={isEmpty}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 size={13} /> Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isEmpty}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      )}
    </div>
  );
});

export default DrawingCanvas;
