import { Typography, Input, Divider } from "antd";
import { forwardRef } from "react";
import Strings from "../../../utils/localizations/Strings";

interface CommentsSectionProps {
  comments: string;
  onCommentsChange: (_value: string) => void;
}

const CommentsSection = forwardRef<HTMLDivElement, CommentsSectionProps>(
  ({ comments, onCommentsChange }, ref) => {
    return (
      <>
        <Divider />
        <div ref={ref}>
          <Typography.Text strong>{Strings.anomalyDetected}</Typography.Text>
          <Input.TextArea
            rows={4}
            style={{ marginTop: '8px' }}
            placeholder={Strings.describeAnomaly}
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            maxLength={500}
            showCount
          />
        </div>
      </>
    );
  }
);

CommentsSection.displayName = "CommentsSection";

export default CommentsSection;
