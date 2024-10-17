import { Collapse, List } from "antd";
import { Note } from "../../../data/note";
import { formatDate } from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";

interface Props {
  data: Note[];
}
const NoteCollapse = ({ data }: Props) => {
  return (
    <Collapse
      collapsible={data.length === 0 ? "disabled" : undefined}
      className="bg-gray-100 rounded-xl shadow-md md:w-4/5"
    >
      <Collapse.Panel
        header={
          <>
            <div className="flex gap-3">
              <h2 className="text-base font-semibold text-black">
                {Strings.changeLog}
              </h2>
              {data.length === 0 && (
                <p className="text-base text-gray-700">{Strings.NA}</p>
              )}
            </div>
          </>
        }
        key="1"
      >
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
      </Collapse.Panel>
    </Collapse>
  );
};

export default NoteCollapse;
