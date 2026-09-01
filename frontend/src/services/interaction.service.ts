import api from "./api";

/*
================================================
INTERACTION TYPES
================================================
*/

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


/*
================================================
INTERACTION INTERFACE
================================================
*/

export interface Interaction {
  id: number;

  prospect_id?: number | null;

  client_id?: number | null;

  user_id: number;

  type: InteractionType;

  notes: string;

  outcome?: InteractionOutcome | null;

  next_action?: string | null;

  next_action_date?: string | null;

  created_at: string;
}


/*
================================================
CREATE PROSPECT INTERACTION
================================================
*/

export const createProspectInteraction = async (
  prospectId: number,
  data: {
    type: InteractionType;
    notes: string;
    outcome?: InteractionOutcome;
    nextAction?: string;
    nextActionDate?: string;
  }
): Promise<Interaction> => {

  const response = await api.post(
    `/prospects/${prospectId}/interactions`,
    data
  );

  return response.data;
};


/*
================================================
GET PROSPECT INTERACTIONS
================================================
*/

export const getProspectInteractions = async (
  prospectId: number
): Promise<Interaction[]> => {

  const response = await api.get(
    `/prospects/${prospectId}/interactions`
  );

  return response.data;
};


/*
================================================
CREATE CLIENT INTERACTION
================================================
*/

export const createClientInteraction = async (
  clientId: number,
  data: {
    type: InteractionType;
    notes: string;
    outcome?: InteractionOutcome;
    nextAction?: string;
    nextActionDate?: string;
  }
): Promise<Interaction> => {

  const response = await api.post(
    `/clients/${clientId}/interactions`,
    data
  );

  return response.data;
};