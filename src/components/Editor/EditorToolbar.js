import { useState } from 'react';
import { fabric } from 'fabric';

const COLORS = [
  { value: '#000000', label: 'Black' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#22c55e', label: 'Green' },
];

export default function EditorToolbar({ getCanvas, onSave, saving }) {
  const [activeTool, setActiveTool] = useState('pen');
  const [color, setColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(4);

  function getfc() {
    return getCanvas?.();
  }

  function setTool(tool) {
    const fc = getfc();
    if (!fc) return;
    setActiveTool(tool);
    fc.isDrawingMode = tool === 'pen';
    fc.selection = tool === 'select';
    if (tool === 'pen') {
      fc.freeDrawingBrush.color = color;
      fc.freeDrawingBrush.width = brushSize;
    }
  }

  function addText() {
    const fc = getfc();
    if (!fc) return;
    setActiveTool('select');
    fc.isDrawingMode = false;
    const text = new fabric.IText('Type here', {
      left: fc.width / 2,
      top: fc.height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 22,
      fill: color,
      fontFamily: 'Arial',
    });
    fc.add(text);
    fc.setActiveObject(text);
    text.enterEditing();
    fc.renderAll();
  }

  function undo() {
    const fc = getfc();
    if (!fc) return;
    const objects = fc.getObjects();
    if (objects.length > 0) {
      fc.remove(objects[objects.length - 1]);
      fc.renderAll();
    }
  }

  function clearAll() {
    const fc = getfc();
    if (!fc) return;
    if (!window.confirm('Clear all annotations?')) return;
    fc.getObjects().forEach(obj => fc.remove(obj));
    fc.renderAll();
  }

  function applyColor(c) {
    setColor(c);
    const fc = getfc();
    if (!fc) return;
    if (fc.isDrawingMode) {
      fc.freeDrawingBrush.color = c;
    }
    const active = fc.getActiveObject();
    if (active) {
      active.set(active.type === 'i-text' || active.type === 'text' ? 'fill' : 'stroke', c);
      fc.renderAll();
    }
  }

  function applyBrushSize(size) {
    setBrushSize(size);
    const fc = getfc();
    if (fc?.isDrawingMode) fc.freeDrawingBrush.width = size;
  }

  const btn = (active) =>
    `flex items-center justify-center rounded-lg w-10 h-10 transition-colors border ${
      active
        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
    }`;

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3">
      {/* Tools */}
      <button onClick={() => setTool('select')} className={btn(activeTool === 'select')} title="Select / Move">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
        </svg>
      </button>

      <button onClick={() => setTool('pen')} className={btn(activeTool === 'pen')} title="Draw">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <button onClick={addText} className={btn(false)} title="Add text">
        <span className="text-sm font-bold">T</span>
      </button>

      <div className="w-px h-7 bg-gray-200" />

      {/* Colors */}
      <div className="flex items-center gap-2">
        {COLORS.map(c => (
          <button
            key={c.value}
            onClick={() => applyColor(c.value)}
            title={c.label}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${
              color === c.value ? 'border-gray-500 scale-125' : 'border-white shadow hover:scale-110'
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      <div className="w-px h-7 bg-gray-200" />

      {/* Brush size */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Size</span>
        <select
          value={brushSize}
          onChange={e => applyBrushSize(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded px-1.5 py-1"
        >
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
        </select>
      </div>

      <div className="w-px h-7 bg-gray-200" />

      {/* Undo & Clear */}
      <button onClick={undo} className={btn(false)} title="Undo last stroke">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      <button onClick={clearAll} className={btn(false)} title="Clear all">
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Save */}
      <div className="ml-auto">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : 'Save'}
        </button>
      </div>
    </div>
  );
}
