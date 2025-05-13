import { Badge, Button, Card, Space, Typography } from "antd";
import React from "react";
import { Site } from "../../../data/site/site";
import AnatomySection from "../../components/AnatomySection";
import AnatomySingleCollapsable from "../../components/AnatomySingleCollapsable";
import Strings from "../../../utils/localizations/Strings";
import {
  BsBuildingAdd,
  BsDiagram3,
  BsFiles,
  BsMailbox,
  BsPerson,
  BsPinMap,
  BsTelephone,
  BsTelephoneOutbound,
} from "react-icons/bs";
import SiteForm, { SiteFormType } from "./SiteForm";
import Constants from "../../../utils/Constants";
import useCurrentUser from "../../../utils/hooks/useCurrentUser";
import { getStatusAndText } from "../../../utils/Extensions";
import { navigateWithProps } from "../../../routes/RoutesExtensions";

interface SiteCardProps {
  site: Site;
  companyName?: string;
  onComplete?: () => void;
}

const SiteCard = ({ site, onComplete, companyName }: SiteCardProps): React.ReactElement => {
  const navigate = navigateWithProps();

  const { isIhAdmin } = useCurrentUser();

  const buildActions = (value: Site): [React.ReactNode | undefined] => {
    if (isIhAdmin()) {
      return [
        <Space className="p-2" wrap>
          <SiteForm
            data={value}
            onComplete={() => {
              if (onComplete) {
                onComplete();
              }
            }}
            companyName={companyName ?? Strings.empty}
            formType={SiteFormType.UPDATE}
          />
          <Button
            type="default"
            onClick={() => {
              navigate({
                path: Constants.ROUTES_PATH.charts,
                siteId: value.id,
                siteName: value.name,
              });
            }}
          >
            {Strings.viewCharts}
          </Button>

          <Button
            onClick={() => {
              navigate({
                path: Constants.ROUTES_PATH.cards,
                siteId: value.id,
                siteName: value.name,
              });
            }}
          >
            {Strings.viewCards}
          </Button>

          <Button
            onClick={() => {
              navigate({
                path: Constants.ROUTES_PATH.users,
                siteId: value.id,
                siteName: value.name,
              });
            }}
          >
            {Strings.viewUsers}
          </Button>

          <Button
            onClick={() => {
              navigate({
                path: Constants.ROUTES_PATH.priorities,
                siteId: value.id,
                siteName: value.name,
              });
            }}
          >
            {Strings.viewPriorities}
          </Button>

          <Button
            onClick={() => {
              navigate({
                path: Constants.ROUTES_PATH.cardTypes,
                siteId: value.id,
                siteName: value.name,
              });
            }}
          >
            {Strings.viewCardTypes}
          </Button>

          <Button
            onClick={() => {
              navigate({
                path: Constants.ROUTES_PATH.levels,
                siteId: value.id,
                siteName: value.name,
              });
            }}
          >
            {Strings.viewLevels}
          </Button>

          <Button
            onClick={() => {
              navigate({
                path: Constants.ROUTES_PATH.positions,
                siteId: value.id,
                siteName: value.name,
              });
            }}
          >
            {Strings.viewPositions}
          </Button>
        </Space>,
      ];
    }
    return [undefined];
  };

  return (
    <Card
      hoverable
      className="rounded-xl shadow-md"
      title={<Typography.Title level={5}>{site.name}</Typography.Title>}
      cover={
        <img
          alt={site.name}
          style={{ width: "auto", height: 200 }}
          src={site.logo}
        />
      }
      actions={buildActions(site)}
    >
      <AnatomySingleCollapsable
        children={
          <>
            <AnatomySection
              title={Strings.name}
              label={site.name}
              icon={<BsBuildingAdd />}
            />
            <AnatomySection
              title={Strings.rfc}
              label={site.rfc}
              icon={<BsFiles />}
            />
            <AnatomySection
              title={Strings.companyAddress}
              label={site.address}
              icon={<BsPinMap />}
            />
            <AnatomySection
              title={Strings.contact}
              label={site.contact}
              icon={<BsPerson />}
            />
            <AnatomySection
              title={Strings.position}
              label={site.position}
              icon={<BsDiagram3 />}
            />
            <AnatomySection
              title={Strings.phone}
              label={site.phone}
              icon={<BsTelephone />}
            />
            <AnatomySection
              title={Strings.extension}
              label={site.extension}
              icon={<BsTelephoneOutbound />}
            />
            <AnatomySection
              title={Strings.email}
              label={site.email}
              icon={<BsMailbox />}
            />
            <AnatomySection
              title={Strings.cellular}
              label={site.cellular}
              icon={<BsTelephone />}
            />
            <AnatomySection
              title={Strings.status}
              label={
                <Badge
                  status={getStatusAndText(site.status).status}
                  text={getStatusAndText(site.status).text}
                />
              }
            />
          </>
        }
      />
    </Card>
  );
};

export default SiteCard;
