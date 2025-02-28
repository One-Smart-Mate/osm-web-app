import { Form } from "antd";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import ModalForm from "../../../components/ModalForm";
import { useState } from "react";
import { useCreateLevelMutation } from "../../../services/levelService";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../../utils/Notifications";
import { CreateNode } from "../../../data/level/level.request";
import { useAppDispatch, useAppSelector } from "../../../core/store";
import {
  selectSiteId,
  setLevelCreatedIndicator,
} from "../../../core/genericReducer";
import RegisterLevelForm from "./RegisterLevelForm";
interface Props {
  superiorId: string;
  nodesName: string[];
}

const RegisterNodeButton = ({ superiorId, nodesName }: Props) => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [registerLevel] = useCreateLevelMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const siteId = useAppSelector(selectSiteId);
  const dispatch = useAppDispatch();

  const handleOnClickCreateButton = () => {
    setModalOpen(true);
  };
  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      setModalOpen(false);
    }
  };
  const handleOnFormCreateFinish = async (values: any) => {
    try {
      setModalLoading(true);
      if (values.responsibleId && values.responsibleId !== "0") {
        values.responsibleId = Number(values.responsibleId);
      } else {
        values.responsibleId = null;
      }
      await registerLevel(
        new CreateNode(
          values.name.trim(),
          values.description.trim(),
          values.responsibleId,
          Number(siteId),
          Number(superiorId),
          values.levelMachineId && values.levelMachineId.trim(),
          values.notify ? 1 : 0
        )
      ).unwrap();
      setModalOpen(false);
      dispatch(setLevelCreatedIndicator());
      handleSucccessNotification(NotificationSuccess.REGISTER);
    } catch (error) {
      console.log('Error during level creation:', error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };
  return (
    <>
      <CustomButton
        type="action"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          handleOnClickCreateButton();
          event.stopPropagation();
        }}
      >
        {Strings.createNode}
      </CustomButton>
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnFormCreateFinish(values);
        }}
      >
        <ModalForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={RegisterLevelForm}
          title={`${Strings.createNodefor} - ${nodesName.join(" - ")}`}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
    </>
  );
};

export default RegisterNodeButton;
