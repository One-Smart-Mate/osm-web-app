import { useState } from "react";
import { Modal, Button, List, Tag, Popconfirm, Empty, Spin, notification } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";
import ScheduleSecuence from "./ScheduleSecuence";
import {
  useGetSchedulesBySequenceQuery,
  useDeleteScheduleMutation,
} from "../../../services/cilt/ciltSecuencesScheduleService";
import { CiltSecuencesSchedule } from "../../../data/cilt/ciltSecuencesSchedule/ciltSecuencesSchedule";

interface SequenceSchedulesModalProps {
  open: boolean;
  onClose: () => void;
  sequenceId?: number;
  ciltId?: number;
  siteId?: number;
  sequenceName?: string;
}

const DAY_LABELS: { key: keyof CiltSecuencesSchedule; label: string }[] = [
  { key: "mon", label: "L" },
  { key: "tue", label: "M" },
  { key: "wed", label: "X" },
  { key: "thu", label: "J" },
  { key: "fri", label: "V" },
  { key: "sat", label: "S" },
  { key: "sun", label: "D" },
];

// Build a human description of a single calendarization row.
const describeSchedule = (s: CiltSecuencesSchedule): string => {
  const typeLabel =
    s.scheduleType === "dai"
      ? Strings.daily
      : s.scheduleType === "wee"
      ? Strings.weekly
      : s.scheduleType === "mon"
      ? Strings.monthly
      : s.scheduleType === "yea"
      ? Strings.yearly
      : (s.scheduleType ?? "");

  const parts: string[] = [typeLabel];

  if (s.schedule) parts.push(`${Strings.schedule || "Hora"}: ${s.schedule}`);

  if (s.scheduleType === "wee") {
    const days = DAY_LABELS.filter((d) => Number(s[d.key]) === 1).map((d) => d.label);
    if (days.length) parts.push(days.join(","));
  }
  if (s.scheduleType === "mon") {
    if (s.dayOfMonth) parts.push(`Día ${s.dayOfMonth}`);
    else if (s.weekOfMonth) parts.push(`Semana ${s.weekOfMonth}`);
  }
  if (s.scheduleType === "yea") {
    if (s.monthOfYear) parts.push(`Mes ${s.monthOfYear}`);
    if (s.dayOfMonth) parts.push(`Día ${s.dayOfMonth}`);
  }
  if (s.endDate) parts.push(`Hasta ${s.endDate}`);

  return parts.filter(Boolean).join(" · ");
};

export default function SequenceSchedulesModal({
  open,
  onClose,
  sequenceId,
  ciltId,
  siteId,
  sequenceName,
}: SequenceSchedulesModalProps) {
  const {
    data: rawSchedules = [],
    isFetching,
    refetch,
  } = useGetSchedulesBySequenceQuery(Number(sequenceId), {
    skip: !open || !sequenceId,
  });
  // The list endpoint does not filter soft-deleted rows, so hide them here.
  const schedules = (rawSchedules as CiltSecuencesSchedule[]).filter(
    (s) => !s.deletedAt && s.status !== "I"
  );
  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteScheduleMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CiltSecuencesSchedule | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (s: CiltSecuencesSchedule) => {
    setEditing(s);
    setFormOpen(true);
  };

  const handleFormSaved = () => {
    setFormOpen(false);
    setEditing(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSchedule(id).unwrap();
      notification.success({ message: Strings.success });
      refetch();
    } catch {
      notification.error({ message: Strings.errorSaveSchedule });
    }
  };

  // Map a DB row to the shape the ScheduleSecuence form expects (schedules array).
  const toFormSchedule = (s: CiltSecuencesSchedule) =>
    ({
      ...s,
      schedules: s.schedule ? [s.schedule] : [],
    } as any);

  return (
    <>
      <Modal
        title={`${Strings.scheduleSequence}${sequenceName ? ` — ${sequenceName}` : ""}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={640}
        destroyOnHidden
      >
        <div className="flex justify-end mb-3">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {Strings.addSchedule || "Agregar"}
          </Button>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : schedules.length === 0 ? (
          <Empty description={Strings.ciltPositionsLevelsNoData || "Sin calendarizaciones"} />
        ) : (
          <List
            dataSource={schedules}
            renderItem={(s: CiltSecuencesSchedule) => (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(s)}
                  >
                    {Strings.edit}
                  </Button>,
                  <Popconfirm
                    key="del"
                    title={Strings.delete}
                    onConfirm={() => handleDelete(s.id)}
                    okButtonProps={{ loading: isDeleting }}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      {Strings.delete}
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={<Tag color="blue">{describeSchedule(s)}</Tag>}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      <ScheduleSecuence
        open={formOpen}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleFormSaved}
        sequenceId={sequenceId}
        ciltId={ciltId}
        siteId={siteId}
        existingSchedule={editing ? toFormSchedule(editing) : undefined}
      />
    </>
  );
}
