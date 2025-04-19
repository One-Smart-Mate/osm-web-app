import React, { useRef } from "react";
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
  const longPressTimeoutRef = useRef<number | null>(null);
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null);

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

    handleShowDetails(nodeDatum.id);
    toggleNode();
  };

  const handleTouchStart = (e: React.TouchEvent<SVGGElement>) => {
    const touch = e.touches[0];
    touchStartPositionRef.current = { x: touch.clientX, y: touch.clientY };

    longPressTimeoutRef.current = window.setTimeout(() => {
      if (containerRef.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        setContextMenuPos({ x: rect.right - 50, y: rect.top - 60 });
        setSelectedNode({ data: nodeDatum });
        setContextMenuVisible(true);
      }
    }, 800);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGGElement>) => {
    if (!touchStartPositionRef.current) return;

    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - touchStartPositionRef.current.x);
    const diffY = Math.abs(touch.clientY - touchStartPositionRef.current.y);

    if (diffX > 10 || diffY > 10) {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    touchStartPositionRef.current = null;
  };

  return (
    <g
      onClick={handleLeftClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
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
