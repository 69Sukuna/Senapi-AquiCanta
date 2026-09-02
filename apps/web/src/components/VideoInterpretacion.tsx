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
          className="group relative block w-full max-w-[220px] shrink-0 overflow-hidden rounded-xl border border-(--border) bg-[#1b2a4a]/5"
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
        className="inline-flex! items-center gap-2 rounded-lg border border-[#1e63b8]/25 bg-[#1e63b8]/8 px-4! py-2.5! text-sm font-semibold text-[#164a8c]! transition-colors duration-200 hover:border-[#1e63b8]/50 hover:bg-[#1e63b8]/15"
      >
        <PlayCircle size={16} /> Ver video de la interpretación
      </a>
    </div>
  );
}
