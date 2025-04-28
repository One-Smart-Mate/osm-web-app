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
import { selectCurrentUser } from "../../../core/authReducer";
import { QuestionCircleOutlined } from "@ant-design/icons";
import Constants from "../../../utils/Constants";

interface FormProps {
  form: FormInstance;
}

/**
 * UpdateSiteUserForm is a form component for updating a site user.
 * It uses Ant Design's Form component for layout and validation.
 * It fetches roles data and sets initial form values based on current row data.
 * Users can update fields such as name, email, password, roles, and status.
 * There are tooltips for user guidance and validation rules to ensure correct input.
 * The component manages state for roles, selected roles, and password visibility.
 */
const UpdateSiteUserForm = ({ form }: FormProps) => {
  const [getRoles] = useGetRolesMutation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [adminRoleId, setAdminRoleId] = useState<string | null>(null);
  const [userHasAdminRole, setUserHasAdminRole] = useState(false);
  const rowData = useAppSelector(
    selectCurrentRowData
  ) as unknown as UserUpdateForm;
  const currentUser = useAppSelector(selectCurrentUser);

  const handleGetData = async () => {
    const [rolesResponse] = await Promise.all([getRoles().unwrap()]);
    
    const adminRole = rolesResponse.find(role => role.name === Constants.ihSisAdmin);
    if (adminRole) {
      setAdminRoleId(adminRole.id);
    }
    
    const hasAdminRole = adminRole && rowData?.roles?.includes(adminRole.id);
    setUserHasAdminRole(!!hasAdminRole);
    
    const currentUserHasAdminRole = currentUser?.roles?.some((role: string | Role) => 
      typeof role === 'string' 
        ? role === Constants.ihSisAdmin 
        : role.name === Constants.ihSisAdmin
    );
    
    const filteredRoles = hasAdminRole || currentUserHasAdminRole
      ? rolesResponse 
      : rolesResponse.filter(role => role.name !== Constants.ihSisAdmin);
    
    setRoles(filteredRoles);
  };

  useEffect(() => {
    handleGetData();
  }, []);

  useEffect(() => {
    if (roles.length > 0) {
      const formValues = { ...rowData } as any;

      (formValues as any).uploadCardAndEvidenceWithDataNet =
        rowData.uploadCardDataWithDataNet === 1 ||
        rowData.uploadCardEvidenceWithDataNet === 1;

      form.setFieldsValue(formValues);
    }
  }, [roles]);

  // Handle role selection changes to prevent removing admin role if user has it
  const handleRoleChange = (newRoles: string[]) => {
    // If user has admin role and it's being removed, add it back
    if (userHasAdminRole && adminRoleId && !newRoles.includes(adminRoleId)) {
      newRoles.push(adminRoleId);
    }
    
    setSelectedRoles(newRoles);
    form.setFieldsValue({ roles: newRoles });
  };

  // Create a function to disable admin role selection/deselection
  const isRoleDisabled = (roleId: string) => {
    // If this is the admin role ID and user has it, make it read-only
    if (adminRoleId === roleId && userHasAdminRole) {
      return true;
    }
    return false;
  };

  const statusOptions = [
    { value: Strings.activeStatus, label: Strings.active },
    { value: Strings.inactiveValue, label: Strings.inactive },
  ];

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
              rules={[
                {
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    if (value.length < 8) {
                      return Promise.reject(new Error(Strings.passwordLenght));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              className="w-full"
            >
              <Input.Password
                size="large"
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
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-2">
            <Form.Item
              name="uploadCardAndEvidenceWithDataNet"
              valuePropName="checked"
              label={Strings.uploadCardAndEvidenceWithDataNet}
            >
              <Checkbox value={1}>{Strings.enable}</Checkbox>
            </Form.Item>
            <Tooltip
              title={`${Strings.userUploadCardDataWithDataNetTooltip} ${Strings.userUploadCardEvidenceWithDataNetTooltip}`}
            >
              <QuestionCircleOutlined className="text-sm text-blue-500" />
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center">
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
              onChange={handleRoleChange}
              options={roles.map(role => ({
                value: role.id,
                label: role.name,
                disabled: isRoleDisabled(role.id),
              }))}
            />
          </Form.Item>
          <Tooltip title={Strings.userRolesTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-sm text-blue-500" />
          </Tooltip>
        </div>
        <Form.Item
          name="status"
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
        <Form.Item name="id" className="hidden">
          <Input type="hidden" />
        </Form.Item>
      </div>
    </Form>
  );
};

export default UpdateSiteUserForm;
