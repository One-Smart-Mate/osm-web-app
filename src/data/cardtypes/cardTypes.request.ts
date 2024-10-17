export class CreateCardType {
  cardTypeMethodology: string;
  siteId: number;
  methodology: string;
  name: string;
  description: string;
  color: string;
  responsableId: number;
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

  constructor(
    cardTypeMethodology: string,
    siteId: number,
    methodology: string,
    name: string,
    description: string,
    color: string,
    responsableId: number,
    quantityPicturesCreate: number,
    quantityAudiosCreate: number,
    quantityVideosCreate: number,
    audiosDurationCreate: number,
    videosDurationCreate: number,
    quantityPicturesClose: number,
    quantityAudiosClose: number,
    quantityVideosClose: number,
    audiosDurationClose: number,
    videosDurationClose: number,
    quantityPicturesPs: number,
    quantityAudiosPs: number,
    quantityVideosPs: number,
    audiosDurationPs: number,
    videosDurationPs: number
  ) {
    this.cardTypeMethodology = cardTypeMethodology
    this.siteId = siteId;
    this.methodology = methodology;
    this.name = name;
    this.description = description;
    this.color = color;
    this.responsableId = responsableId;
    this.quantityPicturesCreate = quantityPicturesCreate;
    this.quantityAudiosCreate = quantityAudiosCreate;
    this.quantityVideosCreate = quantityVideosCreate;
    this.audiosDurationCreate = audiosDurationCreate;
    this.videosDurationCreate = videosDurationCreate;
    this.quantityPicturesClose = quantityPicturesClose;
    this.quantityAudiosClose = quantityAudiosClose;
    this.quantityVideosClose = quantityVideosClose;
    this.audiosDurationClose = audiosDurationClose;
    this.videosDurationClose = videosDurationClose;
    this.quantityAudiosPs = quantityAudiosPs;
    this.quantityVideosPs = quantityVideosPs;
    this.audiosDurationPs = audiosDurationPs;
    this.quantityPicturesPs = quantityPicturesPs;
    this.videosDurationPs = videosDurationPs;
  }
}
export class UpdateCardTypeReq {
  id: number;
  methodology: string;
  name: string;
  description: string;
  color: string;
  responsableId: number;
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

  constructor(
    id: number,
    methodology: string,
    name: string,
    description: string,
    color: string,
    responsableId: number,
    quantityPicturesCreate: number,
    quantityAudiosCreate: number,
    quantityVideosCreate: number,
    audiosDurationCreate: number,
    videosDurationCreate: number,
    quantityPicturesClose: number,
    quantityAudiosClose: number,
    quantityVideosClose: number,
    audiosDurationClose: number,
    videosDurationClose: number,
    quantityPicturesPs: number,
    quantityAudiosPs: number,
    quantityVideosPs: number,
    audiosDurationPs: number,
    videosDurationPs: number,
    status: string
  ) {
    this.id = id;
    this.methodology = methodology;
    this.name = name;
    this.description = description;
    this.color = color;
    this.responsableId = responsableId;
    this.quantityPicturesCreate = quantityPicturesCreate;
    this.quantityAudiosCreate = quantityAudiosCreate;
    this.quantityVideosCreate = quantityVideosCreate;
    this.audiosDurationCreate = audiosDurationCreate;
    this.videosDurationCreate = videosDurationCreate;
    this.quantityPicturesClose = quantityPicturesClose;
    this.quantityAudiosClose = quantityAudiosClose;
    this.quantityVideosClose = quantityVideosClose;
    this.audiosDurationClose = audiosDurationClose;
    this.videosDurationClose = videosDurationClose;
    this.quantityAudiosPs = quantityAudiosPs;
    this.quantityVideosPs = quantityVideosPs;
    this.audiosDurationPs = audiosDurationPs;
    this.quantityPicturesPs = quantityPicturesPs;
    this.videosDurationPs = videosDurationPs;
    this.status = status;
  }
}
