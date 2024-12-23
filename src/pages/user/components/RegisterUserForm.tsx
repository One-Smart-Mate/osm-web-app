import { Checkbox, Form, FormInstance, Input, Select, Tooltip } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import Strings from "../../../utils/localizations/Strings";
import { validateEmail } from "../../../utils/Extensions";
import { useEffect, useState } from "react";
import { Role } from "../../../data/user/user";
import { useGetRolesMutation } from "../../../services/roleService";
import { Site } from "../../../data/site/site";
import { useGetSitesMutation } from "../../../services/siteService";
import { QuestionCircleOutlined } from "@ant-design/icons";

interface FormProps {
  form: FormInstance;
}

const RegisterUserForm = ({ form }: FormProps) => {
  const [getRoles] = useGetRolesMutation();
  const [getSites] = useGetSitesMutation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handleGetData = async () => {
    const rolesResponse = await getRoles().unwrap();
    const sitesResponse = await getSites().unwrap();
    setRoles(rolesResponse);
    setSites(sitesResponse);
  };

  useEffect(() => {
    handleGetData();
  }, []);

  const siteOptions = () => {
    return sites.map((site) => {
      return {
        value: site.id,
        labelText: site.rfc,
        label: (
          <p className="flex justify-between items-center">
            {site.name} ({site.rfc})
          </p>
        ),
      };
    });
  };

  const filteredOptions = roles.filter((o) => !selectedRoles.includes(o));

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
                  return Promise.reject(new Error(Strings.passwordsDoNotMatch));
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
        <div className="flex items-center w-full">
          <Form.Item
            label={
              <p>
                {Strings.site} ({Strings.rfc})
              </p>
            }
            name="siteId"
            validateFirst
            rules={[{ required: true, message: Strings.requiredSite }]}
            className="flex-grow"
          >
            <Select
              size="large"
              placeholder={Strings.site}
              value={selectedSite}
              onChange={setSelectedSite}
              options={siteOptions()}
              showSearch
              filterOption={(input, option) => {
                if (!option) {
                  return false;
                }
                return option.labelText
                  ?.toLowerCase()
                  .includes(input.toLowerCase());
              }}
            />
          </Form.Item>
          <Tooltip title={Strings.userSiteRfcTooltip}>
            <QuestionCircleOutlined className="ml-2  text-sm text-blue-500" />
          </Tooltip>
        </div>

        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="uploadCardDataWithDataNet"
            valuePropName="checked"
            label={Strings.uploadCardDataWithDataNet}
            className="mr-1"
          >
            <Checkbox value={1}>{Strings.enable}</Checkbox>
            <Tooltip title={Strings.userUploadCardDataWithDataNetTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </Form.Item>
          <Form.Item
            name="uploadCardEvidenceWithDataNet"
            valuePropName="checked"
            label={Strings.uploadCardEvidenceWithDataNet}
            className="flex-1"
          >
            <Checkbox value={1}>{Strings.enable}</Checkbox>
            <Tooltip title={Strings.userUploadCardEvidenceWithDataNetTooltip}>
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
      </div>
    </Form>
  );
};

export default RegisterUserForm;
