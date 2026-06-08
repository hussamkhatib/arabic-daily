import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';

const ImageEditor = forwardRef(function ImageEditor({ imageUrl }, ref) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fabricRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => fabricRef.current,
    exportPng: () => fabricRef.current?.toDataURL({ format: 'png', multiplier: 1 }),
  }));

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const fc = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#f3f4f6',
    });
    fabricRef.current = fc;

    let cancelled = false;

    if (imageUrl) {
      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          if (cancelled) return;
          const scale = Math.min(width / img.width, height / img.height);
          img.scale(scale);
          fc.setBackgroundImage(img, fc.renderAll.bind(fc), {
            originX: 'left',
            originY: 'top',
          });
        },
        { crossOrigin: 'anonymous' }
      );
    }

    return () => {
      cancelled = true;
      fc.dispose();
      fabricRef.current = null;
    };
  }, [imageUrl]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} />
    </div>
  );
});

export default ImageEditor;
