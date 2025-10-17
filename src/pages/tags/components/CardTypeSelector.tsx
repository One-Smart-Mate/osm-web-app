import { Typography, App as AntApp } from "antd";
import { useEffect, useState } from "react";
import SelectableCard from "./SelectableCard";
import Strings from "../../../utils/localizations/Strings";
import { useGetCardTypesMutation } from "../../../services/CardTypesService";
import { useGetPreclassifiersMutation } from "../../../services/preclassifierService";
import AnatomyNotification from "../../components/AnatomyNotification";

interface CardTypeSelectorProps {
  siteId: string;
  selectedCardType: string;
  onCardTypeChange: (_value: string) => void;
  open: boolean;
  onLoadingChange?: (_isLoading: boolean) => void;
}

const CardTypeSelector = ({
  siteId,
  selectedCardType,
  onCardTypeChange,
  open,
  onLoadingChange
}: CardTypeSelectorProps) => {
  const { notification } = AntApp.useApp();
  const [getCardTypes, { isLoading: isLoadingCardTypes }] = useGetCardTypesMutation();
  const [getPreclassifiers] = useGetPreclassifiersMutation();
  const [cardTypes, setCardTypes] = useState<any[]>([]);

  useEffect(() => {
    if (open && siteId) {
      loadCardTypes();
    }
  }, [open, siteId]);

  const loadCardTypes = async () => {
    try {
      onLoadingChange?.(true);

      // Validate siteId
      if (!siteId || siteId === "0" || siteId === "") {
        console.error("[CardTypeSelector] Invalid siteId:", siteId);
        AnatomyNotification.error(notification, "Invalid site");
        return;
      }

      const response = await getCardTypes(siteId.toString()).unwrap();

      // Validate response
      if (!response || !Array.isArray(response)) {
        console.error("[CardTypeSelector] Invalid response format from getCardTypes:", response);
        AnatomyNotification.error(notification, "Invalid card types data received");
        return;
      }

      // Filter card types that have at least one preclassifier
      const cardTypesWithPreclassifiers = await Promise.all(
        response.map(async (cardType: any) => {
          try {
            // Validate card type object
            if (!cardType || !cardType.id) {
              console.error("[CardTypeSelector] Invalid card type object:", cardType);
              return null;
            }

            const preclassifiersResponse = await getPreclassifiers(cardType.id.toString()).unwrap();

            // Validate preclassifiers response
            if (!Array.isArray(preclassifiersResponse)) {
              console.error("[CardTypeSelector] Invalid preclassifiers format for cardType:", cardType.id, preclassifiersResponse);
              return null;
            }

            // Only include card types that have preclassifiers
            return preclassifiersResponse.length > 0 ? cardType : null;
          } catch (error) {
            console.error("[CardTypeSelector] Error fetching preclassifiers for cardType:", cardType?.id, error);
            // If there's an error fetching preclassifiers, exclude this card type
            return null;
          }
        })
      );

      // Filter out null values (card types without preclassifiers or errors)
      const filteredCardTypes = cardTypesWithPreclassifiers.filter(cardType => cardType !== null);

      if (filteredCardTypes.length === 0) {
        console.error("[CardTypeSelector] No card types with preclassifiers found for siteId:", siteId);
        AnatomyNotification.error(notification, "No card types available");
      }

      // Sort alphabetically/alphanumerically by name
      const sortedCardTypes = filteredCardTypes.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });

      setCardTypes(sortedCardTypes);
    } catch (error) {
      console.error("[CardTypeSelector] Error loading card types:", error);
      AnatomyNotification.error(notification, error);
    } finally {
      onLoadingChange?.(false);
    }
  };

  const handleCardTypeClick = (cardTypeId: string) => {
    // Validate before triggering change
    if (!cardTypeId || cardTypeId === "") {
      console.error("[CardTypeSelector] Invalid cardTypeId selected:", cardTypeId);
      return;
    }

    onCardTypeChange(cardTypeId);
  };

  return (
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
        ) : cardTypes.length === 0 ? (
          <Typography.Text type="secondary">No card types available</Typography.Text>
        ) : (
          cardTypes.map(cardType => {
            // Additional validation before rendering
            if (!cardType || !cardType.id) {
              console.error("[CardTypeSelector] Skipping invalid card type in render:", cardType);
              return null;
            }

            return (
              <SelectableCard
                key={cardType.id}
                item={cardType}
                isSelected={selectedCardType === cardType.id.toString()}
                onClick={() => handleCardTypeClick(cardType.id.toString())}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default CardTypeSelector;
