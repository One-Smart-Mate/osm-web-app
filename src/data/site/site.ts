export interface Site {
  id: string;
  name: string;
  rfc: string;
  address: string;
  contact: string;
  position: string;
  phone: string;
  extension: string;
  email: string;
  cellular: string;
  logo: string;
  status: string;
  siteCode: string;
  userLicense: string;
  userQuantity: string;
}

export interface SiteUpdateForm {
  id: string;
  siteCode: string;
  siteBusinessName: string;
  name: string;
  siteType: string;
  rfc: string;
  address: string;
  contact: string;
  position: string;
  phone: string;
  extension: string;
  cellular: string;
  email: string;
  logo: string;
  latitude: string;
  longitude: string;
  dueDate: string;
  monthlyPayment: string;
  currency: string;
  appHistoryDays: number;
  status: string;
}
