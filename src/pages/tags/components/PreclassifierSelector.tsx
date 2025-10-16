import { Typography, App as AntApp } from "antd";
import { useEffect, useState, forwardRef } from "react";
import SelectableCard from "./SelectableCard";
import Strings from "../../../utils/localizations/Strings";
import { useGetPreclassifiersMutation } from "../../../services/preclassifierService";
import AnatomyNotification from "../../components/AnatomyNotification";

interface PreclassifierSelectorProps {
  cardTypeId: string;
  selectedPreclassifier: string;
  onPreclassifierChange: (_value: string) => void;
}

const PreclassifierSelector = forwardRef<HTMLDivElement, PreclassifierSelectorProps>(
  ({ cardTypeId, selectedPreclassifier, onPreclassifierChange }, ref) => {
    const { notification } = AntApp.useApp();
    const [getPreclassifiers, { isLoading: isLoadingPreclassifiers }] = useGetPreclassifiersMutation();
    const [preclassifiers, setPreclassifiers] = useState<any[]>([]);

    useEffect(() => {
      if (cardTypeId) {
        loadPreclassifiers();
      }
    }, [cardTypeId]);

    const loadPreclassifiers = async () => {
      try {
        // Validate cardTypeId
        if (!cardTypeId || cardTypeId === "0" || cardTypeId === "") {
          console.error("[PreclassifierSelector] Invalid cardTypeId:", cardTypeId);
          AnatomyNotification.error(notification, "Invalid card type");
          return;
        }

        const response = await getPreclassifiers(cardTypeId).unwrap();

        // Validate response
        if (!response || !Array.isArray(response)) {
          console.error("[PreclassifierSelector] Invalid response format from getPreclassifiers:", response);
          AnatomyNotification.error(notification, "Invalid preclassifiers data received");
          setPreclassifiers([]);
          return;
        }

        // Validate each preclassifier object
        const validPreclassifiers = response.filter(preclassifier => {
          if (!preclassifier || !preclassifier.id) {
            console.error("[PreclassifierSelector] Invalid preclassifier object:", preclassifier);
            return false;
          }
          return true;
        });

        if (validPreclassifiers.length === 0) {
          console.error("[PreclassifierSelector] No valid preclassifiers found for cardTypeId:", cardTypeId);
          AnatomyNotification.error(notification, "No preclassifiers available");
        }

        setPreclassifiers(validPreclassifiers);
      } catch (error) {
        console.error("[PreclassifierSelector] Error loading preclassifiers for cardTypeId:", cardTypeId, error);
        AnatomyNotification.error(notification, error);
        setPreclassifiers([]);
      }
    };

    const handlePreclassifierClick = (preclassifierId: string) => {
      // Validate before triggering change
      if (!preclassifierId || preclassifierId === "") {
        console.error("[PreclassifierSelector] Invalid preclassifierId selected:", preclassifierId);
        return;
      }

      onPreclassifierChange(preclassifierId);
    };

    return (
      <div ref={ref}>
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
          ) : preclassifiers.length === 0 ? (
            <Typography.Text type="secondary">
              No problem types available
            </Typography.Text>
          ) : (
            preclassifiers.map(preclassifier => {
              // Additional validation before rendering
              if (!preclassifier || !preclassifier.id) {
                console.error("[PreclassifierSelector] Skipping invalid preclassifier in render:", preclassifier);
                return null;
              }

              return (
                <SelectableCard
                  key={preclassifier.id}
                  item={preclassifier}
                  isSelected={selectedPreclassifier === preclassifier.id.toString()}
                  onClick={() => handlePreclassifierClick(preclassifier.id.toString())}
                />
              );
            })
          )}
        </div>
      </div>
    );
  }
);

PreclassifierSelector.displayName = "PreclassifierSelector";

export default PreclassifierSelector;
