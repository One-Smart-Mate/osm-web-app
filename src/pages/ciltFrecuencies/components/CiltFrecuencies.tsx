import React, { useEffect, useState } from "react";
import {
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  Switch,
  List,
  Card,
  Typography
} from "antd";
import Strings from "../../../utils/localizations/Strings";
import {
  useGetCiltFrequenciesAllMutation,
  useCreateCiltFrequencyMutation,
  useUpdateCiltFrequencyMutation,
} from "../../../services/cilt/ciltFrequenciesService";
import AnatomyButton from "../../../components/AnatomyButton";
import { CiltFrequency } from "../../../data/cilt/ciltFrequencies/ciltFrequencies";

const { Text } = Typography;

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
        status: isEditMode ? (values.status ? "A" : "I") : "A", // Siempre activo para nuevos registros
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

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
        dataSource={filteredCiltFrequencies}
        loading={isLoading}
        locale={{
          emptyText: Strings.noCiltFrequencies,
        }}
        style={{ overflow: 'hidden' }}
        renderItem={(item: CiltFrequency) => (
          <List.Item>
            <Card
              headStyle={{ backgroundColor: '#1890ff', color: 'white', fontWeight: 'bold' }}
              title={item.frecuencyCode}
              style={{ 
                height: '100%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                border: '1px solid #e8e8e8',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
                target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.15)';
                target.style.transform = 'translateY(0)';
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>{Strings.description}:</Text>
                <Text>{item.description}</Text>
                
                <Text strong style={{ marginTop: '8px' }}>
                  {Strings.status}: {' '}
                  {item.status === 'A' ? (
                    <span style={{ color: "green" }}>{Strings.active}</span>
                  ) : (
                    <span style={{ color: "red" }}>{Strings.inactive}</span>
                  )}
                </Text>
              </Space>
              <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                <Button
                  type="primary"
                  onClick={() => openEditModal(item)}
                >
                  {Strings.edit}
                </Button>
              </div>
            </Card>
          </List.Item>
        )}
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
            rules={[
              { required: true, message: Strings.obligatoryCode },
              { max: 3, message: "El código no puede exceder 3 caracteres" }
            ]}
          >
            <Input maxLength={3} style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item
            label={Strings.description}
            name="description"
            rules={[{ required: true, message: Strings.obligatoryDescription }]}
          >
            <Input />
          </Form.Item>

          {isEditMode && (
            <Form.Item label={Strings.active} name="status" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CiltFrequencies;
