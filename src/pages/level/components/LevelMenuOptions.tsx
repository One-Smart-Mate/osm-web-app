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

const LevelMenuOptions: React.FC<LevelContextMenuProps> = ({
  isVisible,
  role,
  isRootNode,
  contextMenuPos,
  handleCreateLevel,
  handleUpdateLevel,
  handleCloneLevel,
}) => {
  if (
    !isVisible ||
    !(role === UserRoles.IHSISADMIN || role === UserRoles.LOCALSYSADMIN)
  )
    return null;

  return (
    <div
      className="bg-white border border-gray-300 shadow-md p-2 flex flex-col gap-2 z-50 absolute"
      style={{
        top: contextMenuPos.y,
        left: contextMenuPos.x * 0.7,
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
            color="default"
            variant="outlined"
            onClick={handleUpdateLevel}
          >
            {Strings.levelsTreeOptionEdit}
          </Button>
          <Button type="link" variant="dashed" onClick={handleCloneLevel}>
            {Strings.levelsTreeOptionClone}
          </Button>
        </>
      )}
    </div>
  );
};

export default LevelMenuOptions;
