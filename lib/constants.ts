export const PRIORITY_COUNTRIES = [
  "France", "Suisse", "Angleterre", "Irlande", "États-Unis",
  "Italie", "Monaco", "Espagne", "Canada",
];

export const SPORTS = [
  "Football", "Basketball", "Rugby", "Football américain", "Golf",
  "Sport mécanique", "Cyclisme", "Natation", "Hockey", "Handball", "Baseball", "Tennis",
];

export const LEVELS = ["Pro", "Semi-pro", "Universitaire", "Fédéral"];

export const STATUSES = [
  "Nouveau", "À regarder", "Candidature envoyée", "Entretien", "Refusé", "Pas intéressé",
];

export const GENDERS = ["Masculin", "Féminin", "Mixte / non précisé"];

export const SPORT_ACCENT: Record<string, string> = {
  "Football": "#3F6B4F",
  "Basketball": "#B5541E",
  "Rugby": "#6E2C2C",
  "Football américain": "#1F3A5F",
  "Golf": "#2F5233",
  "Sport mécanique": "#3A3A3E",
  "Cyclisme": "#8E5A2D",
  "Natation": "#1C7293",
  "Hockey": "#355070",
  "Handball": "#7A3B69",
  "Baseball": "#C1440E",
  "Tennis": "#4B7F52",
};

export const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  "Nouveau": { bg: "#DCE7ED", fg: "#22506B" },
  "À regarder": { bg: "#F3E9D2", fg: "#8A6A1E" },
  "Candidature envoyée": { bg: "#DCE3F0", fg: "#2E4B8F" },
  "Entretien": { bg: "#E1EBE3", fg: "#3F6B4F" },
  "Refusé": { bg: "#F3E0DF", fg: "#9B3A3A" },
  "Pas intéressé": { bg: "#E7E8EA", fg: "#5B6570" },
};

export const GENDER_STYLE: Record<string, { bg: string; fg: string; symbol: string; label: string }> = {
  "Masculin": { bg: "#DCE7ED", fg: "#22506B", symbol: "♂", label: "Masculin" },
  "Féminin": { bg: "#F0DDE5", fg: "#8A3F5D", symbol: "♀", label: "Féminin" },
  "Mixte / non précisé": { bg: "#E7E8EA", fg: "#5B6570", symbol: "⚥", label: "Mixte / non précisé" },
};

export const FLAGS: Record<string, string> = {
  "France": "🇫🇷", "Suisse": "🇨🇭", "Angleterre": "🏴", "Irlande": "🇮🇪",
  "États-Unis": "🇺🇸", "Italie": "🇮🇹", "Monaco": "🇲🇨", "Espagne": "🇪🇸",
  "Canada": "🇨🇦",
};
