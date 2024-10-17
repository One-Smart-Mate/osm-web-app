export class Route {
  label: string;
  path: string;
  fullPath: string;
  element: JSX.Element;
  icon: JSX.Element;

  constructor(
    label: string,
    path: string,
    fullPath: string,
    element: JSX.Element,
    icon: JSX.Element
  ) {
    this.label = label;
    this.path = path;
    this.fullPath = fullPath;
    this.element = element;
    this.icon = icon;
  }
}
