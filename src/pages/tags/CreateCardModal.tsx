import { useEffect, useState, useRef } from "react";
import { Modal, Button, Input, Space, Typography, Divider, Steps, Card } from "antd";
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
import { useGetlevelsMutation } from "../../services/levelService";

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
  
  const [comments, setComments] = useState<string>("");

  // Referencias para scroll automático
  const preclassifierRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
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

    if (value) {
      loadLevels();
      scrollToNextStep(levelRef);
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
      handleErrorNotification("Please fill in all required fields and ensure you are logged in");
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
    };

    try {
      await createCard(cardData).unwrap();
      handleSucccessNotification("Card created successfully!");
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
          {Strings.cancel || "Cancel"}
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isCreating}
          disabled={!selectedCardType || !selectedPreclassifier}
        >
          {Strings.save || "Save"}
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
                <Typography.Text>Cargando tipos de problema...</Typography.Text>
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
          </div>
        )}

        {/* Level Hierarchy */}
        {levelHierarchy.size > 0 && (
          <div ref={levelRef}>
            <Divider style={{ margin: '24px 0' }} />
            <Typography.Text strong style={{ fontSize: '18px', display: 'block', marginBottom: '16px' }}>
              {Strings.locationLabel}
            </Typography.Text>
            <div>
              {Array.from(levelHierarchy.entries())
                .sort(([a], [b]) => a - b) // Sort by level index to ensure correct order
                .map(([levelIndex, levelOptions]) =>
                  renderLevelSelector(levelIndex, levelOptions)
                )}
            </div>
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