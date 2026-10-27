const mediaRoot = import.meta.env.BASE_URL + 'media/';
// User-approved stock direction. Provenance and usage notes: docs/media-register.md.
export const brandLogo = {
  src: mediaRoot + 'brand/jomeca-center-logo.jpg',
  width: 702,
  height: 257,
  alt: 'Jomeca Center',
};

export const stockMedia = {
  gymnasium: {
    height: 1800,
    name: 'Gymnasium',
    alt: 'Sunlit indoor gymnasium with a wooden floor and tall windows',
    credit: 'cottonbro studio',
    source: 'https://www.pexels.com/photo/gymnasium-wooden-floor-7201556/',
  },
  basketball: {
    height: 1800,
    name: 'Gymnasium',
    alt: 'Indoor basketball hoop and wooden court',
    credit: 'Mattia Graziani',
    source: 'https://unsplash.com/photos/tJ6GF320Y64',
  },
  badminton: {
    height: 794,
    name: 'Badminton',
    alt: 'Blue indoor badminton court',
    credit: 'Palak Pitroda',
    source: 'https://unsplash.com/photos/R3S6YdeHA6A',
  },
  pickleball: {
    height: 1800,
    name: 'Pickleball',
    alt: 'Pickleball paddle and ball on a court',
    credit: 'eedgar ivann',
    source: 'https://unsplash.com/photos/zpy9Lh5aRgg',
  },
  events: {
    height: 1797,
    name: 'Private events',
    alt: 'Decorated celebration table',
    credit: 'Fotógrafo Samuel Cruz',
    source: 'https://unsplash.com/photos/ai_SOQHl8hQ',
  },
} as const;
export type StockMediaKey = keyof typeof stockMedia;

export const courtFilm = {
  src: mediaRoot + 'stock/court-film.mp4',
  poster: mediaRoot + 'stock/gymnasium-1200.webp',
  credit: 'PNW Production',
  source: 'https://www.pexels.com/video/video-of-a-basketball-court-8979131/',
};

export const sportsHero = {
  src: mediaRoot + 'stock/sports-hero-loop.mp4',
  poster: mediaRoot + 'stock/gymnasium-1200.webp',
  credits: [
    {
      sport: 'Gymnasium',
      creator: 'PNW Production',
      source: courtFilm.source,
    },
    {
      sport: 'Badminton',
      creator: '林林',
      source: 'https://www.pexels.com/video/people-in-badminton-court-5991161/',
    },
    {
      sport: 'Pickleball',
      creator: 'Frank Schrader',
      source:
        'https://www.pexels.com/video/aerial-pickleball-match-on-blue-court-32041192/',
    },
  ],
};
