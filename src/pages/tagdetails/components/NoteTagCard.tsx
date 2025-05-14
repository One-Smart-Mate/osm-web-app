import { Card, List } from "antd";
import { Note } from "../../../data/note";
import { formatDate } from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";
import useDarkMode from '../../../utils/hooks/useDarkMode';

interface Props {
  data: Note[];
}
const NoteTagCard = ({ data }: Props) => {
  const isDarkMode = useDarkMode();
  return (
    <Card hoverable>
      <div className="flex gap-3 mb-4">
        {data.length === 0 && (
          <p className="text-base text-gray-700">{Strings.NA}</p>
        )}
      </div>
      <List
        className={`max-h-40 overflow-auto${isDarkMode ? '' : ' bg-gray-50'}`}
        itemLayout="vertical"
        size="small"
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[<p>{formatDate(item.createdAt)}</p>]}
          >
            {item.note}
          </List.Item>
        )}
      />{" "}
    </Card>
  );
};

export default NoteTagCard;
