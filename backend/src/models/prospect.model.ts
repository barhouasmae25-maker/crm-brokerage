export interface Prospect {

  id:number;

  first_name:string;

  last_name:string;

  email:string;

  phone:string;

  source:
    |"WEBSITE"
    |"REFERRAL"
    |"COLD CALL"
    |"SOCIAL MEDIA"
    |"EVENT"
    |"OTHER";

  interest:
    |"STOCKS TRADING"
    |"FOREX"
    |"CRYPTO"
    |"COMMODITIES"
    |"OPTIONS"
    |"MIXED";

  estimated_capital:number|null;

  notes:string|null;

  status:
    |"NEW"
    |"CONTACTED"
    |"QUALIFIED"
    |"PROPOSAL SENT"
    |"NEGOTIATION"
    |"WON"
    |"LOST";

  assigned_to:number;

  created_by:number;

  created_at:Date;

  updated_at:Date;

}