import { useEffect, useState } from "react";
import { Modal, Button, Select, Input, Space, Typography, Divider, Steps } from "antd";
import { SaveOutlined} from "@ant-design/icons";
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
    
    if (value) {
      loadPreclassifiers(value);
    }
  };

  const handlePreclassifierChange = (value: string) => {
    setSelectedPreclassifier(value);
    setSelectedPriority("");
    setSelectedLevels(new Map());
    setLevelHierarchy(new Map());
    setLastLevelCompleted(false);
    setFinalNodeId(null);
    
    if (value) {
      loadPriorities();
    }
  };

  const handlePriorityChange = (value: string) => {
    setSelectedPriority(value);
    setSelectedLevels(new Map());
    setLevelHierarchy(new Map());
    setLastLevelCompleted(false);
    setFinalNodeId(null);
    
    if (value) {
      loadLevels();
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

  const renderLevelSelector = (levelIndex: number, levelOptions: any[]) => (
    <div key={levelIndex} style={{ marginBottom: '16px' }}>
      <Typography.Text strong>{`${Strings.level} ${levelIndex + 1}`}</Typography.Text>
      <Select
        style={{ width: '100%', marginTop: '8px' }}
        placeholder={`${Strings.selectLevel} ${levelIndex + 1}`}
        value={selectedLevels.get(levelIndex) || undefined}
        onChange={(value) => handleLevelChange(levelIndex, value)}
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={levelOptions.map(level => ({
          label: `${level.name} - ${level.description || ''}`,
          value: level.id.toString()
        }))}
      />
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
          <Typography.Text strong>{Strings.cardTypeLabel} *</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: '8px' }}
            placeholder={Strings.selectCardType}
            value={selectedCardType || undefined}
            onChange={handleCardTypeChange}
            loading={isLoadingCardTypes}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={cardTypes.map(cardType => ({
              label: `${cardType.name} - ${cardType.methodology}`,
              value: cardType.id.toString()
            }))}
          />
        </div>

        {/* Preclassifier Selection */}
        {selectedCardType && (
          <div>
            <Typography.Text strong>{Strings.problemTypeLabel} *</Typography.Text>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              placeholder={Strings.selectProblemType}
              value={selectedPreclassifier || undefined}
              onChange={handlePreclassifierChange}
              loading={isLoadingPreclassifiers}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={preclassifiers.map(preclassifier => ({
                label: `${preclassifier.preclassifierCode} - ${preclassifier.preclassifierDescription}`,
                value: preclassifier.id.toString()
              }))}
            />
          </div>
        )}

        {/* Priority Selection */}
        {selectedPreclassifier && (
          <div>
            <Typography.Text strong>{Strings.priorityLabel}</Typography.Text>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              placeholder={Strings.selectPriority}
              value={selectedPriority || undefined}
              onChange={handlePriorityChange}
              loading={isLoadingPriorities}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={priorities.map(priority => ({
                label: `${priority.priorityCode} - ${priority.priorityDescription}`,
                value: priority.id.toString()
              }))}
            />
          </div>
        )}

        {/* Level Hierarchy */}
        {levelHierarchy.size > 0 && (
          <div>
            <Divider />
            <Typography.Text strong>{Strings.locationLabel}</Typography.Text>
            <div style={{ marginTop: '16px' }}>
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
            <div>
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