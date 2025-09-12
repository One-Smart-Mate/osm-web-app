import React from "react";
import { Table, Button } from "antd";
import { Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { OplDetail } from "../../../data/cilt/oplDetails/oplDetails";
import Strings from "../../../utils/localizations/Strings";

const { Paragraph, Text } = Typography;

interface OplDetailsListProps {
  details: OplDetail[];
  onDeleteDetail: (_detail: OplDetail) => void;
}

const OplDetailsList: React.FC<OplDetailsListProps> = ({
  details,
  onDeleteDetail,
}) => {
  if (details.length === 0) {
    return <Paragraph>{Strings.oplDetailsListNoDetails}</Paragraph>;
  }

  return (
    <Table
      dataSource={details}
      rowKey="id"
      pagination={false}
      columns={[
        {
          title: Strings.oplDetailsListOrderColumn,
          dataIndex: "order",
          key: "order",
          width: 80,
          render: (order) => <Text>{order}</Text>,
        },
        {
          title: Strings.oplDetailsListTypeColumn,
          dataIndex: "type",
          key: "type",
          width: 100,
          render: (type) => {
            const typeMap = {
              texto: Strings.oplDetailsListTextType,
              imagen: Strings.oplDetailsListImageType,
              video: Strings.oplDetailsListVideoType,
              pdf: Strings.oplDetailsListPdfType,
            };
            return <Text>{typeMap[type as keyof typeof typeMap] || type}</Text>;
          },
        },
        {
          title: Strings.oplDetailsListContentColumn,
          key: "content",
          render: (_, record) => {
            if (record.type === "texto") {
              return (
                <Paragraph ellipsis={{ rows: 2 }} style={{ whiteSpace: 'pre-line' }}>{record.text}</Paragraph>
              );
            } else if (record.mediaUrl) {
              return (
                <Button
                  type="link"
                  onClick={() =>
                    record.mediaUrl && window.open(record.mediaUrl)
                  }
                >
                  {Strings.oplDetailsListViewContent.replace(
                    "{type}",
                    record.type
                  )}
                </Button>
              );
            } else {
              return (
                <Text type="secondary">{Strings.oplDetailsListNoContent}</Text>
              );
            }
          },
        },
        {
          title: Strings.oplDetailsListActionsColumn,
          key: "action",
          width: 100,
          render: (_, record) => (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteDetail(record)}
            />
          ),
        },
      ]}
    />
  );
};

export default OplDetailsList;
