// Editable public content. Phase 4 will provide staff content-management tools.
// null rates and empty media/announcement lists are deliberate: nothing invented.
export const site = {
  name: 'Jomeca Center',
  tagline: 'Where Memories Play.',
  address: 'Mapandan Town Center, Poblacion, Mapandan, Pangasinan',
  shortAddress: 'Mapandan, Pangasinan',
  phone: '0916 204 1085',
  phoneHref: 'tel:+639162041085',
  email: 'jomecacenter@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61594421305183',
  hours: '9:00 AM–12 midnight',
  days: 'Every day',
  onlineReservationsOpen: false,
  brandStatus:
    'User-supplied Jomeca Center logo; Phase 6 visual direction in review.',
};

export type Sport = 'pickleball' | 'basketball' | 'badminton';
export interface Facility {
  id: Sport;
  name: string;
  count: number;
  descriptor: string;
  description: string;
  note: string;
  rateCentavos: number | null;
}
export const facilities: Facility[] = [
  {
    id: 'pickleball',
    name: 'Pickleball',
    count: 4,
    descriptor: 'Bring your doubles crew.',
    description:
      'Four courts for rallies, friendly matches, and a little healthy competition. Bring your regular group or make room for someone new.',
    note: 'Choose from four separate courts.',
    rateCentavos: null,
  },
  {
    id: 'basketball',
    name: 'Gymnasium',
    count: 1,
    descriptor: 'One venue. More possibilities.',
    description:
      'Book the gymnasium for a game, celebration or community gathering. One shared venue, with booking arrangements to suit its use.',
    note: 'Venue and event uses share one availability calendar.',
    rateCentavos: null,
  },
  {
    id: 'badminton',
    name: 'Badminton',
    count: 1,
    descriptor: 'A good rally goes a long way.',
    description:
      'Make time for a match with friends or a focused session with your playing partner. One dedicated badminton court, ready for your next rally.',
    note: 'One court for your preferred session.',
    rateCentavos: null,
  },
];

export const faqs = [
  {
    question: 'What can we play at Jomeca Center?',
    answer:
      'Our facility has one gymnasium, one badminton court, and four pickleball courts. The gymnasium can also be used as an event venue.',
  },
  {
    question: 'What are your operating hours?',
    answer:
      'Our current hours are 9:00 AM to 12 midnight, seven days a week, in Philippine time. Midnight is the end of that day’s operating schedule. Please contact us to confirm holiday hours or special closures.',
  },
  {
    question: 'Can I reserve online already?',
    answer:
      'You can check the court schedule online. Reservation requests open only after approved prices and booking policies are configured. Checking availability or obtaining a quote does not hold a court. Any accepted request remains pending until payment verification and staff approval.',
  },
  {
    question: 'Where can I find your rates?',
    answer:
      'Court rates, peak schedules, membership offers, and event packages are being finalized. We will publish approved prices here. Contact us for current information before making any payment.',
  },
  {
    question: 'How will payment and confirmation work?',
    answer:
      'At launch, payment will be through staff-configured GCash, Maya, or bank QR instructions. Staff will check payment against actual account records and manually approve the booking. Uploading a screenshot alone will not confirm a reservation.',
  },
  {
    question: 'How long can I book a court?',
    answer:
      'The initial sports booking guidelines are one to four hours, up to 30 days ahead, with a one-hour cutoff. These are subject to the final published booking rules and availability.',
  },
  {
    question: 'Can we hold a private event?',
    answer:
      'Yes, the gymnasium converts into an event venue. Initial event guidelines are four to twelve hours, up to twelve months ahead, with a seven-day cutoff. Setup, teardown, packages, and special arrangements need staff review.',
  },
  {
    question: 'Will equipment be available to rent?',
    answer:
      'Balls and rackets are planned as optional rentals. The equipment list, stock, and prices are being finalized. Please check with our team rather than assuming an item will be available.',
  },
];

export const navigation = [
  { to: '/', label: 'Home' },
  { to: '/facilities', label: 'Courts & rates' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/about', label: 'Our story' },
  { to: '/memberships', label: 'Membership & packages' },
  { to: '/events', label: 'Leagues & announcements' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/faqs', label: 'FAQs & policies' },
  { to: '/contact', label: 'Visit & contact' },
];

export const pageMeta: Record<string, { title: string; description: string }> =
  {
    '/': {
      title: 'Where Memories Play.',
      description:
        'Discover gymnasium, badminton, pickleball and private events at Jomeca Center in Mapandan, Pangasinan.',
    },
    '/facilities': {
      title: 'Courts & rates',
      description:
        'Explore our six courts across the gymnasium, badminton and pickleball. Approved rates will be published here.',
    },
    '/reservations': {
      title: 'Reservations',
      description:
        'Plan a preferred court session at Jomeca Center. Online reservations are not open yet.',
    },
    '/gymnasium': {
      title: 'Gymnasium',
      description:
        'Plan a celebration or community gathering at Jomeca Center’s convertible gymnasium.',
    },
    '/about': {
      title: 'Our story',
      description:
        'A community hub for sports, celebrations and shared memories in Mapandan, Pangasinan.',
    },
    '/memberships': {
      title: 'Membership & packages',
      description:
        'Membership benefits, equipment rentals and event packages are being finalized.',
    },
    '/events': {
      title: 'Leagues & announcements',
      description:
        'Future tournaments, leagues and community announcements from Jomeca Center.',
    },
    '/gallery': {
      title: 'Gallery',
      description:
        'Explore sports, celebrations and moments that bring people together.',
    },
    '/faqs': {
      title: 'FAQs & policies',
      description:
        'Find operating hours, planned booking guidance and policy approval status.',
    },
    '/contact': {
      title: 'Visit & contact',
      description:
        'Find Jomeca Center at Mapandan Town Center, Poblacion, Mapandan, Pangasinan.',
    },
    '/staff': {
      title: 'Staff sign in',
      description: 'Secure access for authorized Jomeca Center staff.',
    },
    '/staff/booking': {
      title: 'Booking configuration',
      description:
        'Authorized staff configuration of schedules, prices and booking policies.',
    },
    '/staff/operations': {
      title: 'Reservation operations',
      description: 'Authorized reservation calendar and manual payment review.',
    },
    '/staff/notifications': {
      title: 'Notification operations',
      description:
        'Authorized notification queue and worker/backup monitoring.',
    },
    '/reservation-status': {
      title: 'Reservation status',
      description:
        'Privately check your reservation and submit manual payment proof.',
    },
  };
