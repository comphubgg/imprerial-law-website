// Alle Inhalte der Seite an einer Stelle. Einträge mit TODO sind Platzhalter,
// die aus den Screenshots nicht eindeutig hervorgingen.

export const org = {
  name: 'Imprerial Law',
  tagline: 'Developing talent. Winning together.',
  descriptor: 'Multi-title esports organization',
  founded: 2025,
  intro:
    'Imprerial Law is a multi-title esports organization built on strong presence, player development, branding and competition at the highest level.',
  about:
    'We combine professional structure, competitive passion and a modern brand presence — built for the next generation of esports.',
};

export const nav = [
  { label: 'Team', href: '/team' },
  { label: 'Timeline', href: '/timeline' },
  { label: 'Matches', href: '/matches' },
  { label: 'Contact', href: '/contact' },
  { label: 'Studio', href: '/studio' },
  { label: 'About', href: '/about' },
  { label: 'Join', href: '/join' },
  { label: 'Content', href: '/content' },
];

export const shopUrl = '#'; // TODO: Shop-Link eintragen

export const social = [
  { label: 'X', href: '#' }, // TODO
  { label: 'Instagram', href: '#' }, // TODO
];

export type Team = {
  slug: string;
  name: string;
  game: string;
  tone: 'blue' | 'red';
  players?: string[];
};

export const teams: Team[] = [
  { slug: 'latam', name: 'LATAM Team', game: 'Counter-Strike 2', tone: 'blue' },
  // TODO: vollständige Namen prüfen (auf dem Screenshot abgeschnitten)
  { slug: 'vanguard', name: 'Team Vanguard', game: 'Counter-Strike 2', tone: 'red' },
  { slug: 'challengers', name: 'Challengers', game: 'Counter-Strike 2', tone: 'blue' },
  { slug: 'fortnite-pro', name: 'Fortnite Pro', game: 'Fortnite', tone: 'blue' },
];

// Spielernamen aus dem Ticker der Startseite. TODO: Rollen/Teams ergänzen.
export const players = ['PANK', 'krOwa', 'PAINj'];

export const creators = [
  // TODO: echte Namen, Handles und Bilder eintragen
  { name: 'Creator One', platform: 'Twitch', game: 'Counter-Strike', url: '#' },
  { name: 'Creator Two', platform: 'Twitch', game: 'Counter-Strike', url: '#' },
];

export const matches: { date: string; team: string; opponent: string; event: string; result?: string }[] = [
  // TODO: echte Matches eintragen. Leer = "Keine anstehenden Matches".
];

export const timeline: { year: string; title: string; text: string }[] = [
  { year: '2025', title: 'Imprerial Law is founded', text: 'The organization launches as a multi-title esports project.' },
  // TODO: weitere Meilensteine ergänzen
];
