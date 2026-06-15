import React, { useCallback, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/lib/supabaseService";

const ImageUploadZone = ({
  images,
  onAddImages,
  onRemoveImage,
  existingImages = [],
  onRemoveExistingImage,
  record = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length > 0) onAddImages(files);
    },
    [onAddImages],
  );

  const handleFileSelect = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) onAddImages(files);
    },
    [onAddImages],
  );

  const totalImages = images.length + existingImages.length;

  const getImageUrl = (filename) => {
    if (!record) return null;
    return getFileUrl("property-images", filename) || filename;
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 bg-muted/30 hover:bg-muted/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">Drag & drop images here</h3>
        <p className="text-sm text-muted-foreground mb-4">
          JPG, PNG or WebP up to 5MB each. Max 6 images.
        </p>
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          disabled={totalImages >= 6}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => document.getElementById("image-upload").click()}
          disabled={totalImages >= 6}
        >
          Select Files
        </Button>
      </div>

      {totalImages > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Existing Images */}
          {existingImages.map((filename, idx) => (
            <div
              key={`ext-${idx}`}
              className="relative group aspect-video rounded-lg overflow-hidden border bg-muted"
            >
              <img
                src={getImageUrl(filename)}
                alt={`Property ${idx}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x300?text=Image";
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemoveExistingImage(filename)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* New Images */}
          {images.map((file, idx) => (
            <div
              key={`new-${idx}`}
              className="relative group aspect-video rounded-lg overflow-hidden border bg-muted"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`New upload ${idx}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                New
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemoveImage(idx)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;