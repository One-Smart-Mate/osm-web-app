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

export default SelectableCard;
