import React from "react";
import { Button } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { UserRoles } from "../../../utils/Extensions";
import { theme } from "antd";
import useDarkMode from "../../../utils/hooks/useDarkMode";

interface CiltLevelContextMenuProps {
  isVisible: boolean;
  role: UserRoles;
  contextMenuPos: { x: number; y: number };
  handleAssignPositionCiltMstr: () => void;
  handleAssignOpl: () => void;
  handleSeeAssignments: () => void;
}

const CiltLevelMenuOptions: React.FC<CiltLevelContextMenuProps> = ({
  isVisible,
  role,
  contextMenuPos,
  handleAssignPositionCiltMstr,
  handleAssignOpl,
  handleSeeAssignments,
}) => {
  if (
    !isVisible ||
    !(role === UserRoles._IHSISADMIN || role === UserRoles._LOCALSYSADMIN)
  )
    return null;

  const { token } = theme.useToken();
  const isDarkMode = useDarkMode();

  return (
    <div
      className={`border border-gray-300 shadow-md p-2 flex flex-col gap-2 z-50 absolute${
        isDarkMode ? "" : " bg-white"
      }`}
      style={{
        top: contextMenuPos.y - 20,
        left: contextMenuPos.x + 15,
        ...(isDarkMode ? { backgroundColor: token.colorBgContainer } : {}),
      }}
    >
      <Button type="primary" onClick={handleSeeAssignments}>
        {Strings.seeAssignments}
      </Button>
      <Button type="primary" onClick={handleAssignPositionCiltMstr}>
        {Strings.assignPositionCiltMstrLevel}
      </Button>
      <Button color="primary" variant="outlined" onClick={handleAssignOpl}>
        {Strings.assignOplLevel}
      </Button>
    </div>
  );
};

export default CiltLevelMenuOptions;
