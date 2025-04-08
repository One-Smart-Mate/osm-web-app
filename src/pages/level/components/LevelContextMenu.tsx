import React from "react";
import { Button } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { UserRoles } from "../../../utils/Extensions";

interface LevelContextMenuProps {
  isVisible: boolean;
  role: UserRoles;
  isRootNode: boolean;
  contextMenuPos: { x: number; y: number };
  handleCreateLevel: () => void;
  handleUpdateLevel: () => void;
  handleCloneLevel: () => void;
  handleCreatePosition: () => void; // Callback for creating a position
}

const LevelContextMenu: React.FC<LevelContextMenuProps> = ({
  isVisible,
  role,
  isRootNode,
  contextMenuPos,
  handleCreateLevel,
  handleUpdateLevel,
  handleCloneLevel,
}) => {
  
  if (!isVisible || !(role === UserRoles.IHSISADMIN || role === UserRoles.LOCALSYSADMIN))
    return null;

  return (
    <div
      className="bg-white border border-gray-300 shadow-md p-2 flex flex-col gap-2 z-50 absolute"
      style={{
        top: contextMenuPos.y,
        left: contextMenuPos.x,
      }}
    >
      {isRootNode ? (
        <>
          <Button
            className="w-28 bg-green-700 text-white mx-auto"
            onClick={handleCreateLevel}
          >
            {Strings.levelsTreeOptionCreate}
          </Button>
        </>
      ) : (
        <>
          <Button
            className="w-28 bg-green-700 text-white mx-auto"
            onClick={handleCreateLevel}
          >
            {Strings.levelsTreeOptionCreate}
          </Button>
          <Button
            className="w-28 bg-blue-700 text-white mx-auto"
            onClick={handleUpdateLevel}
          >
            {Strings.levelsTreeOptionEdit}
          </Button>
          <Button
            className="w-28 bg-yellow-500 text-white mx-auto"
            onClick={handleCloneLevel}
          >
            {Strings.levelsTreeOptionClone}
          </Button>
        </>
      )}
    </div>
  );
};

export default LevelContextMenu;
