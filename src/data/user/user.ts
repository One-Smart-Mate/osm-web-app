export default class User {
  userId: string;
  name: string;
  email: string;
  token: string;
  roles: string[];
  logo: string;
  sites: Site[];
  companyId: string;
  companyName: string;

  constructor(
    userId: string,
    name: string,
    email: string,
    token: string,
    roles: string[],
    logo: string,
    sites: Site[],
    companyId: string,
    companyName: string
  ) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.token = token;
    this.roles = roles;
    this.logo = logo;
    this.sites = sites;
    this.companyId = companyId;
    this.companyName = companyName;
  }
}

export interface Role {
  id: string;
  name: string;
}

export interface Site {
  id: string;
  name: string;
  logo: string;
}

export interface UserTable {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  sites: Site[];
}

export interface Responsible {
  id: string;
  name: string;
  email: string;
}

export interface UserUpdateForm {
  id: string;
  name: string;
  email: string;
  roles: string[];
  siteId: string;
  uploadCardDataWithDataNet: number;
  uploadCardEvidenceWithDataNet: number;
  status: string;
}
