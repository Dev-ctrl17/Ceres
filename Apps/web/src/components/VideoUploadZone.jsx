import React, { useCallback, useState } from "react";
import { Film, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import pb from "@/lib/pocketbaseClient";

const VideoUploadZone = ({
  videos,
  onAddVideos,
  onRemoveVideo,
  existingVideos = [],
  onRemoveExistingVideo,
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
        f.type.startsWith("video/"),
      );
      if (files.length > 0) onAddVideos(files);
    },
    [onAddVideos],
  );

  const handleFileSelect = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) onAddVideos(files);
    },
    [onAddVideos],
  );

  const totalVideos = videos.length + existingVideos.length;

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
        <Film className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">Drag & drop videos here</h3>
        <p className="text-sm text-muted-foreground mb-4">
          MP4 or WebM up to 100MB each. Max 2 videos.
        </p>
        <input
          type="file"
          id="video-upload"
          multiple
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={handleFileSelect}
          disabled={totalVideos >= 2}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => document.getElementById("video-upload").click()}
          disabled={totalVideos >= 2}
        >
          Select Videos
        </Button>
      </div>

      {totalVideos > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Existing Videos */}
          {existingVideos.map((filename, idx) => (
            <div
              key={`ext-vid-${idx}`}
              className="relative group rounded-lg overflow-hidden border bg-muted p-2 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 truncate">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium truncate">{filename}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemoveExistingVideo(filename)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* New Videos */}
          {videos.map((file, idx) => (
            <div
              key={`new-vid-${idx}`}
              className="relative group rounded-lg overflow-hidden border bg-muted p-2 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 truncate">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5 text-primary" />
                </div>
                <div className="truncate">
                  <span className="text-sm font-medium truncate block">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemoveVideo(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoUploadZone;
