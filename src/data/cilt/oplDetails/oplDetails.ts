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
    oplId: number;
    order: number;
    type: 'texto' | 'imagen' | 'video' | 'pdf';
    text?: string;
    mediaUrl?: string;
  
    constructor(
      oplId: number,
      order: number,
      type: 'texto' | 'imagen' | 'video' | 'pdf',
      text?: string,
      mediaUrl?: string
    ) {
      this.oplId = oplId;
      this.order = order;
      this.type = type;
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