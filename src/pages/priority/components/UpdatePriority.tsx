import { useState } from "react";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import { Button, Form, Spin } from "antd";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../../utils/Notifications";
import { useAppDispatch } from "../../../core/store";
import {
  resetRowData,
  setPriorityUpdatedIndicator,
  setRowData,
} from "../../../core/genericReducer";
import ModalUpdateForm from "../../../components/ModalUpdateForm";
import {
  useGetPriorityMutation,
  useUpdatePriorityMutation,
} from "../../../services/priorityService";
import { UpdatePriorityReq } from "../../../data/priority/priority.request";
import UpdatePriorityForm from "./UpdatePriorityForm";
import { isRedesign } from "../../../utils/Extensions";

interface ButtonEditProps {
  priorityId: string;
}

const UpdatePriority = ({ priorityId }: ButtonEditProps) => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalIsLoading, setModalLoading] = useState(false);
  const [dataIsLoading, setDataLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [getPriority] = useGetPriorityMutation();
  const [UpdatePriority] = useUpdatePriorityMutation();

  const handleOnClickEditButton = async () => {
    setDataLoading(true);
    const site = await getPriority(priorityId).unwrap();
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
      const priorityToUpdate = new UpdatePriorityReq(
        Number(values.id),
        values.priorityCode,
        values.priorityDescription,
        Number(values.priorityDays),
        values.status
      );
      await UpdatePriority(priorityToUpdate).unwrap();
      setModalOpen(false);
      dispatch(setPriorityUpdatedIndicator());
      handleSucccessNotification(NotificationSuccess.UPDATE);
    } catch (error) {
      console.log("Error during update:", error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      {isRedesign() ?  <Button onClick={handleOnClickEditButton} type="primary">
        {Strings.edit}
      </Button> : <CustomButton onClick={handleOnClickEditButton} type="edit">
        {Strings.edit}
      </CustomButton>}
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnUpdateFormFinish(values);
        }}
      >
        <ModalUpdateForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={UpdatePriorityForm}
          title={Strings.updatePriority}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
      <Spin spinning={dataIsLoading} fullscreen />
    </>
  );
};

export default UpdatePriority;
