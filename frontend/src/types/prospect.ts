
export type ProspectStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type ProspectSource =
  | "WEBSITE"
  | "REFERRAL"
  | "COLD_CALL"
  | "SOCIAL_MEDIA"
  | "EVENT"
  | "OTHER";

export type ProspectInterest =
  | "STOCKS_TRADING"
  | "FOREX"
  | "CRYPTO"
  | "COMMODITIES"
  | "OPTIONS"
  | "MIXED";

export interface Prospect {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: ProspectSource;
  interest: ProspectInterest;
  estimatedCapital?: number | null;
  notes?: string | null;
  status: ProspectStatus;
}

export interface ProspectRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: ProspectSource;
  interest: ProspectInterest;
  estimatedCapital?: number;
  notes?: string;
  status?: ProspectStatus;
}

