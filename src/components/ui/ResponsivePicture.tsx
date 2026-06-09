type ResponsivePictureProps = {
  webpSrc: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
};

export function ResponsivePicture({
  webpSrc,
  fallbackSrc,
  alt,
  className,
  imgClassName,
  loading = "lazy",
  fetchPriority,
  sizes = "100vw",
}: ResponsivePictureProps) {
  return (
    <picture className={className}>
      <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
      <img
        src={fallbackSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        sizes={sizes}
        className={imgClassName}
      />
    </picture>
  );
}
