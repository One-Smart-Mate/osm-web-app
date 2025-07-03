import React from "react";
import { Button } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { UserRoles } from "../../../utils/Extensions";
import { theme } from 'antd';
import useDarkMode from '../../../utils/hooks/useDarkMode';

interface LevelContextMenuProps {
  isVisible: boolean;
  role: UserRoles;
  isRootNode: boolean;
  contextMenuPos: { x: number; y: number };
  handleCreateLevel: () => void;
  handleUpdateLevel: () => void;
  handleCloneLevel: () => void;
  handleCreatePosition: () => void; // Callback for creating a position
  handleInitiateMove: () => void;
}

const LevelMenuOptions: React.FC<LevelContextMenuProps> = ({
  isVisible,
  role,
  isRootNode,
  contextMenuPos,
  handleCreateLevel,
  handleUpdateLevel,
  handleCloneLevel,
  handleInitiateMove,
}) => {
  if (
    !isVisible ||
    !(role === UserRoles.IHSISADMIN || role === UserRoles.LOCALSYSADMIN)
  )
    return null;

  const { token } = theme.useToken();
  const isDarkMode = useDarkMode();

  return (
    <div
      className={`border border-gray-300 shadow-md p-2 flex flex-col gap-2 z-50 absolute${isDarkMode ? '' : ' bg-white'}`}
      style={{
        top: contextMenuPos.y,
        left: contextMenuPos.x * 0.7,
        ...(isDarkMode ? { backgroundColor: token.colorBgContainer } : {}),
      }}
    >
      {isRootNode ? (
        <>
          <Button type="primary" onClick={handleCreateLevel}>
            {Strings.levelsTreeOptionCreate}
          </Button>
        </>
      ) : (
        <>
          <Button type="primary" onClick={handleCreateLevel}>
            {Strings.levelsTreeOptionCreate}
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onClick={handleUpdateLevel}
          >
            {Strings.levelsTreeOptionEdit}
          </Button>
          <Button type="link" variant="dashed" onClick={handleCloneLevel}>
            {Strings.levelsTreeOptionClone}
          </Button>
          <Button type="primary" onClick={handleInitiateMove}>
            {Strings.levelsTreeOptionMove || 'Move'}
          </Button>
        </>
      )}
    </div>
  );
};

export default LevelMenuOptions;
