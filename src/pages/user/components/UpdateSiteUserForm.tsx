import { Checkbox, Form, FormInstance, Input, Select } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import Strings from "../../../utils/localizations/Strings";
import { validateEmail } from "../../../utils/Extensions";
import { useEffect, useState } from "react";
import { Role, UserUpdateForm } from "../../../data/user/user";
import { useGetRolesMutation } from "../../../services/roleService";
import { useAppSelector } from "../../../core/store";
import { selectCurrentRowData } from "../../../core/genericReducer";

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
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item className="hidden" name="id">
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredUserName },
              { max: 50 },
              { pattern: /^[A-Za-z\s]+$/, message: Strings.onlyLetters },
            ]}
            className="mr-1 flex-1"
          >
            <Input
              size="large"
              maxLength={50}
              addonBefore={<FaRegUser />}
              placeholder={Strings.name}
            />
          </Form.Item>
          <Form.Item
            name="email"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredEmail },
              { validator: validateEmail },
            ]}
            className="flex-1"
          >
            <Input
              size="large"
              maxLength={60}
              addonBefore={<MailOutlined />}
              placeholder={Strings.email}
            />
          </Form.Item>
        </div>
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="password"
            validateFirst
            rules={[{ min: 8, message: Strings.passwordLenght }]}
            className="flex-1 mr-1"
          >
            <Input.Password
              size="large"
              minLength={8}
              addonBefore={<LockOutlined />}
              type="password"
              placeholder={Strings.updatePassword}
              visibilityToggle={{
                visible: isPasswordVisible,
                onVisibleChange: setPasswordVisible,
              }}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            validateFirst
            dependencies={["password"]}
            className="flex-1"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value && getFieldValue("password")) {
                    return Promise.reject(new Error(Strings.requiredPassword));
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
          >
            <Input.Password
              size="large"
              addonBefore={<LockOutlined />}
              placeholder={Strings.confirmPassword}
            />
          </Form.Item>
        </div>
        <Form.Item name="siteId" className="hidden">
          <Input />
        </Form.Item>
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="uploadCardDataWithDataNet"
            valuePropName="checked"
            label={Strings.uploadCardDataWithDataNet}
            className="mr-1"
          >
            <Checkbox value={1}>{Strings.enable}</Checkbox>
          </Form.Item>
          <Form.Item
            name="uploadCardEvidenceWithDataNet"
            valuePropName="checked"
            label={Strings.uploadCardEvidenceWithDataNet}
            className="flex-1"
          >
            <Checkbox value={1}>{Strings.enable}</Checkbox>
          </Form.Item>
        </div>
        <Form.Item
          name="roles"
          validateFirst
          rules={[{ required: true, message: Strings.requiredRoles }]}
          className="flex-1"
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
        <Form.Item className="hidden" name="status">
          <Input />
        </Form.Item>
      </div>
    </Form>
  );
};

export default UpdateSiteUserForm;
