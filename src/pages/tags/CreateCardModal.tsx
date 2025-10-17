import { useEffect, useState, useRef } from "react";
import { Modal, Button, Space, Typography, Divider, Steps, App as AntApp, Spin } from "antd";
import { SaveOutlined, LoadingOutlined } from "@ant-design/icons";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import { handleErrorNotification, handleSucccessNotification } from "../../utils/Notifications";
import Strings from "../../utils/localizations/Strings";
import { CreateCardRequest} from "../../data/card/card.request";
import { useCreateCardMutation } from "../../services/cardService";
import { useGetlevelsMutation, useGetChildrenLevelsMutation } from "../../services/levelService";
import dayjs from "dayjs";
import { LevelCache } from "../../utils/levelCache";
import AnatomyNotification from "../components/AnatomyNotification";

// Import separated components
import CardTypeSelector from "./components/CardTypeSelector";
import PreclassifierSelector from "./components/PreclassifierSelector";
import PrioritySelector from "./components/PrioritySelector";
import MachineIdSearch from "./components/MachineIdSearch";
import LevelSelector from "./components/LevelSelector";
import SelectedPathDisplay from "./components/SelectedPathDisplay";
import CommentsSection from "./components/CommentsSection";

interface CreateCardModalProps {
  open: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
  onSuccess?: () => void;
}

const CreateCardModal = ({ open, onClose, siteId, siteName, onSuccess }: CreateCardModalProps) => {
  const { user } = useCurrentUser();
  const { notification } = AntApp.useApp();

  // API mutations
  const [createCard, { isLoading: isCreating }] = useCreateCardMutation();
  const [getLevels] = useGetlevelsMutation();
  const [getChildrenLevels] = useGetChildrenLevelsMutation();

  // Form state
  const [selectedCardType, setSelectedCardType] = useState<string>("");
  const [selectedPreclassifier, setSelectedPreclassifier] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");

  const [levels, setLevels] = useState<any[]>([]);
  const [levelHierarchy, setLevelHierarchy] = useState<Map<number, any[]>>(new Map());
  const [selectedLevels, setSelectedLevels] = useState<Map<number, string>>(new Map());
  const [lastLevelCompleted, setLastLevelCompleted] = useState(false);
  const [finalNodeId, setFinalNodeId] = useState<number | null>(null);

  // Pagination state for each level
  const [levelPagination, setLevelPagination] = useState<Map<number, { current: number; pageSize: number; total: number }>>(new Map());
  const [loadingLevels, setLoadingLevels] = useState<Set<number>>(new Set());
  const [loadedLevelData, setLoadedLevelData] = useState<Map<number, any[]>>(new Map());

  // Machine ID search state
  const [showMachineSearch, setShowMachineSearch] = useState(false);
  const [isLoadingInitialLevels, setIsLoadingInitialLevels] = useState<boolean>(false);
  const [showManualStructure, setShowManualStructure] = useState<boolean>(false);

  const [comments, setComments] = useState<string>("");

  // Global loading state
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Custom due date state for wildcard priority
  const [customDueDate, setCustomDueDate] = useState<dayjs.Dayjs | null>(null);

  // Referencias para scroll automático
  const preclassifierRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const customDateRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  // Track the last selected level to scroll to the next one
  const [lastSelectedLevel, setLastSelectedLevel] = useState<number | null>(null);

  // Función para scroll suave al siguiente paso
  const scrollToNextStep = (targetRef: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      if (targetRef.current) {
        targetRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 300);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // Scroll automático cuando se completa el último nivel
  useEffect(() => {
    if (lastLevelCompleted) {
      scrollToNextStep(commentsRef);
    }
  }, [lastLevelCompleted]);

  // Auto-scroll to next level after selection
  useEffect(() => {
    if (lastSelectedLevel !== null) {
      const nextLevelIndex = lastSelectedLevel + 1;

      if (levelHierarchy.has(nextLevelIndex)) {
        setTimeout(() => {
          const nextLevelElement = document.querySelector(`[data-level-index="${nextLevelIndex}"]`);
          if (nextLevelElement) {
            nextLevelElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          } else {
            setTimeout(() => {
              const retryElement = document.querySelector(`[data-level-index="${nextLevelIndex}"]`);
              if (retryElement) {
                retryElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                  inline: 'nearest'
                });
              }
            }, 200);
          }
        }, 500);
      }

      setTimeout(() => {
        setLastSelectedLevel(null);
      }, 800);
    }
  }, [lastSelectedLevel, levelHierarchy]);

  const resetForm = () => {
    setSelectedCardType("");
    setSelectedPreclassifier("");
    setSelectedPriority("");
    setLevels([]);
    setLevelHierarchy(new Map());
    setSelectedLevels(new Map());
    setLastLevelCompleted(false);
    setFinalNodeId(null);
    setComments("");
    setLastSelectedLevel(null);
    setCustomDueDate(null);
    setShowMachineSearch(false);
    setLevelPagination(new Map());
    setLoadingLevels(new Set());
    setLoadedLevelData(new Map());
    setIsLoadingInitialLevels(false);
    setShowManualStructure(false);
  };

  // Load levels with lazy loading - only load root levels initially
  const loadLevels = async (page: number = 1, pageSize: number = 10) => {
    try {
      setIsLoadingInitialLevels(true);
      setLoadingLevels(prev => new Set(prev).add(0));
      handleLoadingChange(true, Strings.loading);

      const cachedChildren = await LevelCache.getCachedChildren(parseInt(siteId), 0);
      let allRootLevels: any[] = [];

      if (cachedChildren && cachedChildren.length > 0) {
        allRootLevels = cachedChildren.filter(level => level.status !== 'S');
      } else {
        const response = await getLevels(siteId.toString()).unwrap();
        setLevels(response);

        const activeLevels = response.filter(level => level.status !== 'S');
        allRootLevels = activeLevels.filter(level => {
          const superiorId = level.superiorId?.toString();
          return !superiorId ||
                 superiorId === "" ||
                 superiorId === "0" ||
                 superiorId === null ||
                 superiorId === "null";
        });

        for (const level of allRootLevels) {
          await LevelCache.cacheLevel(parseInt(siteId), level);
        }
      }

      const sortedRootLevels = allRootLevels.sort((a, b) => {
        const nameA = (a.name || a.levelName || '').toLowerCase();
        const nameB = (b.name || b.levelName || '').toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });

      setLoadedLevelData(prev => {
        const newMap = new Map(prev);
        newMap.set(0, sortedRootLevels);
        return newMap;
      });

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLevels = sortedRootLevels.slice(startIndex, endIndex);

      const hierarchy = new Map<number, any[]>();
      if (paginatedLevels.length > 0) {
        hierarchy.set(0, paginatedLevels);
      }
      setLevelHierarchy(hierarchy);

      setLevelPagination(prev => {
        const newMap = new Map(prev);
        newMap.set(0, {
          current: page,
          pageSize: pageSize,
          total: sortedRootLevels.length
        });
        return newMap;
      });

      setLoadingLevels(prev => {
        const newSet = new Set(prev);
        newSet.delete(0);
        return newSet;
      });
    } catch (error) {
      handleErrorNotification(error);
      setLoadingLevels(prev => {
        const newSet = new Set(prev);
        newSet.delete(0);
        return newSet;
      });
    } finally {
      setIsLoadingInitialLevels(false);
      handleLoadingChange(false);
    }
  };

  // Load child levels with lazy loading and pagination
  const loadChildLevels = async (parentId: string, levelIndex: number, page: number = 1, pageSize: number = 10) => {
    const parentIdNum = parseInt(parentId);
    const nextLevelIndex = levelIndex + 1;

    try {
      setLoadingLevels(prev => new Set(prev).add(nextLevelIndex));
      handleLoadingChange(true, Strings.loading);

      let allChildLevels: any[] = [];
      const cachedChildren = await LevelCache.getCachedChildren(parseInt(siteId), parentIdNum);

      if (cachedChildren && cachedChildren.length > 0) {
        allChildLevels = cachedChildren.filter(level => level.status !== 'S');
      } else {
        try {
          const response = await getChildrenLevels({
            siteId: siteId.toString(),
            parentId: parentIdNum
          }).unwrap();

          allChildLevels = response.filter((level: any) => level.status !== 'S');

          for (const level of allChildLevels) {
            await LevelCache.cacheLevel(parseInt(siteId), level);
          }
        } catch (_error) {
          const childLevels = levels.filter(level => {
            const superiorIdStr = level.superiorId?.toString();
            return superiorIdStr === parentId.toString() && level.status !== 'S';
          });
          allChildLevels = childLevels;
        }
      }

      const sortedChildLevels = allChildLevels.sort((a, b) => {
        const nameA = (a.name || a.levelName || '').toLowerCase();
        const nameB = (b.name || b.levelName || '').toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });

      setLoadedLevelData(prev => {
        const newMap = new Map(prev);
        newMap.set(nextLevelIndex, sortedChildLevels);
        return newMap;
      });

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedChildren = sortedChildLevels.slice(startIndex, endIndex);

      setLevelHierarchy(prev => {
        const newHierarchy = new Map(prev);

        if (sortedChildLevels.length > 0) {
          newHierarchy.set(nextLevelIndex, paginatedChildren);

          for (let i = nextLevelIndex + 1; i <= 10; i++) {
            newHierarchy.delete(i);
          }

          setLastLevelCompleted(false);
          setFinalNodeId(null);
        } else {
          for (let i = nextLevelIndex; i <= 10; i++) {
            newHierarchy.delete(i);
          }

          setLastLevelCompleted(true);
          setFinalNodeId(parentIdNum);
        }

        return newHierarchy;
      });

      setLevelPagination(prev => {
        const newMap = new Map(prev);
        newMap.set(nextLevelIndex, {
          current: page,
          pageSize: pageSize,
          total: sortedChildLevels.length
        });
        return newMap;
      });

      setLoadingLevels(prev => {
        const newSet = new Set(prev);
        newSet.delete(nextLevelIndex);
        return newSet;
      });
    } catch (error) {
      console.error("Error loading child levels:", error);
      setLoadingLevels(prev => {
        const newSet = new Set(prev);
        newSet.delete(nextLevelIndex);
        return newSet;
      });
    } finally {
      handleLoadingChange(false);
    }
  };

  // Event handlers
  const handleCardTypeChange = (value: string) => {
    setSelectedCardType(value);
    setSelectedPreclassifier("");
    setSelectedPriority("");
    setSelectedLevels(new Map());
    setLevelHierarchy(new Map());
    setLastLevelCompleted(false);
    setFinalNodeId(null);
    setLastSelectedLevel(null);

    if (value) {
      scrollToNextStep(preclassifierRef);
    }
  };

  const handlePreclassifierChange = (value: string) => {
    setSelectedPreclassifier(value);
    setSelectedPriority("");
    setSelectedLevels(new Map());
    setLevelHierarchy(new Map());
    setLastLevelCompleted(false);
    setFinalNodeId(null);
    setLastSelectedLevel(null);

    if (value) {
      scrollToNextStep(priorityRef);
    }
  };

  const handlePriorityChange = async (value: string) => {
    setSelectedPriority(value);
    setSelectedLevels(new Map());
    setLevelHierarchy(new Map());
    setLastLevelCompleted(false);
    setFinalNodeId(null);
    setLastSelectedLevel(null);
    setShowMachineSearch(false);

    if (value) {
      setShowMachineSearch(true);
      await loadLevels();
      setTimeout(() => {
        scrollToNextStep(levelRef);
      }, 400);
    }
  };

  const handleCustomDueDateChange = (date: dayjs.Dayjs | null) => {
    setCustomDueDate(date);

    if (date && levelHierarchy.size === 0) {
      setShowMachineSearch(true);
      loadLevels();
      scrollToNextStep(levelRef);
    }
  };

  // Global loading handler
  const handleLoadingChange = (isLoading: boolean, message?: string) => {
    setIsGlobalLoading(isLoading);
    setLoadingMessage(message || (isLoading ? Strings.loading : ""));
  };

  const handleMachineIdSearchSuccess = (
    hierarchy: Map<number, any[]>,
    selectedLevelsMap: Map<number, string>,
    pagination: Map<number, { current: number; pageSize: number; total: number }>,
    loadedData: Map<number, any[]>,
    finalNode: number | null,
    isComplete: boolean
  ) => {
    console.log("[CreateCardModal] Machine ID search success - selectedLevelsMap:", selectedLevelsMap);
    console.log("[CreateCardModal] hierarchy:", hierarchy);
    console.log("[CreateCardModal] pagination:", pagination);

    // First, hide the structure to force unmount
    setShowManualStructure(false);

    // Then update all states
    setLoadedLevelData(new Map(loadedData));
    setLevelPagination(new Map(pagination));
    setSelectedLevels(new Map(selectedLevelsMap));
    setFinalNodeId(finalNode);
    setLastLevelCompleted(isComplete);
    setLevelHierarchy(new Map(hierarchy));

    // Finally, show structure again with all updated states
    setTimeout(() => {
      setShowManualStructure(true);
    }, 50);
  };

  const handleScrollToLevel = (levelIndex: number) => {
    setTimeout(() => {
      const targetLevelElement = document.querySelector(`[data-level-index="${levelIndex}"]`);
      if (targetLevelElement) {
        targetLevelElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleLevelChange = async (levelIndex: number, value: string) => {
    setSelectedLevels(prev => {
      const newSelected = new Map(prev);
      newSelected.set(levelIndex, value);

      for (let i = levelIndex + 1; i <= 10; i++) {
        newSelected.delete(i);
      }

      return newSelected;
    });

    setLevelPagination(prev => {
      const newMap = new Map(prev);
      for (let i = levelIndex + 1; i <= 10; i++) {
        newMap.delete(i);
      }
      return newMap;
    });

    setLoadedLevelData(prev => {
      const newMap = new Map(prev);
      for (let i = levelIndex + 1; i <= 10; i++) {
        newMap.delete(i);
      }
      return newMap;
    });

    setLastLevelCompleted(false);
    setFinalNodeId(null);

    if (value) {
      await loadChildLevels(value, levelIndex);

      setTimeout(() => {
        setLastSelectedLevel(levelIndex);
      }, 100);
    } else {
      setLevelHierarchy(prev => {
        const newHierarchy = new Map(prev);
        for (let i = levelIndex + 1; i <= 10; i++) {
          newHierarchy.delete(i);
        }
        return newHierarchy;
      });
    }
  };

  const handleLevelPaginationChange = async (levelIndex: number, page: number, pageSize: number) => {
    const allData = loadedLevelData.get(levelIndex);
    if (!allData) return;

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = allData.slice(startIndex, endIndex);

    setLevelHierarchy(prev => {
      const newHierarchy = new Map(prev);
      newHierarchy.set(levelIndex, paginatedData);
      return newHierarchy;
    });

    setLevelPagination(prev => {
      const newMap = new Map(prev);
      newMap.set(levelIndex, {
        current: page,
        pageSize: pageSize,
        total: allData.length
      });
      return newMap;
    });
  };

  const handleSave = async () => {
    if (!selectedCardType || !selectedPreclassifier || !user || !user.userId) {
      console.error("[CreateCardModal] Missing required fields:", {
        selectedCardType,
        selectedPreclassifier,
        userId: user?.userId
      });
      handleErrorNotification(Strings.requiredInfo);
      return;
    }

    if (!siteId || siteId === "0" || siteId === "") {
      console.error("[CreateCardModal] Invalid siteId:", siteId);
      AnatomyNotification.error(notification, "Invalid site");
      return;
    }

    if (!finalNodeId || finalNodeId === 0) {
      console.error("[CreateCardModal] Invalid or missing finalNodeId:", finalNodeId);
      AnatomyNotification.error(notification, "Please select a complete location path");
      return;
    }

    const generateTempUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const cardData: CreateCardRequest = {
      siteId: parseInt(siteId),
      cardUUID: generateTempUUID(),
      cardCreationDate: new Date().toISOString(),
      cardTypeId: parseInt(selectedCardType),
      preclassifierId: parseInt(selectedPreclassifier),
      creatorId: parseInt(user.userId.toString()),
      nodeId: finalNodeId,
      priorityId: selectedPriority ? parseInt(selectedPriority) : null,
      cardTypeValue: '',
      comments: comments || null,
      evidences: [],
      appSo: 'web',
      appVersion: '1.0.0',
      customDueDate: customDueDate ? customDueDate.format('YYYY-MM-DD') : null
    };

    if (isNaN(cardData.siteId) || isNaN(cardData.cardTypeId) || isNaN(cardData.preclassifierId) || isNaN(cardData.creatorId)) {
      console.error("[CreateCardModal] Invalid parsed IDs:", {
        siteId: cardData.siteId,
        cardTypeId: cardData.cardTypeId,
        preclassifierId: cardData.preclassifierId,
        creatorId: cardData.creatorId
      });
      AnatomyNotification.error(notification, "Invalid data format. Please try again.");
      return;
    }

    try {
      await createCard(cardData).unwrap();
      console.log("[CreateCardModal] Card created successfully");
      handleSucccessNotification(Strings.successfullyRegistered);
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("[CreateCardModal] Error creating card:", error);
      handleErrorNotification(error);
    }
  };

  const getCurrentStep = () => {
    if (!selectedCardType) return 0;
    if (!selectedPreclassifier) return 1;
    if (!selectedPriority) return 2;
    if (!lastLevelCompleted) return 3;
    return 4;
  };

  const steps = [
    { title: Strings.cardTypeLabel },
    { title: Strings.problemTypeLabel },
    { title: Strings.priorityLabel },
    { title: Strings.locationLabel },
    { title: Strings.anomalyDetected },
  ];

  // Check if custom date is required
  const showCustomDate = selectedPriority && customDueDate !== null;

  return (
    <Modal
      title={
        <Space>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {Strings.createCard} - {siteName}
          </Typography.Title>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' }
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {Strings.cancel}
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isCreating}
          disabled={
            !selectedCardType ||
            !selectedPreclassifier ||
            !lastLevelCompleted ||
            (!!showCustomDate && !customDueDate)
          }
        >
          {Strings.save}
        </Button>,
      ]}
      destroyOnClose
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Progress Steps */}
        <Steps
          current={getCurrentStep()}
          size="small"
          items={steps}
          style={{ marginBottom: '24px' }}
        />

        {/* Card Type Selection */}
        <CardTypeSelector
          siteId={siteId}
          selectedCardType={selectedCardType}
          onCardTypeChange={handleCardTypeChange}
          open={open}
          onLoadingChange={(loading) => handleLoadingChange(loading, loading ? Strings.loadingtagTypes : "")}
        />

        {/* Preclassifier Selection */}
        {selectedCardType && (
          <PreclassifierSelector
            ref={preclassifierRef}
            cardTypeId={selectedCardType}
            selectedPreclassifier={selectedPreclassifier}
            onPreclassifierChange={handlePreclassifierChange}
            onLoadingChange={(loading) => handleLoadingChange(loading, loading ? Strings.loading : "")}
          />
        )}

        {/* Priority Selection */}
        {selectedPreclassifier && (
          <PrioritySelector
            ref={priorityRef}
            siteId={siteId}
            selectedPriority={selectedPriority}
            onPriorityChange={handlePriorityChange}
            customDueDate={customDueDate}
            onCustomDueDateChange={handleCustomDueDateChange}
            customDateRef={customDateRef}
            onLoadingChange={(loading) => handleLoadingChange(loading, loading ? Strings.loadingpriorities : "")}
          />
        )}

        {/* Machine ID Search and Levels */}
        {selectedPriority && showMachineSearch && (!showCustomDate || customDueDate) && (
          <div ref={levelRef} style={{ marginTop: '16px' }}>
            <Divider style={{ margin: '24px 0' }} />
            <Typography.Text strong style={{ fontSize: '18px', display: 'block', marginBottom: '16px' }}>
              {Strings.locationLabel}
            </Typography.Text>

            {/* Machine ID Search */}
            <MachineIdSearch
              siteId={siteId}
              levels={levels}
              onSearchSuccess={handleMachineIdSearchSuccess}
              onScrollToLevel={handleScrollToLevel}
              onLoadingChange={(loading) => handleLoadingChange(loading, loading ? Strings.loading : "")}
            />

            {/* Button to show/hide manual structure */}
            <Button
              type="primary"
              onClick={() => {
                setShowManualStructure(!showManualStructure);
                if (!showManualStructure) {
                  setTimeout(() => {
                    const firstLevelElement = document.querySelector('[data-level-index="0"]');
                    if (firstLevelElement) {
                      firstLevelElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                      });
                    }
                  }, 300);
                }
              }}
              style={{
                marginTop: '12px',
                marginBottom: '24px',
                backgroundColor: '#1890ff',
                borderColor: '#1890ff'
              }}
            >
              {showManualStructure ? Strings.hideStructure || "Ocultar estructura" : Strings.showStructure || "Ver estructura"}
            </Button>

            {/* Show selected path */}
            {lastLevelCompleted && selectedLevels.size > 0 && (
              <SelectedPathDisplay
                levelHierarchy={levelHierarchy}
                selectedLevels={selectedLevels}
              />
            )}

            {/* Loading state for initial levels */}
            {isLoadingInitialLevels && levelHierarchy.size === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <Typography.Text style={{ fontSize: '16px', color: '#666' }}>
                  {Strings.loading}
                </Typography.Text>
              </div>
            )}

            {/* Manual Level Selection */}
            {!isLoadingInitialLevels && levelHierarchy.size > 0 && showManualStructure && (
              <>
                <Typography.Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
                  {selectedLevels.size > 0
                    ? (Strings.modifySelection || "Modify selection if needed:")
                    : (Strings.orSelectManually || "Or select location manually:")
                  }
                </Typography.Text>
                <div>
                  {Array.from(levelHierarchy.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([levelIndex, levelOptions]) => (
                      <LevelSelector
                        key={levelIndex}
                        levelIndex={levelIndex}
                        levelOptions={levelOptions}
                        selectedLevelId={selectedLevels.get(levelIndex)}
                        onLevelChange={handleLevelChange}
                        pagination={levelPagination.get(levelIndex)}
                        onPaginationChange={(page, pageSize) => handleLevelPaginationChange(levelIndex, page, pageSize)}
                        isLoading={loadingLevels.has(levelIndex)}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Comments */}
        {lastLevelCompleted && (
          <>
            <Divider />
            <CommentsSection
              ref={commentsRef}
              comments={comments}
              onCommentsChange={setComments}
            />
          </>
        )}
      </Space>

      {/* Global Loading Overlay */}
      {isGlobalLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            gap: '16px'
          }}
        >
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />}
            size="large"
          />
          {loadingMessage && (
            <Typography.Text
              style={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 500,
                textAlign: 'center',
                maxWidth: '300px'
              }}
            >
              {loadingMessage}
            </Typography.Text>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CreateCardModal;
