export class Route {
  label: string;
  path: string;
  fullPath: string;
  element: React.ReactElement;
  icon: React.ReactElement;

  constructor(
    label: string,
    path: string,
    fullPath: string,
    element: React.ReactElement,
    icon: React.ReactElement,
  ) {
    this.label = label;
    this.path = path;
    this.fullPath = fullPath;
    this.element = element;
    this.icon = icon;
  }
}
