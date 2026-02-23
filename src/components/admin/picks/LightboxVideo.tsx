import { useState, useRef, useCallback } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface LightboxVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

const LightboxVideo = ({ src, poster, className }: LightboxVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedData={() => setIsLoading(false)}
        className={cn("cursor-pointer", className)}
      />
      {/* Ladeanimation */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      {/* Play-Button (nur wenn geladen und nicht playing) */}
      {!isPlaying && !isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={togglePlay}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-5 shadow-2xl">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      )}
    </>
  );
};

export default LightboxVideo;
