import React from "react";

export class RouteV2 {
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
