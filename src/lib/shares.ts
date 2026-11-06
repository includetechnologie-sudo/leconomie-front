export const SHARE_NETWORKS = ["whatsapp", "facebook", "x", "linkedin", "copier"] as const;
export type ShareNetwork = typeof SHARE_NETWORKS[number];

export const SHARE_LABEL: Record<ShareNetwork, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  x: "X",
  linkedin: "LinkedIn",
  copier: "Copier le lien",
};

export function isShareNetwork(value: unknown): value is ShareNetwork {
  return typeof value === "string" && (SHARE_NETWORKS as readonly string[]).includes(value);
}
