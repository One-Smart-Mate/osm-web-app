import { Checkbox, Form, FormInstance, Input, Select, Tooltip } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import Strings from "../../../utils/localizations/Strings";
import { validateEmail } from "../../../utils/Extensions";
import { useEffect, useMemo, useState } from "react";
import { Role, UserTable, UserUpdateForm } from "../../../data/user/user";
import { useGetRolesMutation } from "../../../services/roleService";
import { Site } from "../../../data/site/site";
import { useGetSitesMutation } from "../../../services/siteService";
import { useGetUsersMutation } from "../../../services/userService";
import { useAppSelector } from "../../../core/store";
import { selectCurrentRowData } from "../../../core/genericReducer";
import { QuestionCircleOutlined } from "@ant-design/icons";

interface FormProps {
  form: FormInstance;
}

const UpdateUserForm = ({ form }: FormProps) => {
  const [getRoles] = useGetRolesMutation();
  const [getSites] = useGetSitesMutation();
  const [getUsers] = useGetUsersMutation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<UserTable[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const rowData = useAppSelector(
    selectCurrentRowData
  ) as unknown as UserUpdateForm;

  const handleGetData = async () => {
    const [rolesResponse, sitesResponse, usersResponse] = await Promise.all([
      getRoles().unwrap(),
      getSites().unwrap(),
      getUsers().unwrap(),
    ]);
    setRoles(rolesResponse);
    setSites(sitesResponse);
    setUsers(usersResponse);
  };

  useEffect(() => {
    handleGetData();
  }, []);

  useEffect(() => {
    if (sites.length > 0 && users.length > 0 && roles.length > 0) {
      form.setFieldsValue({ ...rowData });
    }
  }, [sites, roles]);

  const siteOptions = useMemo(() => {
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
  }, [sites, users]);

  const filteredOptions = roles.filter((o) => !selectedRoles.includes(o));

  const statusOptions = [
    { value: Strings.activeValue, label: Strings.active },
    { value: Strings.inactiveValue, label: Strings.inactive },
  ];

  return (
    <Form form={form} layout="vertical">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item className="hidden" name="id">
            <Input />
          </Form.Item>
          <div className="flex items-center flex-1">
            <Form.Item
              name="name"
              validateFirst
              rules={[
                { required: true, message: Strings.requiredUserName },
                { max: 50 },
                { pattern: /^[A-Za-z\s]+$/, message: Strings.onlyLetters },
              ]}
              className="flex-1"
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
          <div className="flex items-center flex-1">
            <Form.Item
              name="email"
              validateFirst
              rules={[
                { required: true, message: Strings.requiredEmail },
                { validator: validateEmail },
              ]}
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
        <div className="flex flex-row flex-wrap">
          <div className="flex items-center flex-1">
            <Form.Item
              name="password"
              validateFirst
              rules={[{ min: 8, message: Strings.passwordLenght }]}
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
            <Tooltip title={Strings.userPasswordTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
          <div className="flex items-center flex-1">
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
        <div className="flex items-center flex-1">
          <Form.Item
            label={
              <p>
                {Strings.site} ({Strings.rfc}) - {Strings.userLicense} -{" "}
                <span className="rounded-xl p-0.5 text-white bg-gray-600">
                  Current users
                </span>{" "}
                /{" "}
                <span className="rounded-xl p-0.5 text-white bg-gray-800">
                  User quantity
                </span>
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
              options={siteOptions}
              showSearch
              filterOption={(input, option) => {
                if (!option) {
                  return false;
                }
                return option.labelText
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
            />
          </Form.Item>
          <Tooltip title={Strings.userSiteRfcTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
          </Tooltip>
        </div>
        <div className="flex flex-row flex-wrap">
          <div className="flex items-center flex-1">
            <Form.Item
              name="uploadCardDataWithDataNet"
              valuePropName="checked"
              label={Strings.uploadCardDataWithDataNet}
            >
              <Checkbox value={1}>{Strings.enable}</Checkbox>
            </Form.Item>
            <Tooltip title={Strings.userUploadCardDataWithDataNetTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
          <div className="flex items-center flex-1">
            <Form.Item
              name="uploadCardEvidenceWithDataNet"
              valuePropName="checked"
              label={Strings.uploadCardEvidenceWithDataNet}
            >
              <Checkbox value={1}>{Strings.enable}</Checkbox>
            </Form.Item>
            <Tooltip title={Strings.userUploadCardEvidenceWithDataNetTooltip}>
              <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center flex-1">
          <Form.Item
            name="roles"
            validateFirst
            rules={[{ required: true, message: Strings.requiredRoles }]}
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
        <Form.Item
          label={
            <p>
              {Strings.site} ({Strings.rfc}) - {Strings.userLicense} -{" "}
              <span className="rounded-xl p-0.5 text-white bg-gray-600">
                Current users
              </span>{" "}
              /{" "}
              <span className="rounded-xl p-0.5 text-white bg-gray-800">
                User quantity
              </span>
            </p>
          }
          name="siteId"
          validateFirst
          rules={[{ required: true, message: Strings.requiredSite }]}
          className="mr-1"
        >
          <Select
            size="large"
            placeholder={Strings.site}
            value={selectedSite}
            onChange={setSelectedSite}
            options={siteOptions}
            showSearch
            filterOption={(input, option) => {
              if (!option) {
                return false;
              }
              return option.labelText
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
          />
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
        <Form.Item
          name="status"
          label = {Strings.statusUserLabel}
          validateFirst
          rules={[{ required: true, message: Strings.requiredStatus }]}
          className="w-60"
        >
          <Select
            size="large"
            placeholder={Strings.statusPlaceholder}
            options={statusOptions}
          />
        </Form.Item>
      </div>
    </Form>
  );
};

export default UpdateUserForm;
