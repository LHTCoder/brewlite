'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header({
  title,
  back,
  right,
}: {
  title: string;
  back?: boolean | string;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-brew-100 bg-cream/95 px-3 py-3 backdrop-blur">
      {back ? (
        typeof back === 'string' ? (
          <Link href={back} aria-label="Quay lại" className="rounded-full p-2 text-brew-700 active:bg-brew-100">
            <BackIcon />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Quay lại"
            className="rounded-full p-2 text-brew-700 active:bg-brew-100"
          >
            <BackIcon />
          </button>
        )
      ) : (
        <span className="ml-1 text-xl" aria-hidden="true">
          ☕
        </span>
      )}
      <h1 className="flex-1 truncate text-lg font-bold">{title}</h1>
      {right}
    </header>
  );
}

function BackIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
