
export interface StyleConfig {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface GeneratedImage {
  styleId: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  imageUrl?: string;
  error?: string;
  currentPrompt?: string;
}

export type GenerationStatus = 'idle' | 'processing' | 'finished';
