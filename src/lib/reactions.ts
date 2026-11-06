export const REACTION_TYPES = ["jaime", "jaimepas", "feu", "rire", "nerveux", "salutation"] as const;
export type ReactionType = typeof REACTION_TYPES[number];

export const REACTION_EMOJI: Record<ReactionType, string> = {
  jaime: "👍",
  jaimepas: "👎",
  feu: "🔥",
  rire: "😂",
  nerveux: "😬",
  salutation: "🙏",
};

export const REACTION_LABEL: Record<ReactionType, string> = {
  jaime: "J'aime",
  jaimepas: "Je n'aime pas",
  feu: "Ça c'est le feu",
  rire: "Ça fait rire",
  nerveux: "Ça inquiète",
  salutation: "Salutation",
};

export function isReactionType(value: unknown): value is ReactionType {
  return typeof value === "string" && (REACTION_TYPES as readonly string[]).includes(value);
}
