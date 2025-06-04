export interface OplDetail {
    id: number;
    oplId: number;
    order: number;
    type: 'texto' | 'imagen' | 'video' | 'pdf';
    text: string | null;
    mediaUrl: string | null;
    updatedAt: string | null;
  }
  
  export class CreateOplDetailsDTO {
    siteId: number;
    oplId: number;
    order: number;
    type: 'texto' | 'imagen' | 'video' | 'pdf';
    text?: string;
    mediaUrl?: string;
    createdAt: string;

    constructor(
      siteId: number,
      oplId: number,
      order: number,
      type: 'texto' | 'imagen' | 'video' | 'pdf',
      createdAt: string,
      text?: string,
      mediaUrl?: string
    ) {
      this.siteId = siteId;
      this.oplId = oplId;
      this.order = order;
      this.type = type;
      this.createdAt = createdAt;
      this.text = text;
      this.mediaUrl = mediaUrl;
    }
  }
  
  export class UpdateOplDetailsDTO {
    id: number;
    oplId?: number;
    order?: number;
    type?: 'texto' | 'imagen' | 'video' | 'pdf';
    text?: string;
    mediaUrl?: string;
    updatedAt: string;
  
    constructor(
      id: number,
      updatedAt: string,
      oplId?: number,
      order?: number,
      type?: 'texto' | 'imagen' | 'video' | 'pdf',
      text?: string,
      mediaUrl?: string
    ) {
      this.id = id;
      this.oplId = oplId;
      this.order = order;
      this.type = type;
      this.text = text;
      this.mediaUrl = mediaUrl;
      this.updatedAt = updatedAt;
    }
  }