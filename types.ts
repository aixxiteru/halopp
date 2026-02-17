
export interface LinkItem {
  id: string;
  title: string;
  url: string;
  type: 'primary' | 'secondary' | 'featured' | 'header';
  thumbnail?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
