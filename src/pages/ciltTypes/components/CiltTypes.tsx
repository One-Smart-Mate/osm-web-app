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
import {EditOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";
import { useGetCiltTypesAllMutation, useCreateCiltTypeMutation, useUpdateCiltTypeMutation } from "../../../services/cilt/ciltTypesService";
import AnatomyButton from "../../../components/AnatomyButton";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";

const CiltTypes = (): React.ReactElement => {
  const [getCiltTypesAll, { isLoading }] = useGetCiltTypesAllMutation();
  const [ciltTypes, setCiltTypes] = useState<CiltType[]>([]);
  const [filteredCiltTypes, setFilteredCiltTypes] = useState<CiltType[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<CiltType | null>(null);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);

  const [createCiltType] = useCreateCiltTypeMutation();
  const [updateCiltType] = useUpdateCiltTypeMutation();

  useEffect(() => {
    fetchCiltTypes();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchText, statusFilter, ciltTypes]);

  const fetchCiltTypes = async () => {
    try {
      const data = await getCiltTypesAll().unwrap();
      setCiltTypes(data);
    } catch (error) {
      message.error(Strings.errorLoadingNewTypesCilt);
    }
  };

  const filterData = () => {
    let filtered = ciltTypes;

   
    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.name && item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }


    if (statusFilter !== null) {
      filtered = filtered.filter(
        (item) => (statusFilter ? item.status === 'A' : item.status === 'I')
      );
    }


    setFilteredCiltTypes(filtered);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (record: CiltType) => {
    setIsEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      status: record.status === 'A',   
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
        status: values.status ? 'A' : 'I',  
      };

      if (isEditMode && currentRecord) {
        updateCiltType({ id: currentRecord.id, ...payload })
          .unwrap()
          .then(() => {
            message.success(Strings.typeCiltUpdated);
            fetchCiltTypes();
            closeModal();
          })
          .catch(() => {
            message.error(Strings.errorUpdatingCiltType);
          });
      } else {
        createCiltType(payload)
          .unwrap()
          .then(() => {
            message.success(Strings.ciltTypeAdded);
            fetchCiltTypes();
            closeModal();
          })
          .catch(() => {
            message.error(Strings.errorAddingCiltType);
          });
      }
    });
  };

  const columns = [
    {
      title: Strings.name,
      dataIndex: "name",
      key: "name",
    },
    {
      title: Strings.status,
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        status === 'A' ? (
          <span style={{ color: "green" }}>{Strings.active}</span>
        ) : (
          <span style={{ color: "red" }}>{Strings.inactive}</span>
        ),
    },
    {
      title: Strings.actions,
      key: "actions",
      render: (_: any, record: CiltType) => (
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
    <div className="cilt-types-container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Input
            placeholder={Strings.searchbyname}
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
          title={Strings.addNewCiltType}
          onClick={openAddModal}
          type="default"
          size="middle"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredCiltTypes}
        loading={isLoading}
        rowKey="id"
        locale={{
          emptyText: Strings.noCiltTypes,
        }}
        bordered
      />

      <Modal
        title={isEditMode ? Strings.editCiltType : Strings.addCiltType}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={closeModal}
        okText={isEditMode ? Strings.save : Strings.add}
        cancelText={Strings.cancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={Strings.name}
            name="name"
            rules={[{ required: true, message: Strings.obligatoryName }]}
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

export default CiltTypes;
