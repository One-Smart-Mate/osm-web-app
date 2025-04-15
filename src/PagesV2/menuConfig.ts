export type ContentType =
  | "home"
  | "settings"
  | "profile"
  | "dashboard"
  | "login"
  | "register"
  | "typography"
  | "color"
  | "shadow"
  | "sample"
  | "docs";

interface MenuInfo {
  label: string;
  group: string;
}

export const menuMap: Record<ContentType, MenuInfo> = {
  home: { label: "Home", group: "Navigation" },
  settings: { label: "Settings", group: "Navigation" },
  profile: { label: "Profile", group: "Navigation" },
  dashboard: { label: "Dashboard", group: "Navigation" },
  login: { label: "Login", group: "Authentication" },
  register: { label: "Register", group: "Authentication" },
  typography: { label: "Typography", group: "Utilities" },
  color: { label: "Color", group: "Utilities" },
  shadow: { label: "Shadow", group: "Utilities" },
  sample: { label: "Sample Page", group: "Support" },
  docs: { label: "Documentation", group: "Support" },
};
