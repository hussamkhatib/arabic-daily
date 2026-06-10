import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';

const ImageEditor = forwardRef(function ImageEditor({ imageUrl, onModified }, ref) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fabricRef = useRef(null);
  const onModifiedRef = useRef(onModified);

  useEffect(() => { onModifiedRef.current = onModified; }, [onModified]);

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
      isDrawingMode: true,
    });
    fc.freeDrawingBrush.color = '#ef4444';
    fc.freeDrawingBrush.width = 4;
    fabricRef.current = fc;

    const notify = () => onModifiedRef.current?.();
    fc.on('object:added', notify);
    fc.on('object:modified', notify);
    fc.on('object:removed', notify);
    fc.on('path:created', notify);

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
