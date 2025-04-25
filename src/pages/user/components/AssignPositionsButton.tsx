import { useState } from "react";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import { Button, Spin } from "antd";
import {
  handleErrorNotification,
  handleSucccessNotification,
  NotificationSuccess,
} from "../../../utils/Notifications";
import { useGetPositionsBySiteIdQuery } from "../../../services/positionService";
import { Position } from "../../../data/postiions/positions";
import PositionSelectionModal from "./PositionSelectionModal";
import { useUpdatePositionMutation } from "../../../services/positionService";
import { useGetUserPositionsMutation } from "../../../services/userService";
import { UserPosition } from "../../../data/user/user";
import { isRedesign } from "../../../utils/Extensions";

interface AssignPositionsButtonProps {
  userId: string;
  siteId: string;
  onPositionsUpdated: () => void;
}

const AssignPositionsButton = ({
  userId,
  siteId,
  onPositionsUpdated,
}: AssignPositionsButtonProps) => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [dataIsLoading, setDataLoading] = useState(false);
  const [updatePosition] = useUpdatePositionMutation();
  const [getUserPositions] = useGetUserPositionsMutation();
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
  
  // Fetch positions for the site
  const { data: positions = [], isLoading } = useGetPositionsBySiteIdQuery(siteId, {
    skip: !siteId,
  });
  
  // Prepare positions with userIds information
  const positionsWithUserIds = positions.map(position => {
    // Initialize userIds as empty array if not present
    return {
      ...position,
      userIds: position.userIds || []
    };
  });

  const handleOnClickButton = async () => {
    setDataLoading(true);
    
    try {
      // Fetch current user positions
      const positions = await getUserPositions(userId).unwrap();
      setUserPositions(positions);
      
      // Open the modal after fetching positions
      setModalOpen(true);
    } catch (error) {
      console.error(`Error fetching positions for user ${userId}:`, error);
      handleErrorNotification(error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleOnCancelButton = () => {
    setModalOpen(false);
  };

  const handleOnAssignPositions = async (selectedPositions: Position[]) => {
    try {
      setDataLoading(true);
      
      // Get all positions for the site
      const allPositions = positionsWithUserIds || [];
      const userIdNumber = Number(userId);
      
      // Get IDs of currently assigned positions
      const currentPositionIds = userPositions.map(p => p.id);
      
      // Get IDs of selected positions
      const selectedPositionIds = selectedPositions.map(p => p.id);
      
      // Determine positions to add user to (selected but not current)
      const positionsToAdd = allPositions.filter(p => 
        selectedPositionIds.includes(p.id) && !currentPositionIds.includes(p.id)
      );
      
      // Determine positions to remove user from (current but not selected)
      const positionsToRemove = allPositions.filter(p => 
        !selectedPositionIds.includes(p.id) && currentPositionIds.includes(p.id)
      );
      
      // Combine all positions that need updates
      const positionsToUpdate = [
        ...positionsToAdd.map(p => ({
          ...p,
          userIds: [...p.userIds, userIdNumber]
        })),
        ...positionsToRemove.map(p => ({
          ...p,
          userIds: p.userIds.filter(id => id !== userIdNumber)
        }))
      ];
      
      // Update all positions that need changes
      if (positionsToUpdate.length > 0) {
        const updatePromises = positionsToUpdate.map(position => 
          updatePosition(position).unwrap()
        );
        
        await Promise.all(updatePromises);
      }
      
      // Notify success and trigger refresh
      handleSucccessNotification(NotificationSuccess.UPDATE);
      onPositionsUpdated();
    } catch (error) {
      console.error("Error updating positions:", error);
      handleErrorNotification(error);
    } finally {
      setDataLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <>
      {isRedesign() ? <Button onClick={handleOnClickButton}>
        {Strings.assignPositions}
      </Button> : <CustomButton onClick={handleOnClickButton} type="edit">
        {Strings.assignPositions}
      </CustomButton>}
      
      <PositionSelectionModal
        isVisible={modalIsOpen}
        onCancel={handleOnCancelButton}
        onConfirm={handleOnAssignPositions}
        positions={positionsWithUserIds}
        loading={isLoading || dataIsLoading}
        userPositions={userPositions}
      />
      
      <Spin spinning={dataIsLoading} fullscreen />
    </>
  );
};

export default AssignPositionsButton;
