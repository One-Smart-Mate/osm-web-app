import React, { useRef } from "react";
import Constants from "../../../utils/Constants";
import Strings from "../../../utils/localizations/Strings";
import { theme } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";

interface NodeElementProps {
  nodeDatum: any;
  toggleNode: () => void;
  containerRef: React.RefObject<HTMLDivElement> | React.RefObject<null>;
  setContextMenuVisible: (_visible: boolean) => void;
  setContextMenuPos: (_pos: { x: number; y: number }) => void;
  setSelectedNode: (_node: any) => void;
  handleShowDetails: (_nodeId: string) => void;
  cardCounts?: { [key: string]: number };
  movingNodeId?: string | null;
  onMoveNode?: (_newParentId: string) => void;
  isLoading?: boolean;
}

const isLeafNode = (node: any) => !node.children || node.children.length === 0;

const hasCards = (node: any, cardCounts: { [key: string]: number }) => {
  if (node.id !== "0" && cardCounts[node.id] && cardCounts[node.id] > 0) {
    return true;
  }

  if (node.children && node.children.length > 0) {
    return node.children.some((child: any) => hasCards(child, cardCounts));
  }

  return false;
};

const calculateTotalCards = (
  node: any,
  cardCounts: { [key: string]: number }
): number => {
  const ownCards =
    node.id !== "0" && cardCounts[node.id] ? cardCounts[node.id] : 0;

  if (!node.children || node.children.length === 0) {
    return ownCards;
  }

  const childrenCards = node.children.reduce(
    (total: number, child: any) =>
      total + calculateTotalCards(child, cardCounts),
    0
  );

  return ownCards + childrenCards;
};

const NodeElement: React.FC<NodeElementProps> = ({
  nodeDatum,
  toggleNode,
  containerRef,
  setContextMenuVisible,
  setContextMenuPos,
  setSelectedNode,
  handleShowDetails,
  cardCounts = {},
  movingNodeId,
  onMoveNode,
  isLoading = false,
}) => {
  const longPressTimeoutRef = useRef<number | null>(null);
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const { token } = theme.useToken();

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

  // Don't manage collapsed state for placeholders
  const isCollapsed = nodeDatum.attributes?.isPlaceholder ? false : getCollapsedState(nodeDatum.id);
  if (!nodeDatum.attributes?.isPlaceholder && nodeDatum.__rd3t) {
    nodeDatum.__rd3t.collapsed = isCollapsed;
  }

  const getFillColor = (status: string | undefined) => {
    // Placeholders should have a distinct color
    if (nodeDatum.attributes?.isPlaceholder) {
      return "#e8e8e8"; // Light gray for placeholders
    }

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

  const cardCount = nodeDatum.id !== "0" ? cardCounts[nodeDatum.id] : null;

  const totalCardCount =
    nodeDatum.id !== "0" ? calculateTotalCards(nodeDatum, cardCounts) : null;

  const nodeHasOwnCards = cardCount && cardCount > 0;

  const nodeChildrenHaveCards =
    nodeDatum.children &&
    nodeDatum.children.length > 0 &&
    nodeDatum.children.some((child: any) => hasCards(child, cardCounts));

  const showSplitColors =
    nodeDatum.id !== "0" && (nodeHasOwnCards || nodeChildrenHaveCards);

  const displayText = nodeDatum.attributes?.isPlaceholder
    ? nodeDatum.name
    : nodeDatum.name + (totalCardCount && totalCardCount > 0 ? ` (${totalCardCount})` : "");

  const handleContextMenu = (e: React.MouseEvent<SVGGElement>) => {
    e.preventDefault();

    // Don't show context menu for placeholders
    if (nodeDatum.attributes?.isPlaceholder) {
      return;
    }

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

    // Don't handle collapsed state for placeholders
    if (!nodeDatum.attributes?.isPlaceholder) {
      const newCollapsedState = !nodeDatum.__rd3t.collapsed;
      setCollapsedState(nodeDatum.id, newCollapsedState);
      handleShowDetails(nodeDatum.id);
    }

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

  const isMoving = movingNodeId === nodeDatum.id;
  const isPossibleTarget = movingNodeId && !isMoving && nodeDatum.id !== "0";

  const handleNodeClick = (e: React.MouseEvent<SVGGElement>) => {
    // Don't handle clicks for loading placeholders
    if (isLoading) {
      e.stopPropagation();
      return;
    }

    if (movingNodeId) {
      e.stopPropagation();
      if (isPossibleTarget && onMoveNode) {
        onMoveNode(nodeDatum.id);
      }
      return;
    }
    handleLeftClick(e);
  };

  const handleNodeContextMenu = (e: React.MouseEvent<SVGGElement>) => {
    if (movingNodeId) {
      e.preventDefault();
      return; 
    }
    handleContextMenu(e);
  };

  return (
    <g
      onClick={handleNodeClick}
      onContextMenu={handleNodeContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        cursor: isLoading ? 'progress' : nodeDatum.attributes?.isPlaceholder ? 'pointer' : isPossibleTarget ? 'copy' : 'pointer',
        opacity: isMoving ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      {isPossibleTarget && (
        <circle r="20" fill="none" stroke="#1890ff" strokeWidth="2" strokeDasharray="4 4" />
      )}
      {/* Node visual */}
      {nodeDatum.attributes?.isPlaceholder ? (
        // Placeholder node
        <circle r={8} fill="#f0f0f0" stroke="#d9d9d9" strokeWidth={0.5} />
      ) : isLoading ? (
        // Loading node
        <>
          <circle r={15} fill="#f0f0f0" stroke="#d9d9d9" strokeWidth={1} />
          <foreignObject x={-10} y={-10} width={20} height={20}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%'
            }}>
              <LoadingOutlined style={{ fontSize: '12px', color: '#1890ff' }} spin />
            </div>
          </foreignObject>
        </>
      ) : showSplitColors ? (
        <>
          <circle r={15} fill="#FFFF00" stroke="none" />
          <path
            d="M -15,0 A 15,15 0 0,1 15,0 L -15,0 Z"
            fill="#145695"
            stroke="none"
          />
        </>
      ) : (
        <circle r={15} fill={fillColor} stroke="none" strokeWidth={0} />
      )}
      <text
        fill={nodeDatum.attributes?.isPlaceholder ? "#aaaaaa" : isLoading ? "#999999" : token.colorText}
        strokeWidth={nodeDatum.id === "0" ? "0.8" : "0"}
        x={nodeDatum.id === "0" ? -200 : nodeDatum.attributes?.isPlaceholder ? 12 : 20}
        y={nodeDatum.id === "0" ? 0 : nodeDatum.attributes?.isPlaceholder ? 5 : 20}
        style={{ fontSize: nodeDatum.attributes?.isPlaceholder ? "10px" : "14px", fontStyle: nodeDatum.attributes?.isPlaceholder ? "italic" : "normal" }}
      >
        {displayText}
      </text>
    </g>
  );
};

export default NodeElement;
