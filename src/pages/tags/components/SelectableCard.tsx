import { Card, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";

interface SelectableCardProps {
  item: any;
  isSelected: boolean;
  onClick: () => void;
  showDescription?: boolean;
}

const SelectableCard = ({
  item,
  isSelected,
  onClick,
  showDescription = true
}: SelectableCardProps) => {
  const isLevel = item.responsibleName !== undefined;

  // Debug log for selected cards
  if (isSelected && item.id === 751) {
    console.log("[SelectableCard] Rendering card 751 with isSelected=", isSelected);
  }

  const wrapperStyle: React.CSSProperties = {
    marginRight: '12px',
    marginBottom: '12px',
    border: isSelected ? '4px solid #1890ff' : 'none',
    borderRadius: '8px',
    backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
    padding: isSelected ? '4px' : '0',
    boxShadow: isSelected ? '0 0 20px rgba(24, 144, 255, 0.5)' : 'none',
    transition: 'all 0.3s ease'
  };

  const cardStyle: React.CSSProperties = {
    minWidth: '200px',
    maxWidth: '250px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    margin: 0
  };

  return (
    <div style={wrapperStyle}>
      <Card
        hoverable
        onClick={onClick}
        style={cardStyle}
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
    </div>
  );
};

export default SelectableCard;
