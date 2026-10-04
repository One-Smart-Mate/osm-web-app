import { Form, Input, Modal, theme, Typography, App as AntApp } from "antd";
import React, { useState } from "react";
import { BsLock, BsMailbox, BsPerson, BsPersonVcard } from "react-icons/bs";
import useCurrentUser from "../../../utils/hooks/useCurrentUser";
import Strings from "../../../utils/localizations/Strings";
import AnatomyTooltip from "../AnatomyTooltip";
import { validateEmailPromise } from "../../../utils/Extensions";
import AnatomyNotification, {
  AnatomyNotificationType,
} from "../AnatomyNotification";
import { useUpdateUserPartialMutation } from "../../../services/userService";
import { useAppDispatch } from "../../../core/store";
import { setCredentials } from "../../../core/authReducer";

const EditProfileButton = (): React.ReactElement => {
  const { user, setUser } = useCurrentUser();
  const [openModal, setOpenModal] = useState(false);
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const { notification } = AntApp.useApp();
  const [updateUserPartial] = useUpdateUserPartialMutation();
  const dispatch = useAppDispatch();

  const onFinish = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const name = values.name.trim();
      const email = values.email.trim().toLowerCase();

      await updateUserPartial({
        id: Number(user.userId),
        name,
        email,
        ...(values.password ? { password: values.password.trim() } : {}),
        ...(values.fastPassword
          ? { fastPassword: values.fastPassword.trim() }
          : {}),
      }).unwrap();

      setUser({
        name,
        email,
      });
      dispatch(setCredentials({ ...user, name, email }));
      setOpenModal(false);
      form.resetFields();
      AnatomyNotification.success(
        notification,
        AnatomyNotificationType._UPDATE,
      );
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitValues = () => {
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      password: undefined,
      confirmPassword: undefined,
      fastPassword: undefined,
    });
    setOpenModal(true);
  };

  return (
    <>
      <div
        className="flex flex-wrap flex-row items-center p-2"
        onClick={() => handleInitValues()}
      >
        <BsPersonVcard className="mr-2" color={token.colorPrimary} size={18} />
        <Typography.Text style={{ color: token.colorPrimary }}>
          {Strings.editUser}
        </Typography.Text>
      </div>

      <Modal
        title= {Strings.editUser}
        open={openModal}
        okText={Strings.save}
        onCancel={() => setOpenModal(false)}
        onOk={() => onFinish()}
        loading={isLoading}
      >
        <Form form={form} layout="vertical">
          <div className="flex flex-row item-scenter">
            <Form.Item
              name="name"
              validateFirst
              className="flex-1"
              label={Strings.name}
              rules={[
                { required: true, message: Strings.requiredUserName },
                { max: 50 },
                { pattern: /^[A-Za-zñÑ\s]+$/, message: Strings.onlyLetters },
              ]}
            >
              <Input
                maxLength={50}
                showCount
                addonBefore={<BsPerson />}
                placeholder={Strings.name}
              />
            </Form.Item>
            <AnatomyTooltip title={Strings.userNameTooltip} />
          </div>
          <div className="flex flex-row item-scenter">
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
                showCount
                addonBefore={<BsMailbox />}
                placeholder={Strings.email}
              />
            </Form.Item>
            <AnatomyTooltip title={Strings.userEmailTooltip} />
          </div>

          <div className="flex flex-row item-scenter">
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
          </div>
          <div className="flex flex-row item-scenter">
            <Form.Item
              name="confirmPassword"
              validateFirst
              label={Strings.confirmPassword}
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
              className="flex-1"
            >
              <Input.Password
                addonBefore={<BsLock />}
                placeholder={Strings.confirmPassword}
              />
            </Form.Item>
            <AnatomyTooltip title={Strings.userConfirmPasswordTooltip} />
          </div>

          <div className="flex flex-row item-scenter">
            <Form.Item
              name="fastPassword"
              validateFirst
              label={Strings.fastPassword}
              rules={[
                {
                  validator(_, value) {
                    if (value && !/^[a-zA-Z0-9]{4}$/.test(value)) {
                      return Promise.reject(
                        new Error(Strings.fastPasswordValidation)
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              className="flex-1"
            >
              <Input.Password
                addonBefore={<BsLock />}
                placeholder={Strings.fastPassword}
                maxLength={4}
                showCount
              />
            </Form.Item>
            <AnatomyTooltip title={Strings.fastPassword} />
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default EditProfileButton;
