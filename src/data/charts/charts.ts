export interface Preclassifier {
  preclassifier: string;
  totalCards: number;
  methodology: string;
  color: string;
}

export interface Methodology {
  methodology: string;
  color: string;
  totalCards: number;
}

export interface Area {
  area: string;
  totalCards: number;
  cardTypeName: string;
}

export interface Machine {
  nodeName: string;
  location: string;
  totalCards: number;
  cardTypeName: string;
}

export interface Creator {
  creator: string;
  totalCards: number;
  cardTypeName: string;
}

export interface Mechanic {
  mechanic: string;
  totalCards: number;
  cardTypeName: string;
}

export interface DefinitiveUser {
  definitiveUser: string;
  totalCards: number;
  cardTypeName: string;
}

export interface Weeks {
  year: number;
  week: number;
  issued: number;
  eradicated: number;
  cumulativeIssued: number;
  cumulativeEradicated: number;
}
