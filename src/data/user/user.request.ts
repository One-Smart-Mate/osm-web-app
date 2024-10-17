export class LoginRequest {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email.trim();
    this.password = password;
  }
}

export class CreateUser {
  name: string;
  email: string;
  siteId: number;
  password: string;
  uploadCardDataWithDataNet: number;
  uploadCardEvidenceWithDataNet: number;
  roles: number[];

  constructor(
    name: string,
    email: string,
    siteId: number,
    password: string,
    uploadCardDataWithDataNet: number,
    uploadCardEvidenceWithDataNet: number,
    roles: number[]
  ) {
    this.name = name;
    this.email = email;
    this.siteId = siteId;
    this.password = password;
    this.uploadCardDataWithDataNet = uploadCardDataWithDataNet;
    this.uploadCardEvidenceWithDataNet = uploadCardEvidenceWithDataNet;
    this.roles = roles;
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

  constructor(
    id: number,
    name: string,
    email: string,
    siteId: number,
    password: string,
    uploadCardDataWithDataNet: number,
    uploadCardEvidenceWithDataNet: number,
    roles: number[],
    status: string
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
