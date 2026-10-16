import React, { useMemo, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Tooltip,
  Empty,
  Spin,
  notification,
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import MainContainer from "../layouts/MainContainer";
import Strings from "../../utils/localizations/Strings";
import useSiteId from "../../utils/hooks/useSiteId";
import {
  useGetTrainingMatrixBySiteQuery,
  useValidateTrainingMutation,
} from "../../services/cilt/assignaments/oplTrainingService";
import {
  OplTrainingRecord,
  OplTrainingStatus,
} from "../../data/cilt/assignaments/oplTraining";

const STATUS_META: Record<
  OplTrainingStatus,
  { color: string; labelKey: keyof typeof Strings }
> = {
  PENDING: { color: "default", labelKey: "trainingStatusPending" },
  SELF_COMPLETED: { color: "gold", labelKey: "trainingStatusSelfCompleted" },
  VALIDATED: { color: "green", labelKey: "trainingStatusValidated" },
  EXPIRED: { color: "red", labelKey: "trainingStatusExpired" },
};

const formatDate = (iso?: string | null): string =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

const TrainingMatrixContent: React.FC = () => {
  const siteId = useSiteId();
  const {
    data,
    isFetching,
    refetch,
  } = useGetTrainingMatrixBySiteQuery(Number(siteId), { skip: !siteId });
  const [validateTraining, { isLoading: isValidating }] =
    useValidateTrainingMutation();

  // record lookup by `${userId}-${oplId}`
  const recordByCell = useMemo(() => {
    const map = new Map<string, OplTrainingRecord>();
    (data?.records ?? []).forEach((r) => {
      map.set(`${r.userId}-${r.oplId}`, r);
    });
    return map;
  }, [data]);

  const handleValidate = async (recordId: number) => {
    try {
      await validateTraining([recordId]).unwrap();
      notification.success({
        message: Strings.success,
        description: Strings.trainingValidateSuccess,
      });
      refetch();
    } catch (error) {
      console.error("Error validating training:", error);
      notification.error({
        message: Strings.error,
        description: Strings.error,
      });
    }
  };

  if (!data || data.users.length === 0 || data.opls.length === 0) {
    return (
      <Spin spinning={isFetching}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={Strings.trainingNoRecords}
          style={{ margin: "40px 0" }}
        />
      </Spin>
    );
  }

  const columns: any[] = [
    {
      title: Strings.trainingUser,
      dataIndex: "name",
      key: "name",
      fixed: "left" as const,
      width: 220,
      render: (_: any, user: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{user.email}</div>
        </div>
      ),
    },
    ...data.opls.map((opl) => ({
      title: (
        <Tooltip
          title={
            opl.validityDays
              ? `${Strings.oplValidityDaysLabel}: ${opl.validityDays}`
              : undefined
          }
        >
          {opl.title}
        </Tooltip>
      ),
      key: `opl-${opl.id}`,
      width: 180,
      render: (_: any, user: any) => {
        const record = recordByCell.get(`${user.id}-${opl.id}`);
        if (!record) {
          return <Tag color="default">—</Tag>;
        }
        const meta = STATUS_META[record.status];
        return (
          <div>
            <Tag color={meta.color}>{Strings[meta.labelKey] as string}</Tag>
            {record.status === "VALIDATED" && record.expiresAt && (
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                {Strings.trainingExpiresAt}: {formatDate(record.expiresAt)}
              </div>
            )}
            {record.status === "SELF_COMPLETED" && (
              <div style={{ marginTop: 4 }}>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={isValidating}
                  onClick={() => handleValidate(record.id)}
                >
                  {Strings.trainingValidate}
                </Button>
              </div>
            )}
          </div>
        );
      },
    })),
  ];

  return (
    <Spin spinning={isFetching}>
      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={data.users}
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />
    </Spin>
  );
};

const TrainingMatrixPage = (): React.ReactElement => {
  const [siteName] = useState<string>("");
  return (
    <MainContainer
      title={Strings.trainingMatrixTitle}
      description={siteName}
      content={<TrainingMatrixContent />}
    />
  );
};

export default TrainingMatrixPage;
