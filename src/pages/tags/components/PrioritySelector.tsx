import { Typography, DatePicker, App as AntApp } from "antd";
import { useEffect, useState, forwardRef } from "react";
import dayjs from "dayjs";
import SelectableCard from "./SelectableCard";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";
import { useGetActiveSitePrioritiesMutation } from "../../../services/priorityService";
import AnatomyNotification from "../../components/AnatomyNotification";

interface PrioritySelectorProps {
  siteId: string;
  selectedPriority: string;
  onPriorityChange: (_value: string) => void;
  customDueDate: dayjs.Dayjs | null;
  onCustomDueDateChange: (_date: dayjs.Dayjs | null) => void;
  customDateRef: React.RefObject<HTMLDivElement>;
}

const PrioritySelector = forwardRef<HTMLDivElement, PrioritySelectorProps>(
  ({
    siteId,
    selectedPriority,
    onPriorityChange,
    customDueDate,
    onCustomDueDateChange,
    customDateRef
  }, ref) => {
    const { notification } = AntApp.useApp();
    const [getPriorities, { isLoading: isLoadingPriorities }] = useGetActiveSitePrioritiesMutation();
    const [priorities, setPriorities] = useState<any[]>([]);
    const [showCustomDate, setShowCustomDate] = useState(false);

    useEffect(() => {
      if (siteId) {
        loadPriorities();
      }
    }, [siteId]);

    useEffect(() => {
      // Check if the selected priority is wildcard
      if (selectedPriority) {
        const selectedPriorityData = priorities.find(p => p.id.toString() === selectedPriority);
        if (selectedPriorityData && selectedPriorityData.priorityCode === Constants.PRIORITY_WILDCARD_CODE) {
          setShowCustomDate(true);
        } else {
          setShowCustomDate(false);
          onCustomDueDateChange(null);
        }
      }
    }, [selectedPriority, priorities]);

    const loadPriorities = async () => {
      try {
        // Validate siteId
        if (!siteId || siteId === "0" || siteId === "") {
          console.error("[PrioritySelector] Invalid siteId:", siteId);
          AnatomyNotification.error(notification, "Invalid site");
          return;
        }

        const response = await getPriorities(siteId.toString()).unwrap();

        // Validate response
        if (!response || !Array.isArray(response)) {
          console.error("[PrioritySelector] Invalid response format from getPriorities:", response);
          AnatomyNotification.error(notification, "Invalid priorities data received");
          setPriorities([]);
          return;
        }

        // Validate each priority object
        const validPriorities = response.filter(priority => {
          if (!priority || !priority.id) {
            console.error("[PrioritySelector] Invalid priority object:", priority);
            return false;
          }
          return true;
        });

        if (validPriorities.length === 0) {
          console.error("[PrioritySelector] No valid priorities found for siteId:", siteId);
          AnatomyNotification.error(notification, "No priorities available");
        }

        // Sort alphabetically/alphanumerically by priorityCode
        const sortedPriorities = validPriorities.sort((a, b) => {
          const codeA = (a.priorityCode || a.name || '').toLowerCase();
          const codeB = (b.priorityCode || b.name || '').toLowerCase();
          return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
        });

        setPriorities(sortedPriorities);
      } catch (error) {
        console.error("[PrioritySelector] Error loading priorities for siteId:", siteId, error);
        AnatomyNotification.error(notification, error);
        setPriorities([]);
      }
    };

    const handlePriorityClick = (priorityId: string) => {
      // Validate before triggering change
      if (!priorityId || priorityId === "") {
        console.error("[PrioritySelector] Invalid priorityId selected:", priorityId);
        return;
      }

      onPriorityChange(priorityId);
    };

    const handleDateChange = (date: dayjs.Dayjs | null) => {
      // Validate date
      if (date && !date.isValid()) {
        console.error("[PrioritySelector] Invalid date selected:", date);
        AnatomyNotification.error(notification, "Invalid date selected");
        return;
      }

      onCustomDueDateChange(date);
    };

    return (
      <div ref={ref}>
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
          ) : priorities.length === 0 ? (
            <Typography.Text type="secondary">
              No priorities available
            </Typography.Text>
          ) : (
            priorities.map(priority => {
              // Additional validation before rendering
              if (!priority || !priority.id) {
                console.error("[PrioritySelector] Skipping invalid priority in render:", priority);
                return null;
              }

              return (
                <SelectableCard
                  key={priority.id}
                  item={priority}
                  isSelected={selectedPriority === priority.id.toString()}
                  onClick={() => handlePriorityClick(priority.id.toString())}
                />
              );
            })
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
              onChange={handleDateChange}
              disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
            />
            <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
              {Strings.selectCustomDueDateMessage}
            </Typography.Text>
          </div>
        )}
      </div>
    );
  }
);

PrioritySelector.displayName = "PrioritySelector";

export default PrioritySelector;
