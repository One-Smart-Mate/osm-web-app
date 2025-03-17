import React from "react";
import Constants from "../../../utils/Constants";
import Strings from "../../../utils/localizations/Strings";

interface CustomNodeElementProps {
  nodeDatum: any;
  toggleNode: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  setContextMenuVisible: (visible: boolean) => void;
  setContextMenuPos: (pos: { x: number; y: number }) => void;
  setSelectedNode: (node: any) => void;
  handleShowDetails: (nodeId: string) => void;
}

const isLeafNode = (node: any) => !node.children || node.children.length === 0;

const CustomNodeElement: React.FC<CustomNodeElementProps> = ({
  nodeDatum,
  toggleNode,
  containerRef,
  setContextMenuVisible,
  setContextMenuPos,
  setSelectedNode,
  handleShowDetails,
}) => {
  const getCollapsedState = (nodeId: string): boolean => {
    const storedState = localStorage.getItem(
      `${Constants.nodeStartBridgeCollapsed}${nodeId}${Constants.nodeEndBridgeCollapserd}`
    );
    return storedState === "true";
  };

  const setCollapsedState = (nodeId: string, isCollapsed: boolean) => {
    localStorage.setItem(
      `${Constants.nodeStartBridgeCollapsed}${nodeId}${Constants.nodeEndBridgeCollapserd}`,
      isCollapsed.toString()
    );
  };

  const isCollapsed = getCollapsedState(nodeDatum.id);
  nodeDatum.__rd3t.collapsed = isCollapsed;

  const getFillColor = (status: string | undefined) => {
    switch (status) {
      case Strings.detailsOptionC:
        return "#383838";
      case Strings.detailsOptionS:
        return "#999999";
      case Strings.activeStatus:
      default:
        return isLeafNode(nodeDatum) ? "#FFFF00" : "#145695";
    }
  };

  const fillColor = getFillColor(nodeDatum.status);

  const handleContextMenu = (e: React.MouseEvent<SVGGElement>) => {
    e.preventDefault();
    if (containerRef.current) {
      const offsetX = e.currentTarget.getBoundingClientRect().right;
      const offsetY = e.currentTarget.getBoundingClientRect().top;
      setContextMenuPos({ x: offsetX - 50, y: offsetY - 60 });
    }
    setSelectedNode({ data: nodeDatum });
    setContextMenuVisible(true);
  };

  const handleLeftClick = (e: React.MouseEvent<SVGGElement>) => {
    e.stopPropagation();
    setContextMenuVisible(false);
    const newCollapsedState = !nodeDatum.__rd3t.collapsed;
    setCollapsedState(nodeDatum.id, newCollapsedState);
    // Llamamos al callback para desplegar el drawer de detalles
    handleShowDetails(nodeDatum.id);
    toggleNode();
  };

  return (
    <g onClick={handleLeftClick} onContextMenu={handleContextMenu}>
      <circle r={15} fill={fillColor} stroke="none" strokeWidth={0} />
      <text
        fill="black"
        strokeWidth={nodeDatum.id === "0" ? "0.8" : "0"}
        x={nodeDatum.id === "0" ? -200 : 20}
        y={nodeDatum.id === "0" ? 0 : 20}
        style={{ fontSize: "14px" }}
      >
        {nodeDatum.name}
      </text>
    </g>
  );
};

export default CustomNodeElement;
