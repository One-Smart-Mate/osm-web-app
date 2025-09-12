import { Form, FormInstance, notification, Select } from "antd";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../../core/store";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetSiteUsersMutation } from "../../../services/userService";
import { useSendCardAssignmentMutation } from "../../../services/mailService";
import { useUpdateCardMechanicMutation } from "../../../services/cardService";
import { UserTable } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";
import AnatomyNotification from "../../components/AnatomyNotification";


interface FormProps {
  form: FormInstance;
  cardId?: number;
  cardName?: string;
  card?: any;
}

const UpdateMechanicForm = ({ form, cardId, cardName, card }: FormProps) => {
  const siteId = useAppSelector(selectSiteId);
  const location = useLocation();
  const state =
    (location.state as { cardId?: number; cardName?: string; card?: any }) ||
    {};
  const finalCardId = cardId !== undefined ? cardId : state.cardId;
  const finalCardName = cardName !== undefined ? cardName : state.cardName;

  const cardFromState = card !== undefined ? card : state.card || {};
  const definitiveSolutionExists =
    cardFromState.userAppDefinitiveSolutionId != null &&
    cardFromState.userAppDefinitiveSolutionName != null &&
    String(cardFromState.userAppDefinitiveSolutionId).trim() !== "" &&
    cardFromState.userAppDefinitiveSolutionName.trim() !== "";

  const [getSiteUsers] = useGetSiteUsersMutation();
  const [sendCardAssignment] = useSendCardAssignmentMutation();
  const [updateCardMechanic] = useUpdateCardMechanicMutation();

  const [siteUsers, setSiteUsers] = useState<UserTable[]>([]);

  const fetchSiteUsers = async () => {
    try {
      console.log(`Fetching users for siteId: ${siteId}`);
      const response = await getSiteUsers(siteId).unwrap();
      setSiteUsers(response);
      console.log("Users fetched successfully:", response);
    } catch (error) {
      console.error("Error fetching site users:", error);
      // Here you could add a user-facing notification if desired
    }
  };

  useEffect(() => {
    if (!siteId) {
      console.warn("No siteId available in UpdateMechanicForm.");
      return;
    }
    fetchSiteUsers();
  }, [siteId]);

  const onFinish = async (values: any) => {
    try {
      const selectedUserId = values.mechanicId;

    if (!selectedUserId) {
      return;
    }
    if (!finalCardId || !finalCardName || definitiveSolutionExists) {
      return;
    }
    const selectedUser = siteUsers.find((user) => user.id === selectedUserId);
    if (!selectedUser) {
      return;
    }

      const currentUserId = selectedUserId;
      await updateCardMechanic({
        cardId: Number(finalCardId),
        mechanicId: Number(selectedUserId),
        idOfUpdatedBy: Number(currentUserId),
      }).unwrap();

      const isExternalProvider = selectedUser.roles.some(
        (role) => role.name === Constants.externalProvider
      );
      if (isExternalProvider) {
        await sendCardAssignment({
          userId: Number(selectedUserId),
          cardId: Number(finalCardId),
          cardName: finalCardName,
        }).unwrap();
      } else {
        return;
      }
    } catch (error) {
      AnatomyNotification.error(notification, error);
    }
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item
        label={Strings.assignUser}
        name={Constants.mechanic + Constants.id}
      >
        <Select 
          placeholder={`${Strings.selectRole} `} 
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) => {
            if (!option || !option.children) return false;
            const childrenText = String(option.children);
            return childrenText.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }}
          style={{ width: '100%' }}
        >
          {siteUsers.map((user) => (
            <Select.Option key={user.id} value={user.id}>
              {user.name}{" "}
              {user.roles &&
              Array.isArray(user.roles) &&
              user.roles.length > 0
                ? `(${user.roles.map((role) => role.name).join(", ")})`
                : ""}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};

export default UpdateMechanicForm;
