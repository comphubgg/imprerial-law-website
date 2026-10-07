// Farbwelten (Saison-Themes). Neues Theme = einfach hier einen Eintrag ergänzen.
// accent = Hauptleuchtfarbe, accent2 = Zweitfarbe, grad = Verlauf für Buttons/Headlines, on = Textfarbe auf Buttons
window.THEMES = {
  platin:      { name: 'Platin (Main)',        accent: '#E4EAF2', accent2: '#8FB8FF', grad: 'linear-gradient(180deg,#FFFFFF,#AEB6C2)', on: '#0A0B0E' },
  winter:      { name: 'Winter / Eisblau',     accent: '#9ED8FF', accent2: '#FFFFFF', grad: 'linear-gradient(180deg,#F2FBFF,#5FB4F5)', on: '#04101A' },
  weihnachten: { name: 'Weihnachten (Rot)',    accent: '#FF3B4E', accent2: '#FFE9C7', grad: 'linear-gradient(180deg,#FF8A8F,#D6112A)', on: '#1A0306' },
  gold:        { name: 'Gold (Premium)',       accent: '#F2C14E', accent2: '#FFF1C2', grad: 'linear-gradient(180deg,#FFF3C4,#D9A030)', on: '#1A1103' },
  fruehling:   { name: 'Frühling (Hellblau)',  accent: '#7FD0FF', accent2: '#C9F0FF', grad: 'linear-gradient(180deg,#E6F7FF,#58B9F2)', on: '#041218' },
  pride:       { name: 'Pride (Regenbogen)',   accent: '#FF6FD8', accent2: '#6FD6FF', grad: 'linear-gradient(90deg,#FF4D4D,#FF9F43,#FFE14D,#4DDB7A,#4DA6FF,#B06BFF)', on: '#0A0A0F' },
};
window.applyTheme = function (id) {
  const t = window.THEMES[id] || window.THEMES.platin, r = document.documentElement.style;
  r.setProperty('--accent', t.accent); r.setProperty('--accent2', t.accent2); r.setProperty('--grad', t.grad); r.setProperty('--on', t.on);
  return t;
};
