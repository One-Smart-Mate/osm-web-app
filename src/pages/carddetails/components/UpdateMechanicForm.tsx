import { Form, FormInstance, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { useAppSelector } from "../../../core/store";
import { useEffect, useState } from "react";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetSiteUsersMutation } from "../../../services/userService";
import { useSendCardAssignmentMutation } from "../../../services/mailService";
import { useUpdateCardMechanicMutation } from "../../../services/cardService";
import { UserTable } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";
import { notification } from "antd";

interface FormProps {
  form: FormInstance;
}

const UpdateMechanicForm = ({ form }: FormProps) => {
  const [getMechanics] = useGetSiteMechanicsMutation();
  const siteId = useAppSelector(selectSiteId);
  const location = useLocation();
  const state = (location.state as { cardId?: number; cardName?: string; card?: any }) || {};
  const finalCardId = cardId !== undefined ? cardId : state.cardId;
  const finalCardName = cardName !== undefined ? cardName : state.cardName;

  const cardFromState = card !== undefined ? card : (state.card || {});
  const definitiveSolutionExists =
    cardFromState.userAppDefinitiveSolutionId != null &&
    cardFromState.userAppDefinitiveSolutionName != null &&
    String(cardFromState.userAppDefinitiveSolutionId).trim() !== "" &&
    cardFromState.userAppDefinitiveSolutionName.trim() !== "";

  const [getSiteUsers] = useGetSiteUsersMutation();
  const [sendCardAssignment] = useSendCardAssignmentMutation();
  const [updateCardMechanic] = useUpdateCardMechanicMutation();

  const [siteUsers, setSiteUsers] = useState<UserTable[]>([]);
  const [, setLoading] = useState(false);


  const fetchSiteUsers = async () => {
    try {
      const response = await getSiteUsers(siteId).unwrap();
      setSiteUsers(response);
    } catch (error) {
      console.log("Error fetching site users:", error);
      notification.error({
        message: "Fetching Error",
        description: "Error fetching site users:",
        placement: "topRight",
      });
      
    }
  };
  useEffect(() => {
    if (!siteId) return;
    fetchSiteUsers();
  }, [siteId, getSiteUsers]);

  const onFinish = async (values: any) => {
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
    setLoading(true);
    try {
      const currentUserId = selectedUserId; 
      await updateCardMechanic({
        cardId: Number(finalCardId),
        mechanicId: Number(selectedUserId),
        idOfUpdatedBy: currentUserId,
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
      }
    } catch (error) {
      console.log("Error during card mechanic update:", error);
      notification.error({
        message: "Update Error",
        description: "Error during card mechanic update",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form}>
      <div className="flex flex-row">
        <Form.Item
          name="mechanicId"
          validateFirst
          rules={[{ required: true, message: Strings.requiredMechanic }]}
          className="flex-1"
        >
          <Select size="large" placeholder={Strings.mechanic}>
            {selectOptions()}
          </Select>
        </Form.Item>
      </div>
    </Form>
  );
};

export default UpdateMechanicForm;
