import React from "react";

export class Route {
    label: string;
    path: string;
    element: React.ReactElement;
    icon: React.ReactElement;
    section: string;

    constructor(
      label: string,
      path: string,
      element: React.ReactElement,
      icon: React.ReactElement,
      section: string
    ) {
      this.label = label;
      this.path = path;
      this.element = element;
      this.icon = icon;
      this.section = section;
    }
  }
