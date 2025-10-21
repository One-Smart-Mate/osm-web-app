import Constants from "../../utils/Constants";

export class LoginRequest {
  email: string;
  password: string;
  timezone?: string;
  platform?: string;

  constructor(email: string, password: string, timezone?: string, platform?: string) {
    this.email = email.trim();
    this.password = password;
    this.timezone = timezone;
    this.platform = platform;
  }
}


export interface SetAppTokenDTO {
  userId: number;   
  appToken: string;
  osName: 'WEB';
  osVersion: string;
}


export class CreateUser {
  name: string;
  email: string;
  siteId: number;
  password: string;
  uploadCardDataWithDataNet: number;
  uploadCardEvidenceWithDataNet: number;
  roles: number[];
  phoneNumber?: string;
  translation?: string;

  constructor(
    name: string,
    email: string,
    siteId: number,
    password: string,
    uploadCardDataWithDataNet: number,
    uploadCardEvidenceWithDataNet: number,
    roles: number[],
    phoneNumber?: string,
    translation?: string
  ) {
    this.name = name;
    this.email = email;
    this.siteId = siteId;
    this.password = password;
    this.uploadCardDataWithDataNet = uploadCardDataWithDataNet;
    this.uploadCardEvidenceWithDataNet = uploadCardEvidenceWithDataNet;
    this.roles = roles;
    
    // Include phoneNumber if provided (can be empty string)
    if (phoneNumber !== undefined && phoneNumber !== null) {
      this.phoneNumber = phoneNumber.trim() || "";
    }
    
    // Ensure translation is valid ES or EN, default to ES
    this.translation = (translation === Constants.en) ? Constants.en : Constants.es;
  }
}

export class UpdateUser {
  id: number;
  name: string;
  email: string;
  siteId: number;
  password: string;
  uploadCardDataWithDataNet: number;
  uploadCardEvidenceWithDataNet: number;
  roles: number[];
  status: string;
  fastPassword?: string;
  phoneNumber?: string;
  translation?: string;
  // NOTE: Backend now DOES support translation in UpdateUserDTO!

  constructor(
    id: number,
    name: string,
    email: string,
    siteId: number,
    password: string,
    uploadCardDataWithDataNet: number,
    uploadCardEvidenceWithDataNet: number,
    roles: number[],
    status: string,
    fastPassword?: string,
    phoneNumber?: string,
    translation?: string
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.siteId = siteId;
    this.password = password;
    this.uploadCardDataWithDataNet = uploadCardDataWithDataNet;
    this.uploadCardEvidenceWithDataNet = uploadCardEvidenceWithDataNet;
    this.roles = roles;
    this.status = status;
    
    // Only include fastPassword if it's provided, not empty, and exactly 4 alphanumeric characters
    if (fastPassword && fastPassword.trim()) {
      const trimmedPassword = fastPassword.trim();
      // Validate it's exactly 4 alphanumeric characters (a-z, A-Z, 0-9)
      if (/^[a-zA-Z0-9]{4}$/.test(trimmedPassword)) {
        this.fastPassword = trimmedPassword;
      }
    }
    
    // Include phoneNumber if provided (can be empty string for updates)
    if (phoneNumber !== undefined && phoneNumber !== null) {
      this.phoneNumber = phoneNumber.trim() || "";
    }
    
    // Ensure translation is valid ES or EN, default to ES
    this.translation = (translation === Constants.en) ? Constants.en : Constants.es;
  }
}

export class SendResetCode {
  email: string;
  resetCode: string;

  constructor(email: string, resetCode: string) {
    this.email = email;
    this.resetCode = resetCode;
  }
}

export class ResetPasswordClass {
  email: string;
  resetCode: string;
  newPassword: string;

  constructor(email: string, resetCode: string, newPassword: string) {
    this.email = email;
    this.resetCode = resetCode;
    this.newPassword = newPassword;
  }
}
