export interface AccountRequest {
  id: number;

  prospect_id: number;

  account_type:
    | "INDIVIDUAL"
    | "JOINT"
    | "CORPORATE"
    | "IRA";

  trading_experience:
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED"
    | "PROFESSIONAL";

  initial_deposit: number;

  status:
    | "PENDING REVIEW"
    | "UNDER REVIEW"
    | "APPROVED"
    | "REJECTED";

  created_at: Date;

  updated_at: Date;
}


export interface AccountRequestDocument {
  id: number;

  request_id: number;

  document_type:
    | "ID CARD"
    | "PASSPORT"
    | "PROOF OF ADDRESS";

  document_url: string;

  verified: boolean;

  verified_at: Date | null;

  verified_by: number | null;

  created_at: Date;
}