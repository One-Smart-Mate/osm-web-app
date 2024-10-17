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
  setPreclassifierUpdatedIndicator,
  setRowData,
} from "../../../core/genericReducer";
import ModalUpdateForm from "../../../components/ModalUpdateForm";
import {
  useGetPreclassifierMutation,
  useUpdatePreclassifierMutation,
} from "../../../services/preclassifierService";
import { UpdatePreclassifier } from "../../../data/preclassifier/preclassifier.request";
import UpdatePreclassifierForm from "./UpdatePreclassifierForm";

interface ButtonEditProps {
  preclassifierId: string;
}

const UpdatePreclassierButton = ({ preclassifierId }: ButtonEditProps) => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalIsLoading, setModalLoading] = useState(false);
  const [dataIsLoading, setDataLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [getPreclassifier] = useGetPreclassifierMutation();
  const [updatePreclassifier] = useUpdatePreclassifierMutation();

  const handleOnClickEditButton = async () => {
    setDataLoading(true);
    const site = await getPreclassifier(preclassifierId).unwrap();
    dispatch(setRowData(site));
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
      const priorityToUpdate = new UpdatePreclassifier(
        Number(values.id),
        values.code,
        values.description,
        values.status
      );
      await updatePreclassifier(priorityToUpdate).unwrap();
      setModalOpen(false);
      dispatch(setPreclassifierUpdatedIndicator());
      handleSucccessNotification(NotificationSuccess.UPDATE);
    } catch (error) {
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
          FormComponent={UpdatePreclassifierForm}
          title={Strings.updatePreclassifier}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
      <Spin spinning={dataIsLoading} fullscreen />
    </>
  );
};

export default UpdatePreclassierButton;
