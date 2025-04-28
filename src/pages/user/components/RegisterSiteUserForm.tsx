import { Checkbox, Form, FormInstance, Input, Select, Tooltip } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import Strings from "../../../utils/localizations/Strings";
import { validateEmail } from "../../../utils/Extensions";
import { useEffect, useState } from "react";
import { Role } from "../../../data/user/user";
import { useGetRolesMutation } from "../../../services/roleService";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../core/store";
import { selectCurrentUser } from "../../../core/authReducer";
import Constants from "../../../utils/Constants";

interface FormProps {
  form: FormInstance;
}

const RegisterSiteUserForm = ({ form }: FormProps) => {
  const [getRoles] = useGetRolesMutation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const currentUser = useAppSelector(selectCurrentUser);

  const handleGetData = async () => {
    const rolesResponse = await getRoles().unwrap();
    
    const hasAdminRole = currentUser?.roles?.some((role: string | Role) => 
      typeof role === 'string' 
        ? role === Constants.ihSisAdmin 
        : role.name === Constants.ihSisAdmin
    );
    
    const filteredRoles = hasAdminRole 
      ? rolesResponse 
      : rolesResponse.filter(role => role.name !== Constants.ihSisAdmin);
      
    setRoles(filteredRoles);
  };

  useEffect(() => {
    handleGetData();
  }, []);

  return (
    <Form form={form} layout="vertical">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
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
          <Tooltip title={Strings.userNameTooltip}>
            <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
          </Tooltip>

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
          <Tooltip title={Strings.userEmailTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
          </Tooltip>
        </div>
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="password"
            validateFirst
            rules={[
              { min: 8, message: Strings.passwordLenght },
              { required: true, message: Strings.requiredPassword },
            ]}
            className="flex-1 mr-1"
          >
            <Input.Password
              size="large"
              minLength={8}
              addonBefore={<LockOutlined />}
              type="password"
              placeholder={Strings.password}
              visibilityToggle={{
                visible: isPasswordVisible,
                onVisibleChange: setPasswordVisible,
              }}
            />
          </Form.Item>
          <Tooltip title={Strings.userPasswordTooltip}>
            <QuestionCircleOutlined className="ml-2 mr-2 mb-6 text-sm text-blue-500" />
          </Tooltip>
          <Form.Item
            name="confirmPassword"
            validateFirst
            dependencies={["password"]}
            className="flex-1"
            rules={[
              { required: true, message: Strings.requiredConfirmPassword },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(Strings.passwordsDoNotMatch)
                  );
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
          <Tooltip title={Strings.userConfirmPasswordTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
          </Tooltip>
        </div>

        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="uploadCardAndEvidenceWithDataNet"
            valuePropName="checked"
            label={Strings.uploadCardAndEvidenceWithDataNet}
            className="flex-1"
          >
            <Checkbox value={1}>{Strings.enable}</Checkbox>
            <Tooltip title={`${Strings.userUploadCardDataWithDataNetTooltip} ${Strings.userUploadCardEvidenceWithDataNetTooltip}`}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </Form.Item>
        </div>
        <div className="flex items-center w-full">
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
              options={roles.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </Form.Item>
          <Tooltip title={Strings.userRolesTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
          </Tooltip>
        </div>
      </div>
    </Form>
  );
};

export default RegisterSiteUserForm;