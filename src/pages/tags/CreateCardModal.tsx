import { useEffect, useState, useRef } from "react";
import { Modal, Button, Input, Space, Typography, Divider, Steps, Card, DatePicker } from "antd";
import { SaveOutlined, CheckOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from 'uuid';
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import { handleErrorNotification, handleSucccessNotification } from "../../utils/Notifications";
import Strings from "../../utils/localizations/Strings";
import { CreateCardRequest} from "../../data/card/card.request";
import { useCreateCardMutation } from "../../services/cardService";
import { useGetCardTypesMutation } from "../../services/CardTypesService";
import { useGetPreclassifiersMutation } from "../../services/preclassifierService";
import { useGetActiveSitePrioritiesMutation } from "../../services/priorityService";
import { useGetlevelsMutation, useFindLevelByMachineIdMutation } from "../../services/levelService";
import Constants from "../../utils/Constants";
import dayjs from "dayjs";

interface CreateCardModalProps {
  open: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
  onSuccess?: () => void;
}

const CreateCardModal = ({ open, onClose, siteId, siteName, onSuccess }: CreateCardModalProps) => {
  const { user } = useCurrentUser();
  
  // API mutations
  const [createCard, { isLoading: isCreating }] = useCreateCardMutation();
  const [getCardTypes, { isLoading: isLoadingCardTypes }] = useGetCardTypesMutation();
  const [getPreclassifiers, { isLoading: isLoadingPreclassifiers }] = useGetPreclassifiersMutation();
  const [getPriorities, { isLoading: isLoadingPriorities }] = useGetActiveSitePrioritiesMutation();
  const [getLevels, ] = useGetlevelsMutation();
  const [findLevelByMachineId, { isLoading: isSearchingMachine }] = useFindLevelByMachineIdMutation();

  // Form state
  const [cardTypes, setCardTypes] = useState<any[]>([]);
  const [selectedCardType, setSelectedCardType] = useState<string>("");
  
  const [preclassifiers, setPreclassifiers] = useState<any[]>([]);
  const [selectedPreclassifier, setSelectedPreclassifier] = useState<string>("");
  
  const [priorities, setPriorities] = useState<any[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  
  const [levels, setLevels] = useState<any[]>([]);
  const [levelHierarchy, setLevelHierarchy] = useState<Map<number, any[]>>(new Map());
  const [selectedLevels, setSelectedLevels] = useState<Map<number, string>>(new Map());
  const [lastLevelCompleted, setLastLevelCompleted] = useState(false);
  const [finalNodeId, setFinalNodeId] = useState<number | null>(null);

  // Machine ID search state
  const [showMachineSearch, setShowMachineSearch] = useState(false);
  const [machineIdSearch, setMachineIdSearch] = useState<string>("");
  const [machineSearchError, setMachineSearchError] = useState<string>("");
  const [machineSearchSuccess, setMachineSearchSuccess] = useState<boolean>(false);

  const [comments, setComments] = useState<string>("");

  // Custom due date state for wildcard priority
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDueDate, setCustomDueDate] = useState<dayjs.Dayjs | null>(null);

  // Referencias para scroll automático
  const preclassifierRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const customDateRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

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
    }, 300); // Pequeño delay para que el contenido se renderice primero
  };

  // Load initial data
  useEffect(() => {
    if (open && siteId) {
      loadCardTypes();
    }
  }, [open, siteId]);

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

  // Track the last selected level to scroll to the next one
  const [lastSelectedLevel, setLastSelectedLevel] = useState<number | null>(null);

  useEffect(() => {
    if (lastSelectedLevel !== null) {
      const nextLevelIndex = lastSelectedLevel + 1;

      // Check if there's a next level to scroll to
      if (levelHierarchy.has(nextLevelIndex)) {
        setTimeout(() => {
          // Create a ref for the specific next level
          const nextLevelElement = document.querySelector(`[data-level-index="${nextLevelIndex}"]`);
          if (nextLevelElement) {
            nextLevelElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 300);
      }

      // Reset the tracking
      setLastSelectedLevel(null);
    }
  }, [lastSelectedLevel, levelHierarchy]);

  const resetForm = () => {
    setCardTypes([]);
    setSelectedCardType("");
    setPreclassifiers([]);
    setSelectedPreclassifier("");
    setPriorities([]);
    setSelectedPriority("");
    setLevels([]);
    setLevelHierarchy(new Map());
    setSelectedLevels(new Map());
    setLastLevelCompleted(false);
    setFinalNodeId(null);
    setComments("");
    setLastSelectedLevel(null); // Reset tracking de niveles
    setShowCustomDate(false);
    setCustomDueDate(null);
    setShowMachineSearch(false);
    setMachineIdSearch("");
    setMachineSearchError("");
    setMachineSearchSuccess(false);
  };

  const loadCardTypes = async () => {
    try {
      const response = await getCardTypes(siteId.toString()).unwrap();
      setCardTypes(response);
    } catch (error) {
      handleErrorNotification(error);
    }
  };

  const loadPreclassifiers = async (cardTypeId: string) => {
    try {
      const response = await getPreclassifiers(cardTypeId).unwrap();
      setPreclassifiers(response);
    } catch (error) {
      handleErrorNotification(error);
    }
  };

  const loadPriorities = async () => {
    try {
      const response = await getPriorities(siteId.toString()).unwrap();
      setPriorities(response);
    } catch (error) {
      handleErrorNotification(error);
    }
  };

  const loadLevels = async () => {
    try {
      const response = await getLevels(siteId.toString()).unwrap();
      setLevels(response);
      buildLevelHierarchy(response);
    } catch (error) {
      handleErrorNotification(error);
    }
  };

  const buildLevelHierarchy = (allLevels: any[]) => {
    const hierarchy = new Map<number, any[]>();
    
    // Find root levels (those without superiorId or with empty superiorId)
    const rootLevels = allLevels.filter(level => {
      const superiorId = level.superiorId?.toString();
      return !superiorId || 
             superiorId === "" || 
             superiorId === "0" ||
             superiorId === null ||
             superiorId === "null";
    });
    
    
    if (rootLevels.length > 0) {
      hierarchy.set(0, rootLevels);
    }
    
    setLevelHierarchy(hierarchy);
  };

  const loadChildLevels = (parentId: string, levelIndex: number) => {
    // Convert parentId to string for comparison since superiorId is a string
    const parentIdStr = parentId.toString();
    
    // Find child levels where superiorId matches parentId
    const childLevels = levels.filter(level => {
      const superiorIdStr = level.superiorId?.toString();
      return superiorIdStr === parentIdStr;
    });
    
    setLevelHierarchy(prev => {
      const newHierarchy = new Map(prev);
      
      if (childLevels.length > 0) {
        // Add the next level
        newHierarchy.set(levelIndex + 1, childLevels);
        
        // Clear levels beyond the next one
        for (let i = levelIndex + 2; i <= 10; i++) {
          newHierarchy.delete(i);
        }
        
        setLastLevelCompleted(false);
        setFinalNodeId(null);
      } else {
        // No more children, this is the final level
        // Clear any levels beyond current level
        for (let i = levelIndex + 1; i <= 10; i++) {
          newHierarchy.delete(i);
        }
        
        setLastLevelCompleted(true);
        setFinalNodeId(parseInt(parentId));
      }
      
      return newHierarchy;
    });
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
    setLastSelectedLevel(null); // Reset tracking

    if (value) {
      loadPreclassifiers(value);
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
    setLastSelectedLevel(null); // Reset tracking

    if (value) {
      loadPriorities();
      scrollToNextStep(priorityRef);
    }
  };

  const handlePriorityChange = (value: string) => {
    setSelectedPriority(value);
    setSelectedLevels(new Map());
    setLevelHierarchy(new Map());
    setLastLevelCompleted(false);
    setFinalNodeId(null);
    setLastSelectedLevel(null); // Reset tracking
    setShowMachineSearch(false);
    setMachineIdSearch("");
    setMachineSearchError("");
    setMachineSearchSuccess(false);

    // Check if this is the wildcard priority
    const selectedPriorityData = priorities.find(p => p.id.toString() === value);
    if (selectedPriorityData && selectedPriorityData.priorityCode === Constants.PRIORITY_WILDCARD_CODE) {
      setShowCustomDate(true);
      // Scroll to custom date field instead of levels
      scrollToNextStep(customDateRef);
    } else {
      setShowCustomDate(false);
      setCustomDueDate(null);
      // Show machine search option and load levels for regular priorities
      if (value) {
        setShowMachineSearch(true);
        loadLevels();
        scrollToNextStep(levelRef);
      }
    }
  };

  const handleMachineIdSearch = async () => {
    if (!machineIdSearch.trim()) {
      setMachineSearchError(Strings.requiredMachineId || "Machine ID is required");
      return;
    }

    setMachineSearchError("");
    try {
      const result = await findLevelByMachineId({
        siteId: siteId.toString(),
        machineId: machineIdSearch.trim()
      }).unwrap();

      if (result && result.hierarchy) {
        // First, we need to get all possible options for each level
        // We'll build the hierarchy showing the found path but also loading siblings
        const newHierarchy = new Map<number, any[]>();
        const newSelectedLevels = new Map<number, string>();

        // For each level in the hierarchy, we need to load its siblings
        for (let i = 0; i < result.hierarchy.length; i++) {
          const currentLevel = result.hierarchy[i];

          if (i === 0) {
            // For root level, get all root levels
            const rootLevels = levels.filter(level => {
              const superiorId = level.superiorId?.toString();
              return !superiorId ||
                     superiorId === "" ||
                     superiorId === "0" ||
                     superiorId === null ||
                     superiorId === "null";
            });
            newHierarchy.set(0, rootLevels);
          } else {
            // For other levels, get all siblings (same parent)
            const parentId = result.hierarchy[i - 1].id.toString();
            const siblings = levels.filter(level => {
              const superiorIdStr = level.superiorId?.toString();
              return superiorIdStr === parentId;
            });
            newHierarchy.set(i, siblings);
          }

          // Pre-select the level from the found path
          newSelectedLevels.set(i, currentLevel.id.toString());
        }

        // Set the final node
        const lastLevel = result.hierarchy[result.hierarchy.length - 1];
        setFinalNodeId(parseInt(lastLevel.id));
        setLastLevelCompleted(true);

        // Update state
        setLevelHierarchy(newHierarchy);
        setSelectedLevels(newSelectedLevels);
        setMachineIdSearch("");
        setMachineSearchSuccess(true);
        setMachineSearchError("");

        // Don't hide the search field, keep it visible
        // Scroll to the levels section
        setTimeout(() => {
          const levelsSection = document.querySelector('[data-level-index="0"]');
          if (levelsSection) {
            levelsSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 300);

        // Clear success message after 5 seconds
        setTimeout(() => {
          setMachineSearchSuccess(false);
        }, 5000);
      }
    } catch (error: any) {
      setMachineSearchError(
        error?.data?.message ||
        Strings.machineIdNotFound ||
        "Machine ID not found"
      );
    }
  };

  const handleLevelChange = (levelIndex: number, value: string) => {
    setSelectedLevels(prev => {
      const newSelected = new Map(prev);
      newSelected.set(levelIndex, value);

      // Clear selections beyond this level
      for (let i = levelIndex + 1; i <= 10; i++) {
        newSelected.delete(i);
      }

      return newSelected;
    });

    // Reset completion state
    setLastLevelCompleted(false);
    setFinalNodeId(null);

    if (value) {
      // Set the selected level for scroll tracking
      setLastSelectedLevel(levelIndex);
      // Load child levels - this will handle the hierarchy update
      loadChildLevels(value, levelIndex);
    } else {
      // Clear level hierarchy beyond current level if no value selected
      setLevelHierarchy(prev => {
        const newHierarchy = new Map(prev);
        for (let i = levelIndex + 1; i <= 10; i++) {
          newHierarchy.delete(i);
        }
        return newHierarchy;
      });
    }
  };

  const handleSave = async () => {
    if (!selectedCardType || !selectedPreclassifier || !user || !user.userId) {
      handleErrorNotification(Strings.requiredInfo);
      return;
    }

    // Validate custom due date if wildcard priority is selected
    const selectedPriorityData = priorities.find(p => p.id.toString() === selectedPriority);
    if (selectedPriorityData && selectedPriorityData.priorityCode === Constants.PRIORITY_WILDCARD_CODE && !customDueDate) {
      handleErrorNotification(Strings.requiredCustomDate);
      return;
    }

    const cardData: CreateCardRequest = {
      siteId: parseInt(siteId),
      cardUUID: uuidv4(),
      cardCreationDate: new Date().toISOString(),
      cardTypeId: parseInt(selectedCardType),
      preclassifierId: parseInt(selectedPreclassifier),
      creatorId: parseInt(user.userId.toString()),
      nodeId: finalNodeId,
      priorityId: selectedPriority ? parseInt(selectedPriority) : null,
      cardTypeValue: '',
      comments: comments || null,
      evidences: [], // No evidences for web version as specified
      appSo: 'web',
      appVersion: '1.0.0',
      customDueDate: (selectedPriorityData && selectedPriorityData.priorityCode === Constants.PRIORITY_WILDCARD_CODE && customDueDate)
        ? customDueDate.format('YYYY-MM-DD')
        : null
    };

    try {
      await createCard(cardData).unwrap();
      handleSucccessNotification(Strings.successfullyRegistered);
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      handleErrorNotification(error);
    }
  };

  const SelectableCard = ({
    item,
    isSelected,
    onClick,
    showDescription = true
  }: {
    item: any;
    isSelected: boolean;
    onClick: () => void;
    showDescription?: boolean;
  }) => (
    <Card
      hoverable
      onClick={onClick}
      style={{
        minWidth: '200px',
        maxWidth: '250px',
        marginRight: '12px',
        marginBottom: '12px',
        border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
        backgroundColor: isSelected ? '#f0f8ff' : '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        minHeight: showDescription ? '80px' : '40px'
      }}>
        {isSelected && (
          <CheckOutlined
            style={{
              color: '#1890ff',
              fontSize: '16px',
              marginBottom: '8px',
              alignSelf: 'flex-end'
            }}
          />
        )}
        <Typography.Text
          strong
          style={{
            fontSize: '14px',
            marginBottom: showDescription ? '4px' : '0',
            color: isSelected ? '#1890ff' : '#333'
          }}
        >
          {item.name || item.priorityCode || item.preclassifierCode}
        </Typography.Text>
        {showDescription && (item.description || item.priorityDescription || item.preclassifierDescription) && (
          <Typography.Text
            style={{
              fontSize: '12px',
              color: '#666',
              lineHeight: '1.3'
            }}
          >
            {item.description || item.priorityDescription || item.preclassifierDescription || item.methodology}
          </Typography.Text>
        )}
      </div>
    </Card>
  );

  const renderLevelSelector = (levelIndex: number, levelOptions: any[]) => (
    <div key={levelIndex} data-level-index={levelIndex} style={{ marginBottom: '24px' }}>
      <Typography.Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
        {`${Strings.level} ${levelIndex + 1}`}
      </Typography.Text>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {levelOptions.map(level => (
          <SelectableCard
            key={level.id}
            item={level}
            isSelected={selectedLevels.get(levelIndex) === level.id.toString()}
            onClick={() => handleLevelChange(levelIndex, level.id.toString())}
          />
        ))}
      </div>
    </div>
  );

  // Calculate current step for progress indicator
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
            (showCustomDate && !customDueDate)
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
        <div>
          <Typography.Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
            {Strings.cardTypeLabel} *
          </Typography.Text>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {isLoadingCardTypes ? (
              <Typography.Text>{Strings.loadingtagTypes}</Typography.Text>
            ) : (
              cardTypes.map(cardType => (
                <SelectableCard
                  key={cardType.id}
                  item={cardType}
                  isSelected={selectedCardType === cardType.id.toString()}
                  onClick={() => handleCardTypeChange(cardType.id.toString())}
                />
              ))
            )}
          </div>
        </div>

        {/* Preclassifier Selection */}
        {selectedCardType && (
          <div ref={preclassifierRef}>
            <Typography.Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
              {Strings.problemTypeLabel} *
            </Typography.Text>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {isLoadingPreclassifiers ? (
                <Typography.Text>{Strings.loading}</Typography.Text>
              ) : (
                preclassifiers.map(preclassifier => (
                  <SelectableCard
                    key={preclassifier.id}
                    item={preclassifier}
                    isSelected={selectedPreclassifier === preclassifier.id.toString()}
                    onClick={() => handlePreclassifierChange(preclassifier.id.toString())}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Priority Selection */}
        {selectedPreclassifier && (
          <div ref={priorityRef}>
            <Typography.Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
              {Strings.priorityLabel}
            </Typography.Text>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {isLoadingPriorities ? (
                <Typography.Text>{Strings.loadingpriorities}</Typography.Text>
              ) : (
                priorities.map(priority => (
                  <SelectableCard
                    key={priority.id}
                    item={priority}
                    isSelected={selectedPriority === priority.id.toString()}
                    onClick={() => handlePriorityChange(priority.id.toString())}
                  />
                ))
              )}
            </div>

            {/* Custom Due Date for Wildcard Priority */}
            {showCustomDate && (
              <div ref={customDateRef} style={{ marginTop: '16px' }}>
                <Typography.Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  {Strings.customDueDate} *
                </Typography.Text>
                <DatePicker
                  placeholder={Strings.selectDate}
                  style={{ width: '100%' }}
                  size="large"
                  value={customDueDate}
                  onChange={(date) => {
                    setCustomDueDate(date);
                    // If date is selected and levels aren't loaded yet, load them and show search
                    if (date && levelHierarchy.size === 0) {
                      setShowMachineSearch(true);
                      loadLevels();
                      scrollToNextStep(levelRef);
                    }
                  }}
                  disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
                />
                <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {Strings.selectCustomDueDateMessage}
                </Typography.Text>
              </div>
            )}
          </div>
        )}

        {/* Machine ID Search (when priority is selected and not custom date) */}
        {selectedPriority && !showCustomDate && showMachineSearch && (
          <div ref={levelRef} style={{ marginTop: '16px' }}>
            <Divider style={{ margin: '24px 0' }} />
            <Typography.Text strong style={{ fontSize: '18px', display: 'block', marginBottom: '16px' }}>
              {Strings.locationLabel}
            </Typography.Text>

            {/* Machine ID Search Input */}
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
                />
                <Button
                  type="primary"
                  onClick={handleMachineIdSearch}
                  loading={isSearchingMachine}
                >
                  {Strings.search || "Search"}
                </Button>
              </Space.Compact>
              {machineSearchError && (
                <Typography.Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {machineSearchError}
                </Typography.Text>
              )}
              {machineSearchSuccess && (
                <Typography.Text type="success" style={{ fontSize: '12px', display: 'block', marginTop: '4px', color: '#52c41a' }}>
                  {Strings.machineIdFound || "✓ Machine found! Location path has been filled. You can modify the selection below if needed."}
                </Typography.Text>
              )}
              {!machineSearchSuccess && !machineSearchError && (
                <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {Strings.machineIdHelpText || "Enter a machine ID to automatically fill the location path, or select manually below"}
                </Typography.Text>
              )}
            </div>

            {/* Show selected path after search */}
            {lastLevelCompleted && selectedLevels.size > 0 && (
              <div style={{
                marginBottom: '24px',
                padding: '12px',
                background: '#f0f8ff',
                borderRadius: '6px',
                border: '1px solid #1890ff'
              }}>
                <Typography.Text strong style={{ color: '#1890ff', display: 'block', marginBottom: '8px' }}>
                  {Strings.selectedPath || "Selected Path:"}
                </Typography.Text>
                <Typography.Text style={{ fontSize: '14px' }}>
                  {Array.from(levelHierarchy.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([levelIndex, levelOptions]) => {
                      const selectedId = selectedLevels.get(levelIndex);
                      const selectedLevel = levelOptions.find(l => l.id.toString() === selectedId);
                      return selectedLevel?.name;
                    })
                    .filter(Boolean)
                    .join(' / ')
                  }
                </Typography.Text>
              </div>
            )}

            {/* Manual Level Selection */}
            {levelHierarchy.size > 0 && (
              <>
                <Typography.Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
                  {selectedLevels.size > 0
                    ? (Strings.modifySelection || "Modify selection if needed:")
                    : (Strings.orSelectManually || "Or select location manually:")
                  }
                </Typography.Text>
                <div>
                  {Array.from(levelHierarchy.entries())
                    .sort(([a], [b]) => a - b) // Sort by level index to ensure correct order
                    .map(([levelIndex, levelOptions]) =>
                      renderLevelSelector(levelIndex, levelOptions)
                    )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Comments */}
        {lastLevelCompleted && (
          <>
            <Divider />
            <div ref={commentsRef}>
              <Typography.Text strong>{Strings.anomalyDetected}</Typography.Text>
              <Input.TextArea
                rows={4}
                style={{ marginTop: '8px' }}
                placeholder={Strings.describeAnomaly}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                maxLength={500}
                showCount
              />
            </div>
          </>
        )}
      </Space>
    </Modal>
  );
};

export default CreateCardModal;