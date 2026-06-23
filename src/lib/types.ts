export interface JournalWP {
  id: string;
  databaseId: number;
  title: string;
  numero: string;
  datePublication: string;
  pdfUrl: string;
  extrait?: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
}

export interface MagazineWP {
  id: string;
  databaseId: number;
  title: string;
  numero: string;
  datePublication: string;
  pdfUrl: string;
  extrait?: string;
  sommaire?: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
}
