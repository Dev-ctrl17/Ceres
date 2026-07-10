import React, { useState, useRef, useEffect, useCallback } from "react";
import { Maximize2, Minimize2, Download, Printer, Share2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BrochureViewer = ({ pdfUrl, title }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        toast.error("Fullscreen is not supported on this device");
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = title ? `${title.replace(/\s+/g, "_")}.pdf` : "brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading brochure...");
  }, [pdfUrl, title]);

  // Handle print
  const handlePrint = useCallback(() => {
    if (!pdfUrl) return;
    const printWindow = window.open(pdfUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      toast.error("Please allow pop-ups to print");
    }
  }, [pdfUrl]);

  // Handle share
  const handleShare = useCallback(async () => {
    const shareData = {
      title: title || "Investment Brochure",
      text: `Check out this investment brochure: ${title}`,
      url: window.location.href,
    };

    if (navigator.share && window.innerWidth <= 768) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  }, [title]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  // Zoom controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  // Handle iframe load
  const handleIframeLoad = () => {
    setLoading(false);
    setLoadError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setLoadError(true);
  };

  if (!pdfUrl) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-500">No brochure available</p>
        </div>
      </div>
    );
  }

  // Detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-lg border border-gray-200 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-2 hidden sm:inline">
            {title || "Brochure"}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={zoom <= 0.5}
              className="h-8 w-8 p-0"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-500 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={zoom >= 3}
              className="h-8 w-8 p-0"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block" />

          {/* Action buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8"
            title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 mr-1" />
            ) : (
              <Maximize2 className="w-4 h-4 mr-1" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen ? "Exit" : "Fullscreen"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8"
            title="Download PDF"
          >
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Download</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="h-8"
            title="Print PDF"
          >
            <Printer className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Print</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-8"
            title="Share brochure"
          >
            <Share2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        ref={containerRef}
        className={`relative bg-gray-200 rounded-b-lg border border-t-0 border-gray-200 overflow-hidden ${
          isFullscreen ? "h-screen" : "h-[70vh] sm:h-[80vh]"
        }`}
      >
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Loading brochure...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center max-w-md px-4">
              <p className="text-gray-500 mb-2">Failed to load the brochure.</p>
              <p className="text-sm text-gray-400 mb-4">
                The PDF may be unavailable or there was a network error.
              </p>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF Instead
              </Button>
            </div>
          </div>
        )}

        {/* PDF iframe with Google Docs viewer for mobile, direct for desktop */}
        {isMobile ? (
          <iframe
            ref={iframeRef}
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            className="w-full h-full"
            title={title || "Brochure PDF"}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allowFullScreen
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=${zoom}`}
            className="w-full h-full"
            title={title || "Brochure PDF"}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            allowFullScreen
          />
        )}
      </div>

      {/* Direct download link for fallback */}
      <div className="mt-2 text-center">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Open PDF in new tab
        </a>
      </div>
    </div>
  );
};

export default BrochureViewer;