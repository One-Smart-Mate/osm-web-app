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
import { useGetCiltTypesAllMutation, useCreateCiltTypeMutation, useUpdateCiltTypeMutation } from "../../../services/cilt/ciltTypesService";
import AnatomyButton from "../../../components/AnatomyButton";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";
import { useLocation } from "react-router-dom";
import { FilterOutlined } from "@ant-design/icons";
import { Checkbox, Popover } from "antd";


const { Text } = Typography;

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

  const location = useLocation();
  const siteId = location?.state?.siteId; 



  useEffect(() => {
    fetchCiltTypes();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchText, statusFilter, ciltTypes]);

  const fetchCiltTypes = async () => {
    try {
      const data = await getCiltTypesAll().unwrap();
      const filteredBySite = data.filter(item => item.siteId === Number(siteId));
      setCiltTypes(filteredBySite);
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
    form.setFieldsValue({
      name: '',
      status: true,     
      color: '#FFFFFF'  
    });
    setIsModalVisible(true);
  };


  const openEditModal = (record: CiltType) => {
    setIsEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      status: record.status === 'A',
      color: record.color ? `#${record.color}` : '#FFFFFF'
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalOk = () => {
    if (!siteId) {
      message.error(Strings.errorNoSiteId);
      return;
    }

    form.validateFields().then((values) => {
      if (values.color && values.color.startsWith('#')) {
        values.color = values.color.slice(1);
      }

      const payload = {
        ...values,
        status: values.status ? Strings.activeValue : Strings.inactiveValue,
        siteId: Number(siteId),
      };


      console.log('Payload:', payload);

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

  return (
    <div className="cilt-types-container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Input
            placeholder={Strings.searchByName}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Popover
            trigger="click"
            content={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Checkbox
                  checked={statusFilter === true}
                  onChange={(e) => setStatusFilter(e.target.checked ? true : null)}
                >
                  {Strings.active}
                </Checkbox>
                <Checkbox
                  checked={statusFilter === false}
                  onChange={(e) => setStatusFilter(e.target.checked ? false : null)}
                >
                  {Strings.inactive}
                </Checkbox>
                <Button size="small" type="link" onClick={() => setStatusFilter(null)}>
                  {Strings.clearFilters}
                </Button>
              </div>
            }
          >
            <Button icon={<FilterOutlined />}>{Strings.filter}</Button>
          </Popover>

        </div>

        <AnatomyButton
          title={Strings.create}
          onClick={openAddModal}
          type="default"
          size="middle"
        />
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
        dataSource={filteredCiltTypes}
        loading={isLoading}
        locale={{ emptyText: Strings.noCiltTypes }}
        style={{ overflow: 'hidden' }}
        renderItem={(item: CiltType) => (
          <List.Item>
            <Card
              hoverable
              className="rounded-xl shadow-md"
              title={
                <Typography.Title level={5} style={{ marginBottom: 0 }}>
                  {item.name}
                </Typography.Title>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} className="bg-gray-100 rounded-md p-3">
                <Text strong>
                  {Strings.status}:{' '}
                  {item.status === 'A' ? (
                    <span style={{ color: "green" }}>{Strings.active}</span>
                  ) : (
                    <span style={{ color: "red" }}>{Strings.inactive}</span>
                  )}
                </Text>

                {item.color && (
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>{Strings.color}:</Text>{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        backgroundColor: `#${item.color}`,
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        verticalAlign: 'middle',
                        marginRight: '8px',
                      }}
                    />
                    <span>#{item.color}</span>
                  </div>
                )}
              </Space>

              <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                <Button type="primary" onClick={() => openEditModal(item)}>
                  {Strings.edit}
                </Button>
              </div>
            </Card>
          </List.Item>
        )}
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

          
          <Form.Item label={Strings.color} name="color">
            <Input type="color" />
          </Form.Item>

        </Form>
      </Modal>

    </div>
  );
};

export default CiltTypes;
