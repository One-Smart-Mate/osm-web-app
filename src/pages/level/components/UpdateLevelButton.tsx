import { useState } from "react";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import { Form, Spin } from "antd";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../../utils/Notifications";
import { useAppDispatch, useAppSelector } from "../../../core/store";
import {
  resetRowData,
  setLevelUpdatedIndicator,
  setRowData,
  selectCurrentRowData,
} from "../../../core/genericReducer";
import ModalUpdateForm from "../../../components/ModalUpdateForm";
import {
  useGetlevelMutation,
  useUdpateLevelMutation,
} from "../../../services/levelService";
import UpdateLevelForm from "./UpdateLevelForm";
import { UpdateLevel } from "../../../data/level/level.request";

interface ButtonEditProps {
  levelId: string;
}

const UpdateLevelButton = ({ levelId }: ButtonEditProps) => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalIsLoading, setModalLoading] = useState(false);
  const [dataIsLoading, setDataLoading] = useState(false);
  const dispatch = useAppDispatch();
  const rowData = useAppSelector(selectCurrentRowData);
  const [getLevel] = useGetlevelMutation();
  const [updateLevel] = useUdpateLevelMutation();

  const handleOnClickEditButton = async () => {
    setDataLoading(true);
    try {
      const site = await getLevel(levelId).unwrap();
      dispatch(setRowData(site));
      setModalOpen(true);
    } catch (error) {
      console.log("Error in obtaining data:", error);
      handleErrorNotification(error);
    } finally {
      setDataLoading(false);
    }
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
      const priorityToUpdate = new UpdateLevel(
        Number(values.id),
        values.name,
        values.description,
        values.responsibleId !== "0" ? Number(values.responsibleId) : 0,
        values.status,
        values.levelMachineId?.trim() || null,
        values.notify ? 1 : 0
      );
      await updateLevel(priorityToUpdate).unwrap();
      setModalOpen(false);
      dispatch(setLevelUpdatedIndicator());
      handleSucccessNotification(NotificationSuccess.UPDATE);
    } catch (error) {
      console.log("Level update error:", error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <CustomButton
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          handleOnClickEditButton();
          event.stopPropagation();
        }}
        type="edit"
      >
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
          FormComponent={(props) => <UpdateLevelForm {...props} initialValues={rowData} />}
          title={Strings.updateLevel}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
      <Spin spinning={dataIsLoading} fullscreen />
    </>
  );
};

export default UpdateLevelButton;
