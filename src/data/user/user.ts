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

export interface UserPosition {
  id: number;
  name: string;
  description: string;
  route: string;
  levelId: number;
  levelName: string;
  areaId: number;
  areaName: string;
  siteId: number;
  siteName: string;
  siteType: string;
  status: string;
}

export const getSiteName = (user?: User): string | undefined => {
  if(user == null || user == undefined) return ''
  return user.sites.length > 0 ? user.sites[0].name : ''
}
