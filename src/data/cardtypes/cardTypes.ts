export interface CardTypes {
  id: string;
  siteId: string;
  methodology: string;
  name: string;
  description: string;
  color: string;
  responsableName: string;
  status: string;
}

export interface CardTypeUpdateForm {
  id: string;
  siteCode: string;
  methodology: string;
  name: string;
  description: string;
  color: string;
  responsableId: string;
  responsableName: string;
  email: string;
  quantityPicturesCreate: number;
  quantityAudiosCreate: number;
  quantityVideosCreate: number;
  audiosDurationCreate: number;
  videosDurationCreate: number;
  quantityPicturesClose: number;
  quantityAudiosClose: number;
  quantityVideosClose: number;
  audiosDurationClose: number;
  videosDurationClose: number;
  quantityPicturesPs: number;
  quantityAudiosPs: number;
  quantityVideosPs: number;
  audiosDurationPs: number;
  videosDurationPs: number;
  status: string;
}

export interface CardTypesCatalog {
  id: string;
  cardTypeMethodology: string;
  cardTypeMethodologyName: string;
}
