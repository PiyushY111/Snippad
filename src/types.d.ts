export interface File {
  id: number;
  name: string;
  language: string;
  code: string;
}

export interface Snippet {
  name: string;
  language: string;
  code: string;
}

export interface Runtime {
  language: string;
  version: string;
  aliases?: string[];
}

export interface LanguageOption {
  label: string;
  value: string;
  ext: string;
  icon: React.ReactNode;
}

interface Window {
  Prism: any;
}