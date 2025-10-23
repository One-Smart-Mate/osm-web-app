import { Checkbox, Form, FormInstance, Input, Select, Button, App as AntApp } from "antd";
import { Role, UserCardInfo } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { BsLock, BsMailbox, BsPerson, BsCopy, BsKey, BsTelephone} from "react-icons/bs";
import { validateEmailPromise } from "../../../utils/Extensions";
import { useEffect, useState } from "react";
import { useGetRolesMutation } from "../../../services/roleService";
import useCurrentUser from "../../../utils/hooks/useCurrentUser";
import Constants from "../../../utils/Constants";
import AnatomyNotification from "../../components/AnatomyNotification";

// Simple in-memory cache for roles to avoid repeated API calls
let rolesCache: Role[] | null = null;
let rolesCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface UserFormCardProps {
  form: FormInstance;
  initialValues?: UserCardInfo;
  onSubmit: (_values: any) => void;
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
  const { notification } = AntApp.useApp();
  const [fastPassword, setFastPassword] = useState<string>("");
  const [isGeneratingFastPassword, setIsGeneratingFastPassword] = useState(false);

  useEffect(() => {
    handleGetRoles();
  }, []); // Only load roles once when component mounts

  const handleGetRoles = async () => {
    try {
      let rolesResponse: Role[];

      // Check if cache is still valid
      const now = Date.now();
      const isCacheValid = rolesCache && (now - rolesCacheTimestamp) < CACHE_DURATION;

      if (isCacheValid) {
        // Use cached roles - much faster!
        rolesResponse = rolesCache!;
      } else {
        // Fetch from API and update cache
        rolesResponse = await getRoles().unwrap();
        rolesCache = rolesResponse;
        rolesCacheTimestamp = now;
      }

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
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  // Separate effect for setting form values - runs when initialValues change
  useEffect(() => {
    if (roles.length === 0) return; // Wait for roles to load first

    if (initialValues) {
      const formValues: any = {
        name: initialValues.name,
        email: initialValues.email,
        id: initialValues.id,
        phoneNumber: initialValues.phoneNumber || '',
        translation: initialValues.translation || Constants.es,
        roles: initialValues.roles.filter((rol,_) => rol.name != Constants.ihSisAdmin).map((rol, _) => rol.id),
        status: initialValues.status,
        enableEvidences: initialValues.uploadCardDataWithDataNet && initialValues.uploadCardEvidenceWithDataNet
      };

      // Include fastPassword if it exists in initialValues
      if (initialValues.fastPassword) {
        formValues.fastPassword = initialValues.fastPassword;
      }

      form.setFieldsValue(formValues);
    } else {
      // Set default values for new user creation - only once
      if (roles.length > 0) {
        form.setFieldsValue({
          translation: Constants.es
        });
      }
    }
  }, [initialValues, roles.length, form]); // Use roles.length instead of roles array to avoid unnecessary re-renders

  const statusOptions = [
    { value: Strings.activeStatus, label: Strings.active, key: 1 },
    { value: Strings.inactiveValue, label: Strings.inactive, key: 2 },
    { value: Strings.cancelledStatus, label: Strings.cancelled, key: 3 },
  ];

  const languageOptions = [
    { value: Constants.es, label: Strings.spanish, key: 1 },
    { value: Constants.en, label: Strings.english, key: 2 },
  ];

  const handleGenerateFastPassword = () => {
    setIsGeneratingFastPassword(true);
    try {
      // Generate a random 4-character alphanumeric password (a-z, A-Z, 0-9)
      const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 4; i++) {
        result += alphanumericChars.charAt(Math.floor(Math.random() * alphanumericChars.length));
      }

      setFastPassword(result);
      form.setFieldsValue({ fastPassword: result });

      notification.success({
        message: Strings.success,
        description: `Fast Password: ${result} (Alfanumérico: a-z, A-Z, 0-9)`,
      });
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setIsGeneratingFastPassword(false);
    }
  };

  const handleCopyFastPassword = async () => {
    if (fastPassword) {
      try {
        await navigator.clipboard.writeText(fastPassword);
        notification.success({
          message: Strings.success,
          description: Strings.fastPasswordCopied,
        });
      } catch (error) {
        AnatomyNotification.error(notification, error);
      }
    }
  };

  // Initialize fast password from initial values when editing
  useEffect(() => {
    if (initialValues && initialValues.fastPassword) {
      setFastPassword(initialValues.fastPassword);
    } else if (!initialValues) {
      // Only clear when creating new user
      setFastPassword("");
      form.setFieldsValue({ fastPassword: "" });
    }
  }, [initialValues, form]);

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
            name="phoneNumber"
            label={Strings.phoneNumber}
            className="flex-1"
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value.trim() === '') {
                    return Promise.reject(new Error(Strings.requiredPhoneNumber));
                  }
                  if (!/^[0-9]{10,15}$/.test(value.trim())) {
                    return Promise.reject(new Error(Strings.invalidPhoneNumber));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              maxLength={15}
              addonBefore={<BsTelephone />}
              placeholder={Strings.phoneNumber}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.phoneNumberTooltip} />
          <Form.Item
            name="translation"
            label={Strings.language}
            className="flex-1"
            rules={[]}
          >
            <Select
              placeholder={Strings.selectLanguage}
              options={languageOptions}
              // Backend now supports translation updates!
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.languageTooltip} />
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

        {/* Fast Password Section - Only show for update mode */}
        {enableStatus && (
          <div className="flex flex-row flex-wrap">
            <Form.Item
              name="fastPassword"
              label={Strings.fastPassword}
              className="flex-1"
                              rules={[
                  {
                    pattern: /^[a-zA-Z0-9]{4}$/,
                    message: Strings.fastPasswordValidation,
                  },
                ]}
            >
              <Input
                value={fastPassword}
                onChange={(e) => {
                  // Only allow alphanumeric characters (a-z, A-Z, 0-9) and limit to 4 chars
                  const filteredValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4);
                  setFastPassword(filteredValue);
                  form.setFieldsValue({ fastPassword: filteredValue });
                }}
                addonBefore={<BsKey />}
                placeholder={Strings.fastPassword}
                maxLength={4}
                addonAfter={
                  <div className="flex gap-1">
                    <Button
                      type="text"
                      icon={<BsCopy />}
                      onClick={handleCopyFastPassword}
                      disabled={!fastPassword}
                      size="small"
                      title={Strings.copy}
                    />
                  </div>
                }
              />
            </Form.Item>
            <div className="flex items-end pb-6">
              <Button
                type="primary"
                onClick={handleGenerateFastPassword}
                loading={isGeneratingFastPassword}
                className="ml-2"
              >
                {Strings.generateFastPassword}
              </Button>
            </div>
            <AnatomyTooltip title={Strings.fastPasswordTooltip} />
          </div>
        )}

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
