import { Typography, Input, Button, Space, App as AntApp } from "antd";
import { useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { useFindLevelByMachineIdMutation, useGetChildrenLevelsMutation } from "../../../services/levelService";
import { LevelCache } from "../../../utils/levelCache";
import AnatomyNotification from "../../components/AnatomyNotification";

interface MachineIdSearchProps {
  siteId: string;
  levels: any[];
  onSearchSuccess: (
    _hierarchy: Map<number, any[]>,
    _selectedLevels: Map<number, string>,
    _pagination: Map<number, { current: number; pageSize: number; total: number }>,
    _loadedData: Map<number, any[]>,
    _finalNodeId: number | null,
    _isComplete: boolean
  ) => void;
  onScrollToLevel?: (_levelIndex: number) => void;
  onLoadingChange?: (_isLoading: boolean) => void;
}

const MachineIdSearch = ({
  siteId,
  levels,
  onSearchSuccess,
  onScrollToLevel,
  onLoadingChange
}: MachineIdSearchProps) => {
  const { notification } = AntApp.useApp();
  const [findLevelByMachineId, { isLoading: isSearchingMachine }] = useFindLevelByMachineIdMutation();
  const [getChildrenLevels] = useGetChildrenLevelsMutation();

  const [machineIdSearch, setMachineIdSearch] = useState<string>("");
  const [machineSearchError, setMachineSearchError] = useState<string>("");
  const [machineSearchSuccess, setMachineSearchSuccess] = useState<boolean>(false);
  const [isProcessingLevels, setIsProcessingLevels] = useState<boolean>(false);

  const handleMachineIdSearch = async () => {
    // Validate input
    if (!machineIdSearch.trim()) {
      const errorMsg = Strings.requiredMachineId || "Machine ID is required";
      setMachineSearchError(errorMsg);
      return;
    }

    // Validate siteId
    if (!siteId || siteId === "0" || siteId === "") {
      console.error("[MachineIdSearch] Invalid siteId:", siteId);
      AnatomyNotification.error(notification, "Invalid site");
      return;
    }

    setMachineSearchError("");
    setMachineSearchSuccess(false);
    onLoadingChange?.(true);

    try {
      const result = await findLevelByMachineId({
        siteId: siteId.toString(),
        machineId: machineIdSearch.trim()
      }).unwrap();

      // Validate response
      if (!result) {
        console.error("[MachineIdSearch] Empty response from findLevelByMachineId");
        setMachineSearchError(Strings.machineIdNotFound || "Machine ID not found");
        onLoadingChange?.(false);
        return;
      }

      if (!result.hierarchy || !Array.isArray(result.hierarchy)) {
        console.error("[MachineIdSearch] Invalid hierarchy format in response:", result);
        setMachineSearchError("Invalid response format");
        onLoadingChange?.(false);
        return;
      }

      if (result.hierarchy.length === 0) {
        console.error("[MachineIdSearch] Empty hierarchy returned for machineId:", machineIdSearch);
        setMachineSearchError(Strings.machineIdNotFound || "Machine ID not found");
        onLoadingChange?.(false);
        return;
      }

      // Start processing levels
      setIsProcessingLevels(true);

      const newHierarchy = new Map<number, any[]>();
      const newSelectedLevels = new Map<number, string>();
      const newPagination = new Map<number, { current: number; pageSize: number; total: number }>();
      const newLoadedData = new Map<number, any[]>();
      const PAGE_SIZE = 10;

      // Process each level in the hierarchy - store only the specific level from the path (no siblings)
      for (let i = 0; i < result.hierarchy.length; i++) {
        const currentLevel = result.hierarchy[i];

        // Validate current level
        if (!currentLevel || !currentLevel.id) {
          console.error("[MachineIdSearch] Invalid level object at index:", i, currentLevel);
          continue;
        }

        // For searched path, only show the specific level (no siblings)
        const specificLevelArray = [currentLevel];

        // Store the single level
        newLoadedData.set(i, specificLevelArray);
        newHierarchy.set(i, specificLevelArray);

        // Pagination for single item
        newPagination.set(i, {
          current: 1,
          pageSize: PAGE_SIZE,
          total: 1
        });

        // Pre-select the level from the found path
        newSelectedLevels.set(i, currentLevel.id.toString());
      }

      // Get the last level found - this is the node the user searched for
      const lastLevel = result.hierarchy[result.hierarchy.length - 1];
      const lastLevelId = parseInt(lastLevel.id.toString());

      if (isNaN(lastLevelId)) {
        console.error("[MachineIdSearch] Invalid lastLevelId:", lastLevel);
        setIsProcessingLevels(false);
        setMachineSearchError("Invalid level data");
        onLoadingChange?.(false);
        return;
      }

      // Now load children of the found level
      const nextLevelIndex = result.hierarchy.length;
      let childrenLevels: any[] = [];

      try {
        const cachedChildren = await LevelCache.getCachedChildren(parseInt(siteId), lastLevelId);

        if (cachedChildren && cachedChildren.length > 0) {
          childrenLevels = cachedChildren.filter(level => level && level.status !== 'S');
        } else {
          // Load from API
          try {
            const response = await getChildrenLevels({
              siteId: siteId.toString(),
              parentId: lastLevelId
            }).unwrap();

            if (response && Array.isArray(response)) {
              childrenLevels = response.filter((level: any) => level && level.status !== 'S');

              // Cache the results
              for (const level of childrenLevels) {
                await LevelCache.cacheLevel(parseInt(siteId), level);
              }
            }
          } catch (error) {
            console.log("[MachineIdSearch] No children found or error loading children:", error);
            childrenLevels = [];
          }
        }
      } catch (error) {
        console.log("[MachineIdSearch] Error checking cache for children:", error);
        childrenLevels = [];
      }

      // If children exist, add them to the hierarchy
      let finalNodeId = lastLevelId;
      let isComplete = false;

      if (childrenLevels.length > 0) {
        // Sort children alphabetically/alphanumerically by name
        const sortedChildren = childrenLevels.sort((a, b) => {
          const nameA = (a.name || a.levelName || '').toLowerCase();
          const nameB = (b.name || b.levelName || '').toLowerCase();
          return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
        });

        // Store all loaded data
        newLoadedData.set(nextLevelIndex, sortedChildren);

        // Paginate first page
        const paginatedChildren = sortedChildren.slice(0, PAGE_SIZE);
        newHierarchy.set(nextLevelIndex, paginatedChildren);

        // Pagination info
        newPagination.set(nextLevelIndex, {
          current: 1,
          pageSize: PAGE_SIZE,
          total: sortedChildren.length
        });

        // Not complete yet, user needs to select a child
        isComplete = false;
        finalNodeId = null;
      } else {
        // No children - this is the final node
        isComplete = true;
        finalNodeId = lastLevelId;
      }

      // Success! Clear inputs and notify
      setMachineIdSearch("");
      setMachineSearchError("");
      setIsProcessingLevels(false);
      setMachineSearchSuccess(true);
      onLoadingChange?.(false);

      // Call success callback
      onSearchSuccess(newHierarchy, newSelectedLevels, newPagination, newLoadedData, finalNodeId, isComplete);

      // Scroll to the level where the found node is (last level in hierarchy)
      if (onScrollToLevel) {
        const targetIndex = result.hierarchy.length - 1;

        // Wait for DOM to update
        setTimeout(() => {
          onScrollToLevel(targetIndex);

          // Add highlight effect to the target level
          setTimeout(() => {
            const targetLevelElement = document.querySelector(`[data-level-index="${targetIndex}"]`);
            if (targetLevelElement) {
              const element = targetLevelElement as HTMLElement;
              const originalBackground = element.style.backgroundColor;
              element.style.backgroundColor = '#e6f7ff';
              element.style.transition = 'background-color 0.5s ease';

              setTimeout(() => {
                element.style.backgroundColor = originalBackground || '';
                setTimeout(() => {
                  element.style.transition = '';
                }, 500);
              }, 2000);
            }
          }, 300);
        }, 400);
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setMachineSearchSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error("[MachineIdSearch] Error searching for machineId:", machineIdSearch, error);
      setIsProcessingLevels(false);
      onLoadingChange?.(false);
      setMachineSearchError(
        error?.data?.message ||
        Strings.machineIdNotFound ||
        "Machine ID not found"
      );
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <Typography.Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
        {Strings.searchByMachineId || "Search by Machine ID (Optional)"}
      </Typography.Text>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          placeholder={Strings.enterMachineId || "Enter machine ID to auto-fill location"}
          value={machineIdSearch}
          onChange={(e) => {
            setMachineIdSearch(e.target.value);
            setMachineSearchError("");
          }}
          onPressEnter={handleMachineIdSearch}
          status={machineSearchError ? 'error' : undefined}
          disabled={isSearchingMachine || isProcessingLevels}
        />
        <Button
          type="primary"
          onClick={handleMachineIdSearch}
          loading={isSearchingMachine || isProcessingLevels}
        >
          {Strings.search || "Search"}
        </Button>
      </Space.Compact>
      {machineSearchError && (
        <Typography.Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
          {machineSearchError}
        </Typography.Text>
      )}
      {isProcessingLevels && (
        <Typography.Text style={{ fontSize: '12px', display: 'block', marginTop: '4px', color: '#1890ff' }}>
          {Strings.processingLevels || "Processing location hierarchy, please wait..."}
        </Typography.Text>
      )}
      {machineSearchSuccess && !isProcessingLevels && (
        <Typography.Text type="success" style={{ fontSize: '12px', display: 'block', marginTop: '4px', color: '#52c41a' }}>
          {Strings.machineIdFound}
        </Typography.Text>
      )}
      {!machineSearchSuccess && !machineSearchError && !isProcessingLevels && (
        <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
          {Strings.machineIdHelpText}
        </Typography.Text>
      )}
    </div>
  );
};

export default MachineIdSearch;
