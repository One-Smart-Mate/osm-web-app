import { Checkbox, Form, FormInstance, Input, Select } from "antd";
import { Role, UserCardInfo } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { BsLock, BsMailbox, BsPerson } from "react-icons/bs";
import { validateEmailPromise } from "../../../utils/Extensions";
import { useEffect, useState } from "react";
import { useGetRolesMutation } from "../../../services/roleService";
import useCurrentUser from "../../../utils/hooks/useCurrentUser";
import Constants from "../../../utils/Constants";

interface UserFormCardProps {
  form: FormInstance;
  initialValues?: UserCardInfo;
  onSubmit: (values: any) => void;
  enableStatus: boolean;
}

const UserFormCard = ({
  form,
  initialValues,
  onSubmit,
  enableStatus,
}: UserFormCardProps): React.ReactElement => {
  const [getRoles] = useGetRolesMutation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { user } = useCurrentUser();

  useEffect(() => {
    handleGetRoles();
    console.log(initialValues);
  }, []);

  const handleGetRoles = async () => {
    const rolesResponse = await getRoles().unwrap();
    // Filter out the "IH_sis_admin" role from available options
    const hasAdminRole = user?.roles?.some((role: string | Role) =>
      typeof role === "string"
        ? role === Constants.ihSisAdmin
        : role.name === Constants.ihSisAdmin
    );

    const filteredRoles = hasAdminRole
      ? rolesResponse
      : rolesResponse.filter((role) => role.name !== Constants.ihSisAdmin);
    setRoles(filteredRoles);

    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        email: initialValues.email,
        id: initialValues.id,
        roles: initialValues.roles.filter((rol,_) => rol.name != Constants.ihSisAdmin).map((rol, _) => rol.id),
        status: initialValues.status,
        enableEvidences: initialValues.uploadCardDataWithDataNet && initialValues.uploadCardEvidenceWithDataNet
      });
    }
  };

  const statusOptions = [
    { value: Strings.activeStatus, label: Strings.active, key: 1 },
    { value: Strings.inactiveValue, label: Strings.inactive, key: 2 },
  ];

  return (
    <Form form={form} onFinish={onSubmit} layout="vertical">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="name"
            validateFirst
            label={Strings.name}
            className="flex-1"
            rules={[
              { required: true, message: Strings.requiredUserName },
              { max: 50 },
              { pattern: /^[A-Za-zñÑ\s]+$/, message: Strings.onlyLetters },
            ]}
          >
            <Input
              maxLength={50}
              addonBefore={<BsPerson />}
              placeholder={Strings.name}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.userNameTooltip} />
          <Form.Item
            name="email"
            validateFirst
            label={Strings.email}
            className="flex-1"
            rules={[
              { required: true, message: Strings.requiredEmail },
              { validator: validateEmailPromise },
            ]}
          >
            <Input
              maxLength={60}
              addonBefore={<BsMailbox />}
              placeholder={Strings.email}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.userEmailTooltip} />
        </div>
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="password"
            label={Strings.password}
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
            className="flex-1"
          >
            <Input.Password
              addonBefore={<BsLock />}
              placeholder={Strings.updatePassword}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.userPasswordTooltip} />
          <Form.Item
            name="confirmPassword"
            validateFirst
            label={Strings.confirmPassword}
            dependencies={["password"]}
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
            className="flex-1"
          >
            <Input.Password
              addonBefore={<BsLock />}
              placeholder={Strings.confirmPassword}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.userConfirmPasswordTooltip} />
        </div>
        <div className="flex flex-wrap">
          <div className="flex items-center gap-2">
            <Form.Item
              name="enableEvidences"
              valuePropName="checked"
              label={Strings.uploadCardAndEvidenceWithDataNet}
            >
              <Checkbox value={1}>{Strings.enable}</Checkbox>
            </Form.Item>
          </div>
          <AnatomyTooltip
            title={`${Strings.userUploadCardDataWithDataNetTooltip} ${Strings.userUploadCardEvidenceWithDataNetTooltip}`}
          />
        </div>

        <div className="flex flex-wrap">
          <Form.Item
            name="roles"
            label={Strings.roles}
            validateFirst
            className="flex-1"
            rules={[{ required: true, message: Strings.requiredRoles }]}
          >
            <Select
              mode="multiple"
              placeholder={Strings.roles}
              value={selectedRoles}
              onChange={setSelectedRoles}
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.userRolesTooltip} />
        </div>

        {enableStatus && (
          <Form.Item
            name="status"
            label={Strings.status}
            validateFirst
            rules={[{ required: true, message: Strings.requiredStatus }]}
            className="w-60"
          >
            <Select
              placeholder={Strings.statusPlaceholder}
              options={statusOptions}
            />
          </Form.Item>
        )}

        <Form.Item name="id" className="hidden">
          <Input type="hidden" />
        </Form.Item>
      </div>
    </Form>
  );
};
export default UserFormCard;
