import { useState } from 'react';
import { CourtArt } from '@/components/court-art';
import { stockMedia, type StockMediaKey } from '@/content/media';

export function StockPhoto({
  kind,
  priority = false,
  sizes = '(max-width: 650px) 100vw, 50vw',
}: {
  kind: StockMediaKey;
  priority?: boolean;
  sizes?: string;
}) {
  const image = kind === 'basketball' ? 'gymnasium' : kind;
  const [failed, setFailed] = useState(false);
  return failed ? (
    <CourtArt sport={image === 'gymnasium' ? 'events' : image} />
  ) : (
    <img
      src={`${import.meta.env.BASE_URL}media/stock/${image}-1200.webp`}
      srcSet={`${import.meta.env.BASE_URL}media/stock/${image}-640.webp 640w, ${import.meta.env.BASE_URL}media/stock/${image}-1200.webp 1200w`}
      sizes={sizes}
      alt={stockMedia[image].alt}
      width={1200}
      height={stockMedia[image].height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
