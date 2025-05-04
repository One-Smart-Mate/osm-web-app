import React from "react";
import { Form, Input, Select, Spin, Typography, Button } from "antd";
import { Responsible } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface OplFormProps {
  form: any;
  isViewMode: boolean;
  loadingUsers: boolean;
  responsibles: Responsible[];
  onSubmit: () => void;
  currentOpl?: any;
}

const OplForm: React.FC<OplFormProps> = ({
  form,
  isViewMode,
  loadingUsers,
  responsibles,
  onSubmit,
}) => {
  return (
    <Spin spinning={loadingUsers}>
      <Form form={form} layout="vertical" disabled={isViewMode}>
        <Form.Item
          name="title"
          label={Strings.oplFormTitleLabel}
          rules={[{ required: true, message: Strings.oplFormTitleRequired }]}
        >
          <Input
            maxLength={100}
            placeholder={Strings.oplFormTitlePlaceholder}
          />
        </Form.Item>

        <Form.Item
          name="objetive"
          label={Strings.oplFormObjectiveLabel}
          rules={[
            { required: true, message: Strings.oplFormObjectiveRequired },
          ]}
        >
          <TextArea
            rows={4}
            maxLength={255}
            placeholder={Strings.oplFormObjectivePlaceholder}
          />
        </Form.Item>

        <Form.Item
          name="oplType"
          label={Strings.oplFormTypeLabel}
          rules={[{ required: true, message: Strings.oplFormTypeRequired }]}
        >
          <Select placeholder={Strings.oplFormTypePlaceholder}>
            <Option value="opl">{Strings.oplFormTypeOpl}</Option>
            <Option value="sop">{Strings.oplFormTypeSop}</Option>
          </Select>
        </Form.Item>

        {isViewMode ? (
          <>
            <Form.Item label={Strings.oplFormCreatorLabel}>
              <Text>
                {form.getFieldValue("creatorName") ||
                  Strings.oplFormNotAssigned}
              </Text>
            </Form.Item>
            <Form.Item label={Strings.oplFormReviewerLabel}>
              <Text>
                {form.getFieldValue("reviewerName") ||
                  Strings.oplFormNotAssigned}
              </Text>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item name="creatorId" label={Strings.oplFormCreatorLabel}>
              <Select
                placeholder={Strings.oplFormCreatorPlaceholder}
                loading={loadingUsers}
                showSearch
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {responsibles.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="reviewerId" label={Strings.oplFormReviewerLabel}>
              <Select
                placeholder={Strings.oplFormReviewerPlaceholder}
                loading={loadingUsers}
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {responsibles.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}

        {!isViewMode && (
          <Form.Item style={{ textAlign: "right", marginTop: 16 }}>
            <Button type="primary" onClick={onSubmit} htmlType="submit">
              {form.getFieldValue("id")
                ? Strings.oplFormUpdateButton
                : Strings.oplFormCreateButton}
            </Button>
          </Form.Item>
        )}
      </Form>
    </Spin>
  );
};

export default OplForm;
