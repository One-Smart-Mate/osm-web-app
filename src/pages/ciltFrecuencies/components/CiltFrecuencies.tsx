import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  Switch,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";
import {
  useGetCiltFrequenciesAllMutation,
  useCreateCiltFrequencyMutation,
  useUpdateCiltFrequencyMutation,
} from "../../../services/cilt/ciltFrequenciesService";
import AnatomyButton from "../../../components/AnatomyButton";
import { CiltFrequency } from "../../../data/cilt/ciltFrequencies/ciltFrequencies";

const CiltFrequencies = (): React.ReactElement => {
  const [getCiltFrequenciesAll, { isLoading }] = useGetCiltFrequenciesAllMutation();
  const [ciltFrequencies, setCiltFrequencies] = useState<CiltFrequency[]>([]);
  const [filteredCiltFrequencies, setFilteredCiltFrequencies] = useState<CiltFrequency[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<CiltFrequency | null>(null);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);

  const [createCiltFrequency] = useCreateCiltFrequencyMutation();
  const [updateCiltFrequency] = useUpdateCiltFrequencyMutation();

  useEffect(() => {
    fetchCiltFrequencies();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchText, statusFilter, ciltFrequencies]);

  const fetchCiltFrequencies = async () => {
    try {
      const data = await getCiltFrequenciesAll().unwrap();
      setCiltFrequencies(data);
    } catch (error) {
      message.error(Strings.errorLoadingCiltFrequencies);
    }
  };

  const filterData = () => {
    let filtered = ciltFrequencies;

    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          (item.description && item.description.toLowerCase().includes(searchText.toLowerCase())) ||
          (item.frecuencyCode && item.frecuencyCode.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    if (statusFilter !== null) {
      filtered = filtered.filter(
        (item) => (statusFilter ? item.status === "A" : item.status === "I")
      );
    }

    setFilteredCiltFrequencies(filtered);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (record: CiltFrequency) => {
    setIsEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      status: record.status === "A",
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        status: values.status ? "A" : "I",
      };

      if (isEditMode && currentRecord) {
        updateCiltFrequency({ id: currentRecord.id, ...payload })
          .unwrap()
          .then(() => {
            message.success(Strings.ciltFrequencyUpdated);
            fetchCiltFrequencies();
            closeModal();
          })
          .catch(() => {
            message.error(Strings.errorUpdatingCiltFrequency);
          });
      } else {
        createCiltFrequency(payload)
          .unwrap()
          .then(() => {
            message.success(Strings.ciltFrequencyAdded);
            fetchCiltFrequencies();
            closeModal();
          })
          .catch(() => {
            message.error(Strings.errorAddingCiltFrequency);
          });
      }
    });
  };

  const columns = [
    {
      title: Strings.frequencyCode,
      dataIndex: "frecuencyCode",
      key: "frecuencyCode",
    },
    {
      title: Strings.description,
      dataIndex: "description",
      key: "description",
    },
    {
      title: Strings.status,
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        status === "A" ? (
          <span style={{ color: "green" }}>{Strings.active}</span>
        ) : (
          <span style={{ color: "red" }}>{Strings.inactive}</span>
        ),
    },
    {
      title: Strings.actions,
      key: "actions",
      render: (_: any, record: CiltFrequency) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="cilt-frequencies-container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Input
            placeholder={Strings.searchbyDescriptionOrCode}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Switch
            checked={statusFilter === true}
            onChange={(checked) => setStatusFilter(checked ? true : false)}
            checkedChildren={Strings.active}
            unCheckedChildren={Strings.inactive}
          />
        </div>

        <AnatomyButton
          title={Strings.addNewCiltFrequency}
          onClick={openAddModal}
          type="default"
          size="middle"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredCiltFrequencies}
        loading={isLoading}
        rowKey="id"
        locale={{
          emptyText: Strings.noCiltFrequencies,
        }}
        bordered
      />

      <Modal
        title={isEditMode ? Strings.editCiltFrequency : Strings.addCiltFrequency}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={closeModal}
        okText={isEditMode ? Strings.save : Strings.add}
        cancelText={Strings.cancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={Strings.frequencyCode}
            name="frecuencyCode"
            rules={[{ required: true, message: Strings.obligatoryCode }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={Strings.description}
            name="description"
            rules={[{ required: true, message: Strings.obligatoryDescription }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={Strings.active} name="status" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CiltFrequencies;
