import { Form, FormInstance, Select } from "antd";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../../core/store";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetUsersByRoleMutation } from "../../../services/userService";
import { useSendCardAssignmentMutation } from "../../../services/mailService";
import { Responsible } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";

interface FormProps {
  form: FormInstance;
  cardId?: number;    
  cardName?: string;  
  card?: any;         
}

const UpdateMechanicForm = ({ form, cardId, cardName, card }: FormProps) => {
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

  const [getUsersByRole] = useGetUsersByRoleMutation();
  const [sendCardAssignment] = useSendCardAssignmentMutation();

  const [ihSisAdmins, setIhSisAdmins] = useState<Responsible[]>([]);
  const [mechanics, setMechanics] = useState<Responsible[]>([]);
  const [localAdmins, setLocalAdmins] = useState<Responsible[]>([]);
  const [localSisAdmins, setLocalSisAdmins] = useState<Responsible[]>([]);
  const [operators, setOperators] = useState<Responsible[]>([]);
  const [externalProviders, setExternalProviders] = useState<Responsible[]>([]);

  const handleSelect = (roleName: string, value: number | undefined) => {
    if (value) {
      const allFields = [
        Constants.ihSisAdmin + Constants.id,
        Constants.mechanic + Constants.id,
        Constants.localAdmin + Constants.id,
        Constants.localSisAdmin + Constants.id,
        Constants.operator + Constants.id,
        Constants.externalProvider + Constants.id,
      ];
      const fieldsToClear = allFields.filter((f) => f !== roleName);
      const objToClear: Record<string, undefined> = {};
      fieldsToClear.forEach((field) => {
        objToClear[field] = undefined;
      });
      form.setFieldsValue(objToClear);
    }
  };

  const onFinish = async (values: any) => {
    
    
    if (finalCardId === undefined || finalCardName === undefined || definitiveSolutionExists) {
      return;
    }
    
    const externalUserId = values[Constants.externalProvider + Constants.id];
    if (externalUserId) {
      try {
        await sendCardAssignment({
          userId: Number(externalUserId),
          cardId: Number(finalCardId),
          cardName: finalCardName,
        }).unwrap();
      } catch (error) {
        throw error;
      }
    } else {
      return;
    }
  };

  useEffect(() => {
    if (!siteId) return;

    const fetchRolesData = async () => {
      try {
        const [
          respIH,
          respMech,
          respLocalAdm,
          respLocalSis,
          respOper,
          respExtProv,
        ] = await Promise.all([
          getUsersByRole({ siteId, roleName: Constants.ihSisAdmin }).unwrap(),
          getUsersByRole({ siteId, roleName: Constants.mechanic }).unwrap(),
          getUsersByRole({ siteId, roleName: Constants.localAdmin }).unwrap(),
          getUsersByRole({ siteId, roleName: Constants.localSisAdmin }).unwrap(),
          getUsersByRole({ siteId, roleName: Constants.operator }).unwrap(),
          getUsersByRole({ siteId, roleName: Constants.externalProvider }).unwrap(),
        ]);

        setIhSisAdmins(respIH);
        setMechanics(respMech);
        setLocalAdmins(respLocalAdm);
        setLocalSisAdmins(respLocalSis);
        setOperators(respOper);
        setExternalProviders(respExtProv);
      } catch (error) {
        throw error;
      }
    };

    fetchRolesData();
  }, [siteId, getUsersByRole]);

  return (
    <Form form={form} onFinish={onFinish}>
      {/* IH_sis_admin */}
      <Form.Item label={Constants.ihSisAdmin} name={Constants.ihSisAdmin + Constants.id}>
        <Select
          placeholder={`${Strings.selectRole} ${Constants.ihSisAdmin}`}
          allowClear
          onChange={(value) => handleSelect(Constants.ihSisAdmin + Constants.id, value)}
        >
          {ihSisAdmins.map((user) => (
            <Select.Option key={user.id} value={Number(user.id)}>
              {user.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* mechanic */}
      <Form.Item label={Constants.mechanic} name={Constants.mechanic + Constants.id}>
        <Select
          placeholder={`${Strings.selectRole} ${Constants.mechanic}`}
          allowClear
          onChange={(value) => handleSelect(Constants.mechanic + Constants.id, value)}
        >
          {mechanics.map((user) => (
            <Select.Option key={user.id} value={Number(user.id)}>
              {user.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* local_admin */}
      <Form.Item label={Constants.localAdmin} name={Constants.localAdmin + Constants.id}>
        <Select
          placeholder={`${Strings.selectRole} ${Constants.localAdmin}`}
          allowClear
          onChange={(value) => handleSelect(Constants.localAdmin + Constants.id, value)}
        >
          {localAdmins.map((user) => (
            <Select.Option key={user.id} value={Number(user.id)}>
              {user.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* local_sis_admin */}
      <Form.Item label={Constants.localSisAdmin} name={Constants.localSisAdmin + Constants.id}>
        <Select
          placeholder={`${Strings.selectRole} ${Constants.localSisAdmin}`}
          allowClear
          onChange={(value) => handleSelect(Constants.localSisAdmin + Constants.id, value)}
        >
          {localSisAdmins.map((user) => (
            <Select.Option key={user.id} value={Number(user.id)}>
              {user.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* operator */}
      <Form.Item label={Constants.operator} name={Constants.operator + Constants.id}>
        <Select
          placeholder={`${Strings.selectRole} ${Constants.operator}`}
          allowClear
          onChange={(value) => handleSelect(Constants.operator + Constants.id, value)}
        >
          {operators.map((user) => (
            <Select.Option key={user.id} value={Number(user.id)}>
              {user.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* external_provider */}
      <Form.Item label={Constants.externalProvider} name={Constants.externalProvider + Constants.id}>
        <Select
          placeholder={`${Strings.selectRole} ${Constants.externalProvider}`}
          allowClear
          onChange={(value) => handleSelect(Constants.externalProvider + Constants.id, value)}
        >
          {externalProviders.map((user) => (
            <Select.Option key={user.id} value={Number(user.id)}>
              {user.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};

export default UpdateMechanicForm;
