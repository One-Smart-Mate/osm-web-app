import { List } from "antd";
import { Note } from "../../../data/note";
import { formatDate } from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";



interface Props {
  data: Note[];
}
const NoteCollapseV2 = ({ data }: Props) => {
  return (


    <div className="bg-gray-100 rounded-xl shadow-md w-full md:w-4/5 p-4">

      <div className="flex gap-3 mb-4">
        {data.length === 0 && (
          <p className="text-base text-gray-700">{Strings.NA}</p>
        )}
      </div>
      <List
        className="max-h-40 overflow-auto"
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
      />
    </div>
  );
};

export default NoteCollapseV2;
