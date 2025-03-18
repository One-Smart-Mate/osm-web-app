import { useState } from "react";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import { Form, Spin } from "antd";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../../utils/Notifications";
import { useAppDispatch } from "../../../core/store";
import {
  resetRowData,
  setRowData,
  setUserUpdatedIndicator,
} from "../../../core/genericReducer";
import ModalUpdateForm from "../../../components/ModalUpdateForm";
import UpdateUserForm from "./UpdateUserForm";
import {
  useGetUserMutation,
  useUpdateUserMutation,
} from "../../../services/userService";
import { UpdateUser } from "../../../data/user/user.request";
import UpdateSiteUserForm from "./UpdateSiteUserForm";

interface ButtonEditProps {
  userId: string;
  siteId: string;
  isSiteUserstable: boolean;
}

const UpdateUserButton = ({
  userId,
  siteId,
  isSiteUserstable,
}: ButtonEditProps) => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalIsLoading, setModalLoading] = useState(false);
  const [dataIsLoading, setDataLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [getUser] = useGetUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleOnClickEditButton = async () => {
    setDataLoading(true);
    const user = await getUser(userId).unwrap();
    dispatch(setRowData(user));
    setModalOpen(true);
    setDataLoading(false);
  };

  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      dispatch(resetRowData());
      setModalOpen(false);
    }
  };

  const handleOnUpdateFormFinish = async (values: any) => {
    try {
      setModalLoading(true);
      await updateUser(
        new UpdateUser(
          Number(values.id),
          values.name.trim(),
          values.email.trim(),
          Number(siteId),
          values.password,
          values.uploadCardDataWithDataNet ? 1 : 0,
          values.uploadCardEvidenceWithDataNet ? 1 : 0,
          values.roles,
          values.status
        )
      ).unwrap();
      setModalOpen(false);
      dispatch(setUserUpdatedIndicator());
      handleSucccessNotification(NotificationSuccess.UPDATE);
    } catch (error) {
      console.log("Error updating user:", error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <CustomButton onClick={handleOnClickEditButton} type="edit">
        {Strings.edit}
      </CustomButton>
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnUpdateFormFinish(values);
        }}
      >
        <ModalUpdateForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={isSiteUserstable ? UpdateSiteUserForm : UpdateUserForm}
          title={Strings.updateUser}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
      <Spin spinning={dataIsLoading} fullscreen />
    </>
  );
};

export default UpdateUserButton;
