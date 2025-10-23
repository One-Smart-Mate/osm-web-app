import { useEffect, useState, useRef } from "react";
import { Modal, Button, Input, Space, Typography, Divider, Steps, Card, DatePicker, Pagination, Spin, App as AntApp } from "antd";
import { SaveOutlined, CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import { handleErrorNotification, handleSucccessNotification } from "../../utils/Notifications";
import Strings from "../../utils/localizations/Strings";
import { CreateCardRequest} from "../../data/card/card.request";
import { useCreateCardMutation } from "../../services/cardService";
import { useGetCardTypesMutation } from "../../services/CardTypesService";
import { useGetPreclassifiersMutation } from "../../services/preclassifierService";
import { useGetActiveSitePrioritiesMutation } from "../../services/priorityService";
import { useGetlevelsMutation, useFindLevelByMachineIdMutation, useGetChildrenLevelsMutation } from "../../services/levelService";
import Constants from "../../utils/Constants";
import dayjs from "dayjs";
import { LevelCache } from "../../utils/levelCache";
import AnatomyNotification from "../components/AnatomyNotification";  

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
  const [getCardTypes, { isLoading: isLoadingCardTypes }] = useGetCardTypesMutation();
  const [getPreclassifiers, { isLoading: isLoadingPreclassifiers }] = useGetPreclassifiersMutation();
  const [getPriorities, { isLoading: isLoadingPriorities }] = useGetActiveSitePrioritiesMutation();
  const [getLevels, ] = useGetlevelsMutation();
  const [findLevelByMachineId, { isLoading: isSearchingMachine }] = useFindLevelByMachineIdMutation();
  const [getChildrenLevels] = useGetChildrenLevelsMutation();

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

  // Pagination state for each level
  const [levelPagination, setLevelPagination] = useState<Map<number, { current: number; pageSize: number; total: number }>>(new Map());
  const [loadingLevels, setLoadingLevels] = useState<Set<number>>(new Set());
  const [loadedLevelData, setLoadedLevelData] = useState<Map<number, any[]>>(new Map());

  // Machine ID search state
  const [showMachineSearch, setShowMachineSearch] = useState(false);
  const [machineIdSearch, setMachineIdSearch] = useState<string>("");
  const [machineSearchError, setMachineSearchError] = useState<string>("");
  const [machineSearchSuccess, setMachineSearchSuccess] = useState<boolean>(false);
  const [isProcessingLevels, setIsProcessingLevels] = useState<boolean>(false);
  const [isLoadingInitialLevels, setIsLoadingInitialLevels] = useState<boolean>(false);
  const [showManualStructure, setShowManualStructure] = useState<boolean>(false);

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
        // Wait longer for the DOM to fully update with the new level
        setTimeout(() => {
          const nextLevelElement = document.querySelector(`[data-level-index="${nextLevelIndex}"]`);
          if (nextLevelElement) {
            nextLevelElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          } else {
            // If element not found, try again after a bit more time
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
        }, 500); // Increased timeout to ensure DOM is ready
      }

      // Reset the tracking after scroll attempt
      setTimeout(() => {
        setLastSelectedLevel(null);
      }, 800);
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
    setIsProcessingLevels(false);
    setLevelPagination(new Map());
    setLoadingLevels(new Set());
    setLoadedLevelData(new Map());
    setIsLoadingInitialLevels(false);
    setShowManualStructure(false);
  };

  const loadCardTypes = async () => {
    try {
      const response = await getCardTypes(siteId.toString()).unwrap();

      // Filter card types that have at least one preclassifier
      const cardTypesWithPreclassifiers = await Promise.all(
        response.map(async (cardType: any) => {
          try {
            const preclassifiersResponse = await getPreclassifiers(cardType.id.toString()).unwrap();
            // Only include card types that have preclassifiers
            return preclassifiersResponse && preclassifiersResponse.length > 0 ? cardType : null;
          } catch (_error) {
            // If there's an error fetching preclassifiers, exclude this card type
            return null;
          }
        })
      );

      // Filter out null values (card types without preclassifiers)
      const filteredCardTypes = cardTypesWithPreclassifiers.filter(cardType => cardType !== null);

      setCardTypes(filteredCardTypes);
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

  // Load levels with lazy loading - only load root levels initially
  const loadLevels = async (page: number = 1, pageSize: number = 10) => {
    try {
      setIsLoadingInitialLevels(true);
      setLoadingLevels(prev => new Set(prev).add(0));

      // Check cache first
      const cachedChildren = await LevelCache.getCachedChildren(parseInt(siteId), 0);
      let allRootLevels: any[] = [];

      if (cachedChildren && cachedChildren.length > 0) {
        allRootLevels = cachedChildren.filter(level => level.status !== 'S');
      } else {
        // Load from server
        const response = await getLevels({ siteId: siteId.toString() }).unwrap();
        setLevels(response);

        // Filter out suspended levels and find root levels
        const activeLevels = response.filter(level => level.status !== 'S');
        allRootLevels = activeLevels.filter(level => {
          const superiorId = level.superiorId?.toString();
          return !superiorId ||
                 superiorId === "" ||
                 superiorId === "0" ||
                 superiorId === null ||
                 superiorId === "null";
        });

        // Cache root levels
        for (const level of allRootLevels) {
          await LevelCache.cacheLevel(parseInt(siteId), level);
        }
      }

      // Sort levels alphabetically/alphanumerically by name
      const sortedRootLevels = allRootLevels.sort((a, b) => {
        const nameA = (a.name || a.levelName || '').toLowerCase();
        const nameB = (b.name || b.levelName || '').toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });

      // Store all loaded data for this level (sorted)
      setLoadedLevelData(prev => {
        const newMap = new Map(prev);
        newMap.set(0, sortedRootLevels);
        return newMap;
      });

      // Calculate pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLevels = sortedRootLevels.slice(startIndex, endIndex);

      // Update hierarchy with paginated data
      const hierarchy = new Map<number, any[]>();
      if (paginatedLevels.length > 0) {
        hierarchy.set(0, paginatedLevels);
      }
      setLevelHierarchy(hierarchy);

      // Update pagination state
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
    }
  };

  // Load child levels with lazy loading and pagination
  const loadChildLevels = async (parentId: string, levelIndex: number, page: number = 1, pageSize: number = 10) => {
    const parentIdNum = parseInt(parentId);
    const nextLevelIndex = levelIndex + 1;

    try {
      setLoadingLevels(prev => new Set(prev).add(nextLevelIndex));

      let allChildLevels: any[] = [];

      // Check cache first
      const cachedChildren = await LevelCache.getCachedChildren(parseInt(siteId), parentIdNum);

      if (cachedChildren && cachedChildren.length > 0) {
        allChildLevels = cachedChildren.filter(level => level.status !== 'S');
      } else {
        // Load from API using getChildrenLevels mutation
        try {
          const response = await getChildrenLevels({
            siteId: siteId.toString(),
            parentId: parentIdNum
          }).unwrap();

          allChildLevels = response.filter((level: any) => level.status !== 'S');

          // Cache the children
          for (const level of allChildLevels) {
            await LevelCache.cacheLevel(parseInt(siteId), level);
          }
        } catch (_error) {
          // If API fails, fallback to filtering from all levels
          const childLevels = levels.filter(level => {
            const superiorIdStr = level.superiorId?.toString();
            return superiorIdStr === parentId.toString() && level.status !== 'S';
          });
          allChildLevels = childLevels;
        }
      }

      // Sort levels alphabetically/alphanumerically by name
      const sortedChildLevels = allChildLevels.sort((a, b) => {
        const nameA = (a.name || a.levelName || '').toLowerCase();
        const nameB = (b.name || b.levelName || '').toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });

      // Store all loaded data for this level (sorted)
      setLoadedLevelData(prev => {
        const newMap = new Map(prev);
        newMap.set(nextLevelIndex, sortedChildLevels);
        return newMap;
      });

      // Calculate pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedChildren = sortedChildLevels.slice(startIndex, endIndex);

      setLevelHierarchy(prev => {
        const newHierarchy = new Map(prev);

        if (sortedChildLevels.length > 0) {
          // Add the next level with paginated data
          newHierarchy.set(nextLevelIndex, paginatedChildren);

          // Clear levels beyond the next one
          for (let i = nextLevelIndex + 1; i <= 10; i++) {
            newHierarchy.delete(i);
          }

          setLastLevelCompleted(false);
          setFinalNodeId(null);
        } else {
          // No more children, this is the final level
          // Clear any levels beyond current level
          for (let i = nextLevelIndex; i <= 10; i++) {
            newHierarchy.delete(i);
          }

          setLastLevelCompleted(true);
          setFinalNodeId(parentIdNum);
        }

        return newHierarchy;
      });

      // Update pagination state
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

  const handlePriorityChange = async (value: string) => {
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
    setIsProcessingLevels(false);

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
        await loadLevels();
        // Wait for DOM to update before scrolling
        setTimeout(() => {
          scrollToNextStep(levelRef);
        }, 400);
      }
    }
  };

  const handleMachineIdSearch = async () => {
    if (!machineIdSearch.trim()) {
      setMachineSearchError(Strings.requiredMachineId || "Machine ID is required");
      return;
    }

    setMachineSearchError("");
    setMachineSearchSuccess(false);

    try {
      // Show loading state but don't scroll or animate yet
      const result = await findLevelByMachineId({
        siteId: siteId.toString(),
        machineId: machineIdSearch.trim()
      }).unwrap();

      if (result && result.hierarchy) {
        // Start processing levels
        setIsProcessingLevels(true);

        // Process the hierarchy with pagination
        const newHierarchy = new Map<number, any[]>();
        const newSelectedLevels = new Map<number, string>();
        const newPagination = new Map<number, { current: number; pageSize: number; total: number }>();
        const newLoadedData = new Map<number, any[]>();
        const PAGE_SIZE = 10;

        // For each level in the hierarchy, we need to load its siblings using lazy loading
        for (let i = 0; i < result.hierarchy.length; i++) {
          const currentLevel = result.hierarchy[i];
          let allLevelsForIndex: any[] = [];

          if (i === 0) {
            // For root level, load from cache or server
            const cachedChildren = await LevelCache.getCachedChildren(parseInt(siteId), 0);
            if (cachedChildren && cachedChildren.length > 0) {
              allLevelsForIndex = cachedChildren.filter(level => level.status !== 'S');
            } else if (levels.length > 0) {
              // Fallback to filtering from already loaded levels
              allLevelsForIndex = levels.filter(level => {
                const superiorId = level.superiorId?.toString();
                return (
                  level.status !== 'S' &&
                  (!superiorId ||
                   superiorId === "" ||
                   superiorId === "0" ||
                   superiorId === null ||
                   superiorId === "null")
                );
              });
            }
          } else {
            // For other levels, load children from cache or API
            const parentId = parseInt(result.hierarchy[i - 1].id.toString());
            const cachedChildren = await LevelCache.getCachedChildren(parseInt(siteId), parentId);

            if (cachedChildren && cachedChildren.length > 0) {
              allLevelsForIndex = cachedChildren.filter(level => level.status !== 'S');
            } else {
              // Load from API
              try {
                const response = await getChildrenLevels({
                  siteId: siteId.toString(),
                  parentId: parentId
                }).unwrap();

                allLevelsForIndex = response.filter((level: any) => level.status !== 'S');

                // Cache the results
                for (const level of allLevelsForIndex) {
                  await LevelCache.cacheLevel(parseInt(siteId), level);
                }
              } catch (_error) {
                // Fallback to filtering from all levels
                const parentIdStr = parentId.toString();
                allLevelsForIndex = levels.filter(level => {
                  const superiorIdStr = level.superiorId?.toString();
                  return superiorIdStr === parentIdStr && level.status !== 'S';
                });
              }
            }
          }

          // Sort levels alphabetically/alphanumerically by name
          const sortedLevels = allLevelsForIndex.sort((a, b) => {
            const nameA = (a.name || a.levelName || '').toLowerCase();
            const nameB = (b.name || b.levelName || '').toLowerCase();
            return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
          });

          // Store all loaded data (sorted)
          newLoadedData.set(i, sortedLevels);

          // Find the index of the current level in the sorted array
          const foundLevelIndex = sortedLevels.findIndex(level => level.id.toString() === currentLevel.id.toString());

          // Calculate which page the found level is on
          let currentPage = 1;
          if (foundLevelIndex !== -1) {
            currentPage = Math.floor(foundLevelIndex / PAGE_SIZE) + 1;
          }

          // Calculate paginated data for the page where the level is
          const startIndex = (currentPage - 1) * PAGE_SIZE;
          const paginatedData = sortedLevels.slice(startIndex, startIndex + PAGE_SIZE);
          newHierarchy.set(i, paginatedData);

          // Store pagination info with the correct current page
          newPagination.set(i, {
            current: currentPage,
            pageSize: PAGE_SIZE,
            total: allLevelsForIndex.length
          });

          // Pre-select the level from the found path
          newSelectedLevels.set(i, currentLevel.id.toString());
        }

        // Get the last level found
        const lastLevel = result.hierarchy[result.hierarchy.length - 1];
        const lastLevelId = parseInt(lastLevel.id.toString());
        const lastLevelIndex = result.hierarchy.length;

        // Load children of the last level found
        let childrenOfLastLevel: any[] = [];
        const cachedChildrenOfLast = await LevelCache.getCachedChildren(parseInt(siteId), lastLevelId);

        if (cachedChildrenOfLast && cachedChildrenOfLast.length > 0) {
          childrenOfLastLevel = cachedChildrenOfLast.filter(level => level.status !== 'S');
        } else {
          try {
            const response = await getChildrenLevels({
              siteId: siteId.toString(),
              parentId: lastLevelId
            }).unwrap();

            childrenOfLastLevel = response.filter((level: any) => level.status !== 'S');

            // Cache the results
            for (const level of childrenOfLastLevel) {
              await LevelCache.cacheLevel(parseInt(siteId), level);
            }
          } catch (_error) {
            // Fallback to filtering from all levels
            childrenOfLastLevel = levels.filter(level => {
              const superiorIdStr = level.superiorId?.toString();
              return superiorIdStr === lastLevelId.toString() && level.status !== 'S';
            });
          }
        }

        if (childrenOfLastLevel.length > 0) {
          // Sort children alphabetically/alphanumerically
          const sortedChildren = childrenOfLastLevel.sort((a, b) => {
            const nameA = (a.name || a.levelName || '').toLowerCase();
            const nameB = (b.name || b.levelName || '').toLowerCase();
            return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
          });

          // Store all loaded data for children (sorted)
          newLoadedData.set(lastLevelIndex, sortedChildren);

          // Add paginated children to hierarchy (first page)
          const paginatedChildren = sortedChildren.slice(0, PAGE_SIZE);
          newHierarchy.set(lastLevelIndex, paginatedChildren);

          // Store pagination info
          newPagination.set(lastLevelIndex, {
            current: 1,
            pageSize: PAGE_SIZE,
            total: sortedChildren.length
          });

          setLastLevelCompleted(false);
          setFinalNodeId(null);
        } else {
          // No children, this is the final level
          setFinalNodeId(lastLevelId);
          setLastLevelCompleted(true);
        }

        // Update all state at once
        setLoadedLevelData(newLoadedData);
        setLevelPagination(newPagination);
        setLevelHierarchy(newHierarchy);
        setSelectedLevels(newSelectedLevels);
        setMachineIdSearch("");
        setMachineSearchError("");

        // Show manual structure when search is successful
        setShowManualStructure(true);

        // Wait for the DOM to update before showing success and scrolling
        requestAnimationFrame(() => {
          setIsProcessingLevels(false);
          setMachineSearchSuccess(true);

          // Use requestAnimationFrame to ensure DOM is ready before scrolling
          requestAnimationFrame(() => {
            let targetLevelIndex;

            if (childrenOfLastLevel.length > 0) {
              // If there are children, scroll to the children level
              targetLevelIndex = result.hierarchy.length;
            } else {
              // If no children, scroll to the last level in hierarchy
              targetLevelIndex = result.hierarchy.length - 1;
            }

            const targetLevelElement = document.querySelector(`[data-level-index="${targetLevelIndex}"]`);
            if (targetLevelElement) {
              // Smooth scroll with less aggressive timing
              targetLevelElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });

              // Add a subtle highlight effect
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
            } else if (result.hierarchy.length > 0) {
              // Fallback to scrolling to the first level if target not found
              const levelsSection = document.querySelector('[data-level-index="0"]');
              if (levelsSection) {
                levelsSection.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                  inline: 'nearest'
                });
              }
            }
          });
        });

        // Clear success message after 5 seconds
        setTimeout(() => {
          setMachineSearchSuccess(false);
        }, 5000);
      }
    } catch (error: any) {
      setIsProcessingLevels(false);
      setMachineSearchError(
        error?.data?.message ||
        Strings.machineIdNotFound ||
        "Machine ID not found"
      );
    }
  };

  const handleLevelChange = async (levelIndex: number, value: string) => {
    setSelectedLevels(prev => {
      const newSelected = new Map(prev);
      newSelected.set(levelIndex, value);

      // Clear selections beyond this level
      for (let i = levelIndex + 1; i <= 10; i++) {
        newSelected.delete(i);
      }

      return newSelected;
    });

    // Clear pagination for levels beyond current
    setLevelPagination(prev => {
      const newMap = new Map(prev);
      for (let i = levelIndex + 1; i <= 10; i++) {
        newMap.delete(i);
      }
      return newMap;
    });

    // Clear loaded data for levels beyond current
    setLoadedLevelData(prev => {
      const newMap = new Map(prev);
      for (let i = levelIndex + 1; i <= 10; i++) {
        newMap.delete(i);
      }
      return newMap;
    });

    // Reset completion state
    setLastLevelCompleted(false);
    setFinalNodeId(null);

    if (value) {
      // Load child levels - this will handle the hierarchy update
      await loadChildLevels(value, levelIndex);

      // Set the selected level for scroll tracking AFTER loading is complete
      // Use a small delay to ensure state updates have propagated
      setTimeout(() => {
        setLastSelectedLevel(levelIndex);
      }, 100);
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

  // Handle pagination change for a specific level
  const handleLevelPaginationChange = async (levelIndex: number, page: number, pageSize: number) => {
    const allData = loadedLevelData.get(levelIndex);
    if (!allData) return;

    // Calculate new pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = allData.slice(startIndex, endIndex);

    // Update hierarchy with new page data
    setLevelHierarchy(prev => {
      const newHierarchy = new Map(prev);
      newHierarchy.set(levelIndex, paginatedData);
      return newHierarchy;
    });

    // Update pagination state
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
    // Validate required fields
    if (!selectedCardType || !selectedPreclassifier || !user || !user.userId) {
      console.error("[CreateCardModal] Missing required fields:", {
        selectedCardType,
        selectedPreclassifier,
        userId: user?.userId
      });
      handleErrorNotification(Strings.requiredInfo);
      return;
    }

    // Validate siteId
    if (!siteId || siteId === "0" || siteId === "") {
      console.error("[CreateCardModal] Invalid siteId:", siteId);
      AnatomyNotification.error(notification, "Invalid site");
      return;
    }

    // Validate custom due date if wildcard priority is selected
    const selectedPriorityData = priorities.find(p => p.id.toString() === selectedPriority);
    if (selectedPriorityData && selectedPriorityData.priorityCode === Constants.PRIORITY_WILDCARD_CODE && !customDueDate) {
      console.error("[CreateCardModal] Custom due date required for wildcard priority");
      handleErrorNotification(Strings.requiredCustomDate);
      return;
    }

    // Double-check the selected preclassifier ID is correct
    const selectedPreclassifierData = preclassifiers.find(p => p.id.toString() === selectedPreclassifier);
    if (!selectedPreclassifierData) {
      console.error("[CreateCardModal] Preclassifier not found:", selectedPreclassifier);
      AnatomyNotification.error(notification, "Error: Preclassifier not found");
      return;
    }

    // Validate finalNodeId
    if (!finalNodeId || finalNodeId === 0) {
      console.error("[CreateCardModal] Invalid or missing finalNodeId:", finalNodeId);
      AnatomyNotification.error(notification, "Please select a complete location path");
      return;
    }

    // Generate a simple temporary UUID
    // Backend will validate and regenerate if needed using crypto.randomUUID()
    const generateTempUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    // Build card data with validated fields
    const cardData: CreateCardRequest = {
      siteId: parseInt(siteId),
      cardUUID: generateTempUUID(), // Temporary UUID - backend will regenerate if duplicate
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

    // Validate parsed IDs
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
  }) => {
    const isLevel = item.responsibleName !== undefined;

    return (
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
          transition: 'all 0.3s ease',
          position: 'relative'
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

          {/* Show responsible name for levels */}
          {isLevel && item.responsibleName && (
            <Typography.Text
              type="secondary"
              style={{
                fontSize: '11px',
                marginTop: '4px',
                fontStyle: 'italic'
              }}
            >
              {Strings.responsible}: {item.responsibleName}
            </Typography.Text>
          )}
        </div>
      </Card>
    );
  };

  const renderLevelSelector = (levelIndex: number, levelOptions: any[]) => {
    const pagination = levelPagination.get(levelIndex);
    const isLoading = loadingLevels.has(levelIndex);

    return (
      <div key={levelIndex} data-level-index={levelIndex} style={{ marginBottom: '24px' }}>
        <Typography.Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
          {`${Strings.level} ${levelIndex + 1}`}
          {pagination && pagination.total > 0 && (
            <Typography.Text type="secondary" style={{ fontSize: '14px', marginLeft: '8px' }}>
              ({pagination.total} {pagination.total === 1 ? 'item' : 'items'})
            </Typography.Text>
          )}
        </Typography.Text>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </div>
        ) : (
          <>
            {/* Pagination for this level - Now positioned ABOVE the records */}
            {pagination && pagination.total > pagination.pageSize && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={(page, pageSize) => handleLevelPaginationChange(levelIndex, page, pageSize)}
                  showSizeChanger
                  pageSizeOptions={['10', '20', '50', '100']}
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                  size="small"
                />
              </div>
            )}

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
          </>
        )}
      </div>
    );
  };

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
            !lastLevelCompleted ||
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

        {/* Machine ID Search and Levels (when priority is selected) */}
        {selectedPriority && showMachineSearch && (!showCustomDate || customDueDate) && (
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

              {/* Button to show/hide manual structure */}
              <Button
                type="primary"
                onClick={() => {
                  setShowManualStructure(!showManualStructure);
                  // Scroll to first level when showing structure
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
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff'
                }}
              >
                {showManualStructure ? Strings.hideStructure || "Ocultar estructura" : Strings.showStructure || "Ver estructura"}
              </Button>
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
                <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                <Typography.Text style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>
                  {Strings.loading}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ marginTop: '8px', fontSize: '14px' }}>
                  {Strings.cardTypesLoadingData}
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