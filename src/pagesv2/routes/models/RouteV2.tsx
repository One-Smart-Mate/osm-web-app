export class RouteV2 {
    label: string;
    path: string;
    element: JSX.Element;
    icon: JSX.Element;
    section: string;

    constructor(
      label: string,
      path: string,
      element: JSX.Element,
      icon: JSX.Element,
      section: string
    ) {
      this.label = label;
      this.path = path;
      this.element = element;
      this.icon = icon;
      this.section = section;
    }
  }
