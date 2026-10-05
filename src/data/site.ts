// Alle Inhalte der Seite an einer Stelle (Stand: imprerial-law.com, Okt 2026).

export const org = {
  name: 'Imprerial Law',
  tagline: 'Developing talent. Winning together.',
  descriptor: 'Multi-title esports organization',
  founded: 2025,
  email: 'business@imprerial-law.com',
  intro:
    'Imprerial Law is a multi-title esports organization built on strong presence, player development, branding and competition at the highest level.',
  about:
    'We combine professional structure, competitive passion and a modern brand presence — built for the next generation of esports.',
};

export const announcement = 'Signing now — players, creators & staff welcome. Apply today!';

export const nav = [
  { label: 'Teams', href: '/team' },
  { label: 'Matches', href: '/matches' },
  { label: 'Timeline', href: '/timeline' },
  { label: 'Content', href: '/content' },
  { label: 'Studio', href: '/studio' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Join', href: '/join' },
];

export const shopUrl = 'https://impreriallaw.shop/';

export const social = [
  { label: 'X', href: 'https://x.com/ImprerialLaw' },
  { label: 'Instagram', href: 'https://www.instagram.com/impreriallaw/' },
];

export type Team = {
  slug: string;
  name: string;
  game: string;
  region: string;
  image: string;
  text: string;
  players: string[];
};

export const teams: Team[] = [
  {
    slug: 'latam',
    name: 'LATAM Team',
    game: 'Counter-Strike 2',
    region: 'EU',
    image: '/img/latam.webp',
    text: 'Our LATAM / EU roster brings together players from Argentina, Spain and Peru to compete in Europe. Led by PANK as in-game leader, the team shares a clear focus: building strong coordination, improving together and turning individual effort into team results.',
    players: ['PANK', 'PAINj', 'kr0wa', 'ElKanna', 'FelipeL'],
  },
  {
    slug: 'vanguard',
    name: 'Team Vanguard',
    game: 'Counter-Strike 2',
    region: 'EU',
    image: '/img/vanguard.webp',
    text: 'Our Vanguard team brings together an international Counter-Strike 2 roster with an extensive FACEIT background. Competing in the European ESEA League, the team represents Imprerial Law with a focus on coordinated team play, consistent preparation and competitive progress.',
    players: ['v1rage-', 'Mitzera', 'Fatallity', 'Cheapace', 'Denuki', 'JB', 'Fangyuan'],
  },
  {
    slug: 'challenger',
    name: 'Challenger Team',
    game: 'Counter-Strike 2',
    region: 'EU',
    image: '/img/challenger.webp',
    text: 'Our Challenger team brings together players from across Europe to compete in Counter-Strike 2. Taking on the European ESEA League, the roster focuses on developing its team play, gaining league experience and working towards the next level of competition.',
    players: ['xeny__', 'ORRRYX', 'sAns-', 'V3LS', 'Zekii', 'Boty25'],
  },
  {
    slug: 'fortnite',
    name: "Fortnite Pro's",
    game: 'Fortnite',
    region: 'EU / NA',
    image: '/img/fortnite.webp',
    text: 'Imperial Law’s competitive Fortnite division, representing our organization across EU and NA. Focused on player development, consistent performance, and competing at the highest level.',
    players: ['byDuck'],
  },
];

export const ticker = [
  'PANK', 'kr0wa', 'PAINj', 'Kanna', 'FelipeL', 'xeny_', 'V3LS', 'sAns', 'ZEKII',
  'v1rage-', 'Coolts', 'denuki', 'mitzera666', 'CheapAse', 'byDuck', 'ORRRYX',
];

export const creators = [
  {
    name: 'v1rage_cs2',
    game: 'Counter-Strike 2',
    image: '/img/v1rage.webp',
    text: 'Counter-Strike 2 player and creator for Imperial Law. Catch v1rage_cs2 live on Twitch for CS2 gameplay and a closer look at his journey as a player.',
    links: [{ label: 'Twitch', href: 'https://www.twitch.tv/v1rage_cs2' }],
  },
  {
    name: 'azpectCS',
    game: 'Counter-Strike 2',
    image: '/img/azpect.webp',
    text: 'Counter-Strike 2 streamer and content creator for Imperial Law. Join azpectCS live on Twitch and explore his CS2 content on YouTube.',
    links: [
      { label: 'Twitch', href: 'https://www.twitch.tv/azpectcs2' },
      { label: 'YouTube', href: '#' },
    ],
  },
];

export type Match = {
  date: string; // ISO, Europe/Berlin
  display: string;
  team: string;
  opponent: string;
  event: string;
  result?: 'WIN' | 'LOSS';
};

export const upcoming: Match[] = [
  { date: '2026-10-05T20:00', display: '05. Okt. 2026, 20:00', team: 'Team Vanguard', opponent: 'ALPHA', event: 'ESEA Season 59' },
  { date: '2026-10-05T20:00', display: '05. Okt. 2026, 20:00', team: 'Challenger Team', opponent: 'TeneT', event: 'ESEA Season 59' },
  { date: '2026-10-06T20:00', display: '06. Okt. 2026, 20:00', team: 'LATAM Team', opponent: 'PewnoscSiebie', event: 'ESEA Season 59' },
  { date: '2026-10-07T20:00', display: '07. Okt. 2026, 20:00', team: 'Team Vanguard', opponent: 'Scawwy KBT', event: 'ESEA Season 59' },
  { date: '2026-10-07T20:00', display: '07. Okt. 2026, 20:00', team: 'LATAM Team', opponent: 'HUSARIA ESPORTS', event: 'ESEA Season 59' },
  { date: '2026-10-07T20:00', display: '07. Okt. 2026, 20:00', team: 'Challenger Team', opponent: 'DangGang-', event: 'ESEA Season 59' },
];

export const results: Match[] = [
  { date: '2026-08-26', display: '26. Aug. 2026', team: 'Challenger Team', opponent: 'Petonen Inc', event: 'ESEA Open 10', result: 'WIN' },
  { date: '2026-08-24', display: '24. Aug. 2026', team: 'Challenger Team', opponent: 'InnerVoices', event: 'ESEA Open 10', result: 'WIN' },
  { date: '2026-08-19', display: '19. Aug. 2026', team: 'Challenger Team', opponent: 'ggshniki', event: 'ESEA Open 10' },
  { date: '2026-08-17', display: '17. Aug. 2026', team: 'Challenger Team', opponent: 'BORDO BERELILER', event: 'ESEA Open 10' },
  { date: '2026-08-10', display: '10. Aug. 2026', team: 'Challenger Team', opponent: 'EMPIRE', event: 'ESEA Open 10', result: 'WIN' },
  { date: '2026-08-05', display: '05. Aug. 2026', team: 'CS2 Main', opponent: 'mental problem', event: 'ESEA Entry' },
  { date: '2026-08-05', display: '05. Aug. 2026', team: 'Challenger Team', opponent: 'Gorilla', event: 'ESEA Open 10' },
  { date: '2026-08-01', display: '01. Aug. 2026', team: 'CS2 Main', opponent: 'HA_YCJIOBKE', event: 'ESEA Entry', result: 'WIN' },
  { date: '2026-07-30', display: '30. Juli 2026', team: 'Challenger Team', opponent: 'HALA HALA', event: 'ESEA Open 10', result: 'WIN' },
  { date: '2026-07-29', display: '29. Juli 2026', team: 'Challenger Team', opponent: 'N1gma City', event: 'ESEA Open 10', result: 'WIN' },
  { date: '2026-07-29', display: '29. Juli 2026', team: 'CS2 Main', opponent: 'LoaThE', event: 'ESEA Entry', result: 'WIN' },
  { date: '2026-07-27', display: '27. Juli 2026', team: 'CS2 Main', opponent: 'FazeUpNext', event: 'ESEA Entry' },
  { date: '2026-07-22', display: '22. Juli 2026', team: 'CS2 Main', opponent: 'PRZ GAMING', event: 'ESEA Entry', result: 'LOSS' },
  { date: '2026-07-22', display: '22. Juli 2026', team: 'Challenger Team', opponent: 'Ascent', event: 'ESEA Open 10', result: 'LOSS' },
  { date: '2026-07-15', display: '15. Juli 2026', team: 'Challenger Team', opponent: 'Humorists Union', event: 'ESEA Open 10', result: 'LOSS' },
  { date: '2026-07-15', display: '15. Juli 2026', team: 'CS2 Main', opponent: 'herobrins', event: 'ESEA Entry', result: 'WIN' },
  { date: '2026-07-13', display: '13. Juli 2026', team: 'CS2 Main', opponent: 'Bonk', event: 'ESEA Entry', result: 'WIN' },
  { date: '2026-07-13', display: '13. Juli 2026', team: 'Challenger Team', opponent: 'KaibaCorp', event: 'ESEA Open 10', result: 'WIN' },
];

export type Story = { tag: string; year: string; month?: string; title: string; text: string };

export const timeline: Story[] = [
  { tag: 'Signing', year: '2026', month: 'OCT', title: 'Introducing Team Vanguard', text: 'Meet Team Vanguard, the newest addition to Imprerial Law’s Counter-Strike 2 division. We’re excited to welcome the team under our banner and support them as they compete, develop, and build their future together. Welcome to Imprerial Law.' },
  { tag: 'Signing', year: '2026', month: 'OCT', title: 'Introducing Our LATAM Counter-Strike 2 Team', text: 'Imprerial Law expands into Latin America. We’re proud to welcome our LATAM Counter-Strike 2 team as they begin a new chapter under our banner. Together, we’re building toward strong competition, continued growth, and a lasting presence in the region. Welcome to Imprerial Law.' },
  { tag: 'Leaving', year: '2026', month: 'SEP', title: 'End of an Era? Shockwaves in the CS2 Roster!', text: 'In mid-September 2026, we officially parted ways with our CS2 Main Lineup. After countless battles on the server, a defining chapter comes to an unexpected close. A heavy cut — but who takes over the server next? Keep your eyes peeled for what’s coming.' },
  { tag: 'Milestone', year: '2026', title: 'Strategic Partnership with Polygon', text: 'Imprerial Law secures its first major strategic partnership with Polygon, supporting the organization’s long-term growth and competitive ambitions.' },
  { tag: 'Training', year: '2026', month: 'JULY', title: 'First Team Bootcamp', text: 'Imprerial Law hosts its first official team bootcamp in Germany, bringing players and staff together to prepare for the upcoming competitive season.' },
  { tag: 'Milestone', year: '2026', title: 'Building Our Brand', text: 'Imprerial Law establishes a growing digital presence, expanding across social media while attracting partners, talent, and a rapidly growing community.' },
  { tag: 'Milestone', year: '2026', title: 'League Division Established', text: 'The League of Legends division is completed with competitive rosters, experienced coaching staff, and dedicated management.' },
  { tag: 'Milestone', year: '2026', title: 'CS2 Playoff Success', text: 'Our CS2 rosters reach the ESEA Playoffs three consecutive times, marking the organization’s first major competitive milestone.' },
  { tag: 'Milestone', year: '2025', title: 'First Competitive Rosters', text: 'Our first competitive teams are assembled, laying the foundation for future expansion across multiple esports titles.' },
  { tag: 'Start', year: '2025', title: 'Imprerial Law Founded', text: 'Imprerial Law is founded with the vision of building a modern, multi-title esports organization focused on long-term success.' },
];

export const staff = [
  { role: 'Owner', name: 'Michel "backw1n" Kallweit', title: 'Founder & CEO', where: 'EU · Germany', text: 'Focused on leadership, communication, and building meaningful relationships. Passionate about creating a strong team culture where people can perform at their best.' },
  { role: 'Owner', name: 'Nathan "ORRRYX" Reimann', title: 'Founder & CEO', where: 'EU · Germany', text: 'Driving the financial and strategic direction of Imprerial Law while shaping the organization’s brand. Balancing business leadership with active competition in our Academy roster.' },
  { role: 'COO / Management', name: 'Lukas "zukoo" Haseloff', title: 'COO', where: 'EU · Germany', text: 'Overseeing day-to-day operations, leading our competitive teams, identifying emerging talent, and building strategic partnerships that drive the continued growth of Imprerial Law.' },
  { role: 'Head of eSport', name: 'Darius "tau" Pârvu', title: 'Head of eSport', where: 'EU · Romania', text: 'One of the central figures behind Imprerial Law’s competitive development. He oversees our Rocket League division, supports the Challenger Team, and helps coordinate our wider esports operations.' },
  { role: 'Community & Content', name: 'Oleksandr "Xeny" Sumchenko', title: 'Management', where: 'GB · United Kingdom', text: 'Managing Imprerial Law’s TikTok presence, supporting our Discord community, and creating engaging content that strengthens our connection with players and fans.' },
  { role: 'Operations / Team Lead', name: 'Romy "Romyyy" U.', title: 'Head of Fortnite', where: 'EU · NL', text: 'Leading our Fortnite division while also supporting a wide range of important operations behind the scenes, with a strong focus on player development and team coordination.' },
  { role: 'Design Team', name: 'Dolata "Minzu" Milo', title: 'Graphic / Brand Designer', where: 'EU · France', text: 'A driving creative force behind Imprerial Law’s visual identity, shaping how our organization is seen and remembered across every platform.' },
  { role: 'Esports Operations', name: 'Luca "SOCIALL" Ferrante', title: 'Head of Fortnite', where: 'EU · Germany', text: 'Leads the development and daily operations of the Fortnite division — from identifying promising talent to coordinating the team’s competitive direction.' },
];

export const values = [
  { title: 'Excellence', text: 'We pursue excellence in everything we do — from competition and coaching to operations, branding, and content.' },
  { title: 'Ambition', text: 'We embrace challenges, set high standards, and continuously push ourselves to reach the next level.' },
  { title: 'Integrity', text: 'We value trust, professionalism, and accountability in every relationship we build.' },
  { title: 'Legacy', text: 'We strive to create more than victories — we’re building an organization that will shape the future of esports.' },
];
