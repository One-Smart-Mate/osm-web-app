import React from "react";
import { Layout, Breadcrumb } from "antd";
import { ContentType, menuMap } from "./menuConfig";

const { Content } = Layout;

interface Props {
  collapsed: boolean;
  currentContent: ContentType;
  sidebarWidth: number;
  collapsedWidth: number;
}

const MainContent: React.FC<Props> = ({
  collapsed,
  currentContent,
  sidebarWidth,
  collapsedWidth,
}) => {
// Mapping sections for the Breadcrumb
  const sectionMap: { [key: string]: string } = {
    dashboard: "Navigation",
    login: "Authentication",
    register: "Authentication",
    typography: "Utilities",
    color: "Utilities",
    shadow: "Utilities",
    sample: "Support",
    docs: "Support",
  };

// Function to get the hierarchical path without "Home"
  const getBreadcrumbPath = (contentType: ContentType) => {
    const section = sectionMap[contentType];
    if (!section) {
      // If there is no section, return only the current content
      return [{ label: menuMap[contentType].label, path: `/${contentType}` }];
    }

    return [
      { label: section, path: `/${section.toLowerCase()}` },
      { label: menuMap[contentType].label, path: `/${section.toLowerCase()}/${contentType}` },
    ];
  };

  const renderContent = () => {
    switch (currentContent) {
      case "dashboard":
        return (
          <div>
            <p>Contenido del Dashboard...</p>
          </div>
        );
      case "login":
        return (
          <div>
            <p>Contenido de Login...</p>
          </div>
        );
      case "register":
        return (
          <div>
            <p>Contenido de Register...</p>
          </div>
        );
      case "typography":
        return (
          <div>

            <p>Contenido de Typography...</p>
          </div>
        );
      case "color":
        return (
          <div>
            <p>Contenido de Color...</p>
          </div>
        );
      case "shadow":
        return (
          <div>
            <p>Contenido de Shadow...</p>
          </div>
        );
      case "sample":
        return (
          <div>
            <p>Contenido de Sample Page...</p>
          </div>
        );
      case "docs":
        return (
          <div>

            <p>Contenido de Documentation...</p>
          </div>
        );
      default:
        return (
          <div>
            <p>Contenido principal de la aplicación...</p>
          </div>
        );
    }
  };

  return (
    <Content
      style={{
        marginTop: 64,
        padding: 0,
        height: `calc(100vh - 64px)`,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Breadcrumb style={{ margin: "20px" }}>
        {getBreadcrumbPath(currentContent).map((item, index) => (
          <Breadcrumb.Item key={index}>
            <span style={{ fontWeight: index === getBreadcrumbPath(currentContent).length - 1 ? 600 : 400 }}>
              {item.label}
            </span>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", margin: "20px" }}>
        {renderContent()}
      </div>
    </Content>
  );
};

export default MainContent;