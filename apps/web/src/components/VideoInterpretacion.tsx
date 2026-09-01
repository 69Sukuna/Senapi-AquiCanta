import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

// Acepta watch?v=, youtu.be/ y variantes embed/shorts.
function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

export function VideoInterpretacion({ videoUrl }: { videoUrl: string }) {
  const youtubeId = getYoutubeId(videoUrl);

  return (
    <div className="mt-6! flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      {youtubeId && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block w-full max-w-[220px] shrink-0 overflow-hidden rounded-xl border border-[rgba(224,165,39,0.25)] bg-[rgba(0,0,0,0.3)]"
        >
          <Image
            src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
            alt="Previsualización del video de la interpretación"
            width={480}
            height={360}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors duration-200 group-hover:bg-black/40">
            <PlayCircle size={40} className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" />
          </span>
        </a>
      )}

      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex! items-center gap-2 rounded-lg border border-[rgba(224,165,39,0.35)] bg-[rgba(224,165,39,0.1)] px-4! py-2.5! text-sm font-semibold text-[#f4c94f]! transition-colors duration-200 hover:border-[rgba(224,165,39,0.6)] hover:bg-[rgba(224,165,39,0.18)]"
      >
        <PlayCircle size={16} /> Ver video de la interpretación
      </a>
    </div>
  );
}
