import { Typography } from "antd";
import Strings from "../../../utils/localizations/Strings";

interface SelectedPathDisplayProps {
  levelHierarchy: Map<number, any[]>;
  selectedLevels: Map<number, string>;
}

const SelectedPathDisplay = ({ levelHierarchy, selectedLevels }: SelectedPathDisplayProps) => {
  // Validate that we have selected levels
  if (selectedLevels.size === 0) {
    return null;
  }

  // Build the path string
  const pathParts = Array.from(levelHierarchy.entries())
    .sort(([a], [b]) => a - b)
    .map(([levelIndex, levelOptions]) => {
      const selectedId = selectedLevels.get(levelIndex);
      if (!selectedId) return null;

      const selectedLevel = levelOptions.find(l => l?.id?.toString() === selectedId);
      if (!selectedLevel || !selectedLevel.name) {
        console.error("[SelectedPathDisplay] Invalid level found at index:", levelIndex, "selectedId:", selectedId);
        return null;
      }

      return selectedLevel.name;
    })
    .filter(Boolean);

  // If no valid path parts, don't render
  if (pathParts.length === 0) {
    return null;
  }

  return (
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
        {pathParts.join(' / ')}
      </Typography.Text>
    </div>
  );
};

export default SelectedPathDisplay;
