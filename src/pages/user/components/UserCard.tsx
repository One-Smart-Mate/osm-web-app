import React from "react";
import { Role, UserCardInfo } from "../../../data/user/user";
import { Card, Space, Tag, Tooltip, Typography } from "antd";
import UserForm, { UserFormType } from "./UserForm";
import AssignPositionsButton from "./AssignPositionsButton";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";
import Strings from "../../../utils/localizations/Strings";
import {
  BsClockHistory,
  BsDiagram2,
  BsMailbox,
  BsPersonLinesFill,
} from "react-icons/bs";
import { useLocation } from "react-router-dom";
import { formatDate } from "../../../utils/Extensions";
import useDarkMode from '../../../utils/hooks/useDarkMode';
import { theme } from 'antd';

interface UserCardProps {
  user: UserCardInfo;
  onComplete?: () => void;
}

const UserCard = ({ user, onComplete }: UserCardProps): React.ReactElement => {
  const location = useLocation();
  const siteId = location?.state.siteId || Strings.empty;
  const isDarkMode = useDarkMode();
  const { token } = theme.useToken();

  return (
    <Card
      hoverable
      title={<Typography.Title level={5}>{user.name}</Typography.Title>}
      actions={[
        <UserForm
          formType={UserFormType.UPDATE}
          data={user}
          onComplete={() => {
            if (onComplete) {
              onComplete();
            }
          }}
        />,
        <AssignPositionsButton
          userId={user.id}
          siteId={siteId}
          onPositionsUpdated={() => {
            if (onComplete) {
              onComplete();
            }
          }}
        />,
      ]}
    >
      <AnatomySection
        title={Strings.email}
        label={user.email}
        icon={<BsMailbox />}
      />

      <AnatomySection
        title={Strings.lastLoginWeb}
        label={user.lastLoginWeb ? formatDate(user.lastLoginWeb) : Strings.NA}
        icon={<BsClockHistory />}
      />

      <AnatomySection
        title={Strings.lastLoginApp}
        label={user.lastLoginApp ? formatDate(user.lastLoginApp)  : Strings.NA}
        icon={<BsClockHistory />}
      />

      <AnatomySection
        title={Strings.status}
        label={
          <Tag color={user.status == Strings.activeStatus ? "green" : "red"}>
            {user.status == Strings.activeStatus
              ? Strings.active
              : Strings.inactive}
          </Tag>
        }
      />

      <AnatomySection
        title={Strings.roles}
        label={
          <Space wrap>
            {user.roles.map((role: Role) => (
              <Tooltip key={role.id} title={role.name}>
                <Tag color="blue" style={{ fontSize: 10 }}>
                  {role.name}
                </Tag>
              </Tooltip>
            ))}
          </Space>
        }
        icon={<BsPersonLinesFill />}
      />
      <AnatomySection
        title={Strings.position}
        label={
          <Space wrap>
            {user.positions.length > 0 ? (
              user.positions.map((position) => (
                <Tooltip key={position.id} title={position.description}>
                  <Tag
                    color="default"
                    style={{
                      backgroundColor: isDarkMode ? token.colorBgBase : "#f0f0f0",
                      color: isDarkMode ? token.colorText : "#595959",
                      fontSize: 10,
                    }}
                  >
                    {position.name}
                  </Tag>
                </Tooltip>
              ))
            ) : (
              <p style={{ fontSize: 12 }}>{Strings.noPositionsAvailable}</p>
            )}
          </Space>
        }
        icon={<BsDiagram2 />}
      />
    </Card>
  );
};

export default UserCard;
