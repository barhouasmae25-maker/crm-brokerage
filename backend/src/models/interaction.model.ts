export type InteractionType =
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "SMS"
  | "NOTE";

export type InteractionOutcome =
  | "POSITIVE"
  | "NEUTRAL"
  | "NEGATIVE"
  | "NO ANSWER";


export interface Interaction {

  id?: number;

  prospect_id?: number;

  client_id?: number;

  user_id: number;

  type: InteractionType;

  notes?: string;

  outcome?: InteractionOutcome;

  next_action?: string;

  next_action_date?: string;

  created_at?: Date;

}