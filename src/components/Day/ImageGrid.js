import ImageCard from './ImageCard';

export default function ImageGrid({ images, session, onDelete }) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {images.map(img => (
        <ImageCard key={img.id} image={img} session={session} onDelete={onDelete} />
      ))}
    </div>
  );
}
