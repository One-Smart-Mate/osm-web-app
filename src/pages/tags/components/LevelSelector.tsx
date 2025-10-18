import { Typography, Pagination, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import SelectableCard from "./SelectableCard";
import Strings from "../../../utils/localizations/Strings";

interface LevelSelectorProps {
  levelIndex: number;
  levelOptions: any[];
  selectedLevelId: string | undefined;
  onLevelChange: (_levelIndex: number, _levelId: string) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPaginationChange?: (_page: number, _pageSize: number) => void;
  isLoading?: boolean;
}

const LevelSelector = ({
  levelIndex,
  levelOptions,
  selectedLevelId,
  onLevelChange,
  pagination,
  onPaginationChange,
  isLoading = false
}: LevelSelectorProps) => {

  const handleLevelClick = (levelId: string) => {
    // Validate before triggering change
    if (!levelId || levelId === "") {
      console.error("[LevelSelector] Invalid levelId selected at index:", levelIndex, "levelId:", levelId);
      return;
    }

    onLevelChange(levelIndex, levelId);
  };

  // levelOptions already come sorted and paginated from parent
  // No need to sort again here as it would break pagination

  return (
    <div data-level-index={levelIndex} style={{ marginBottom: '24px' }}>
      <Typography.Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
        {`${Strings.level} ${levelIndex + 1}`}
        {pagination && pagination.total > 0 && (
          <Typography.Text type="secondary" style={{ fontSize: '14px', marginLeft: '8px' }}>
            ({pagination.total} {pagination.total === 1 ? 'item' : 'items'})
          </Typography.Text>
        )}
      </Typography.Text>

      {/* Pagination at the top */}
      {!isLoading && pagination && pagination.total > pagination.pageSize && onPaginationChange && (
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
            onChange={onPaginationChange}
            showSizeChanger
            pageSizeOptions={['10', '20', '50', '100']}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            size="small"
          />
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {!levelOptions || levelOptions.length === 0 ? (
              <Typography.Text type="secondary">
                No levels available
              </Typography.Text>
            ) : (
              levelOptions.map(level => {
                // Validate level object before rendering
                if (!level || !level.id) {
                  console.error("[LevelSelector] Invalid level object at index:", levelIndex, "level:", level);
                  return null;
                }

                const levelIdStr = level.id.toString();
                const isSelected = selectedLevelId === levelIdStr;

                // Debug log for first level
                if (levelIndex === 0 && level === levelOptions[0]) {
                  console.log(`[LevelSelector] Level ${levelIndex} - selectedLevelId:`, selectedLevelId, "selectedLevelId type:", typeof selectedLevelId, "first level.id:", levelIdStr, "isSelected:", isSelected);
                }

                // Debug log when level matches selectedLevelId
                if (isSelected) {
                  console.log(`[LevelSelector] MATCH FOUND at level ${levelIndex} - levelId:`, levelIdStr, "Passing isSelected=true to SelectableCard");
                }

                // Debug for level 751 specifically
                if (levelIdStr === "751") {
                  console.log(`[LevelSelector] Level 751 - selectedLevelId:`, selectedLevelId, "isSelected:", isSelected, "Will render with isSelected:", isSelected);
                }

                return (
                  <SelectableCard
                    key={level.id}
                    item={level}
                    isSelected={isSelected}
                    onClick={() => handleLevelClick(levelIdStr)}
                  />
                );
              })
            )}
          </div>

          {/* Pagination for this level */}
          {pagination && pagination.total > pagination.pageSize && onPaginationChange && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={onPaginationChange}
                showSizeChanger
                pageSizeOptions={['10', '20', '50', '100']}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                size="small"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LevelSelector;
