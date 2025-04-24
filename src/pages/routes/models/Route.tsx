export class Route {
  label: string;
  path: string;
  fullPath: string;
  element: JSX.Element;
  icon: JSX.Element;
  section: string; // Agrega la propiedad section

  constructor(
    label: string,
    path: string,
    fullPath: string,
    element: JSX.Element,
    icon: JSX.Element,
    section: string 
  ) {
    this.label = label;
    this.path = path;
    this.fullPath = fullPath;
    this.element = element;
    this.icon = icon;// Inicializa la propiedad section
  }
}
