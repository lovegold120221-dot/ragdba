export type Language = 'EN' | 'NL' | 'FR' | 'DE';
export type ThinkingLevel = 'LOW' | 'HIGH';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responsibleBranch?: string;
  loginRequired?: boolean;
  loginMethod?: string;
  officialSource?: string;
  sourceUrl?: string;
  requirements?: string[];
  steps?: string[];
  regionalWarning?: string;
  confidence?: string;
  imageUrl?: string;
  imageAnalysis?: any;
  isThinking?: boolean;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  language: Language;
  createdAt: number;
  updatedAt: number;
}

export interface OfficialSource {
  id: string;
  source_name: string;
  source_type: string;
  government_level: 'Federal' | 'Regional' | 'Community' | 'Municipal' | 'Interoperability';
  owner_agency: string;
  official_domain: string;
  base_url: string;
  languages_available: string[];
  access_type: 'Open' | 'Authenticated' | 'Hybrid';
  trust_score: number;
  last_verified_at: string;
  active: boolean;
}

export interface GovernmentEntity {
  id: string;
  official_name: string;
  name_nl: string;
  name_fr: string;
  name_de: string;
  name_en: string;
  entity_type: string;
  government_level: string;
  official_website: string;
  service_categories: string[];
}

export interface GovernmentService {
  id: string;
  service_name: string;
  entity_name: string;
  category: string;
  auth_method: string;
  processing_time: string;
  official_url: string;
}

export interface Dataset {
  id: string;
  dcat_identifier: string;
  title: string;
  publisher: string;
  theme: string;
  format: string[];
  update_frequency: string;
  access_url: string;
}
