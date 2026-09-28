// Rubriques exposées par le frontend : slug d'URL → libellé affiché + slug de la catégorie WordPress
export type Rubrique = { label: string; wp: string };

export const CATEGORY_MAP: Record<string, Rubrique> = {
  economie: { label: "Economie", wp: "economie" },
  finance: { label: "Finance", wp: "finance" },
  cemac: { label: "CEMAC", wp: "cameroun" },
  infrastructure: { label: "Infrastructure", wp: "infrastructure" },
  infrastructures: { label: "Infrastructure", wp: "infrastructure" },
  decideur: { label: "Décideur", wp: "decideur" },
  opinion: { label: "Opinion", wp: "opinion" },
  interview: { label: "Interview", wp: "interview" },
  evenement: { label: "Événement", wp: "evenement" },
  "politiques-publiques": { label: "Politiques publiques", wp: "politiques-publiques" },
  entreprises: { label: "Entreprises", wp: "entreprises" },
  assurances: { label: "Assurances", wp: "assurances" },
  banques: { label: "Banques", wp: "banques" },
  "bourse-marches": { label: "Bourse & Marchés", wp: "bourse-marches" },
  telecoms: { label: "Telecoms", wp: "telecoms" },
  "start-ups": { label: "Start-ups", wp: "start-ups" },
  mines: { label: "Mines", wp: "mines" },
  "publi-info": { label: "Publi-Info", wp: "publi-info" },
  // Pays CEMAC
  cameroun: { label: "Cameroun", wp: "cameroun" },
  tchad: { label: "Tchad", wp: "tchad" },
  gabon: { label: "Gabon", wp: "gabon" },
  congo: { label: "Congo", wp: "congo" },
  "guinee-equatoriale": { label: "Guinée Équatoriale", wp: "guinee-equatoriale" },
  rca: { label: "République Centrafricaine", wp: "republique-centrafricaine" },
  // Rubriques secondaires : accessibles par le menu « Plus », sans section sur l'accueil
  "a-la-une": { label: "À la une", wp: "a-la-une" },
  buisness: { label: "Business", wp: "buisness" },
  tech: { label: "Tech & Innovation", wp: "tech" },
  "eco-afrique": { label: "Eco Afrique", wp: "eco-afrique" },
  "economie-verte": { label: "Economie verte", wp: "economie-verte" },
  "banque-et-assurances": { label: "Banque & Assurances", wp: "banque-et-assurances" },
  agriculture: { label: "Agriculture", wp: "agriculture" },
  transport: { label: "Transport", wp: "transport" },
  management: { label: "Management", wp: "management" },
  sante: { label: "Santé", wp: "sante" },
  sport: { label: "Sport", wp: "sport" },
  mbolo: { label: "Mbolo", wp: "mbolo" },
  offres: { label: "Offres", wp: "offres" },
  agenda: { label: "Agenda", wp: "agenda" },
};

// Ordre d'affichage dans le menu « Plus »
export const SECONDARY_RUBRIQUES = [
  "a-la-une", "buisness", "tech", "eco-afrique", "economie-verte", "banque-et-assurances",
  "agriculture", "transport", "management", "sante", "sport", "mbolo", "offres", "agenda",
];
