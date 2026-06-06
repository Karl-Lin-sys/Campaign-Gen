export interface BodyOption {
  tone: string;
  content: string;
}

export interface GeneratedImage {
  prompt: string;
  url: string;
}

export interface CampaignData {
  subjectLines: string[];
  bodyOptions: BodyOption[];
  visualPrompts: string[];
  images: GeneratedImage[];
}
