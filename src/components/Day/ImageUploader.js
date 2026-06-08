import { useDropzone } from 'react-dropzone';

const MAX_IMAGES = 4;

export default function ImageUploader({ currentCount, onDrop, uploading, error }) {
  const remaining = MAX_IMAGES - currentCount;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: remaining,
    disabled: remaining === 0 || uploading,
  });

  if (remaining === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-3">
        Maximum of {MAX_IMAGES} images reached for today.
      </p>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50'}
          ${uploading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-gray-500">
              {isDragActive ? 'Drop images here' : `Drop images or click to upload (${remaining} remaining)`}
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
