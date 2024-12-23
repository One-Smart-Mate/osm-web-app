import { Checkbox, Form, FormInstance, Input, Select, Tooltip } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import Strings from "../../../utils/localizations/Strings";
import { validateEmail } from "../../../utils/Extensions";
import { useEffect, useState } from "react";
import { Role, UserUpdateForm } from "../../../data/user/user";
import { useGetRolesMutation } from "../../../services/roleService";
import { useAppSelector } from "../../../core/store";
import { selectCurrentRowData } from "../../../core/genericReducer";
import { QuestionCircleOutlined } from "@ant-design/icons";

interface FormProps {
  form: FormInstance;
}

const UpdateSiteUserForm = ({ form }: FormProps) => {
  const [getRoles] = useGetRolesMutation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const rowData = useAppSelector(
    selectCurrentRowData
  ) as unknown as UserUpdateForm;

  const handleGetData = async () => {
    const [rolesResponse] = await Promise.all([getRoles().unwrap()]);
    setRoles(rolesResponse);
  };

  useEffect(() => {
    handleGetData();
  }, []);

  useEffect(() => {
    if (roles.length > 0) {
      form.setFieldsValue({ ...rowData });
    }
  }, [roles]);

  const filteredOptions = roles.filter((o) => !selectedRoles.includes(o));

  return (
    <Form form={form} layout="vertical">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Form.Item
              name="name"
              validateFirst
              rules={[
                { required: true, message: Strings.requiredUserName },
                { max: 50 },
                { pattern: /^[A-Za-z\s]+$/, message: Strings.onlyLetters },
              ]}
              className="w-full"
            >
              <Input
                size="large"
                maxLength={50}
                addonBefore={<FaRegUser />}
                placeholder={Strings.name}
              />
            </Form.Item>
            <Tooltip title={Strings.userNameTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
          <div className="flex items-center">
            <Form.Item
              name="email"
              validateFirst
              rules={[
                { required: true, message: Strings.requiredEmail },
                { validator: validateEmail },
              ]}
              className="w-full"
            >
              <Input
                size="large"
                maxLength={60}
                addonBefore={<MailOutlined />}
                placeholder={Strings.email}
              />
            </Form.Item>
            <Tooltip title={Strings.userEmailTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Form.Item
              name="password"
              validateFirst
              rules={[{ min: 8, message: Strings.passwordLenght }]}
              className="w-full"
            >
              <Input.Password
                size="large"
                minLength={8}
                addonBefore={<LockOutlined />}
                placeholder={Strings.updatePassword}
                visibilityToggle={{
                  visible: isPasswordVisible,
                  onVisibleChange: setPasswordVisible,
                }}
              />
            </Form.Item>
            <Tooltip title={Strings.userPasswordTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
          <div className="flex items-center">
            <Form.Item
              name="confirmPassword"
              validateFirst
              dependencies={["password"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value && getFieldValue("password")) {
                      return Promise.reject(
                        new Error(Strings.requiredPassword)
                      );
                    }
                    if (value && getFieldValue("password") !== value) {
                      return Promise.reject(
                        new Error(Strings.passwordsDoNotMatch)
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              className="w-full"
            >
              <Input.Password
                size="large"
                addonBefore={<LockOutlined />}
                placeholder={Strings.confirmPassword}
              />
            </Form.Item>
            <Tooltip title={Strings.userConfirmPasswordTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Form.Item
              name="uploadCardDataWithDataNet"
              valuePropName="checked"
              label={Strings.uploadCardDataWithDataNet}
            >
              <Checkbox value={1}>{Strings.enable}</Checkbox>
            </Form.Item>
            <Tooltip title={Strings.userUploadCardDataWithDataNetTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <Form.Item
              name="uploadCardEvidenceWithDataNet"
              valuePropName="checked"
              label={Strings.uploadCardEvidenceWithDataNet}
            >
              <Checkbox value={1}>{Strings.enable}</Checkbox>
            </Form.Item>
            <Tooltip title={Strings.userUploadCardEvidenceWithDataNetTooltip}>
              <QuestionCircleOutlined className="text-sm text-blue-500" />
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center">
          <Form.Item
            name="roles"
            validateFirst
            rules={[{ required: true, message: Strings.requiredRoles }]}
            className="w-full"
          >
            <Select
              mode="multiple"
              size="large"
              placeholder={Strings.roles}
              value={selectedRoles}
              onChange={setSelectedRoles}
              options={filteredOptions.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </Form.Item>
          <Tooltip title={Strings.userRolesTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
          </Tooltip>
        </div>
        <Form.Item className="hidden" name="status">
          <Input />
        </Form.Item>
      </div>
    </Form>
  );
};

export default UpdateSiteUserForm;
