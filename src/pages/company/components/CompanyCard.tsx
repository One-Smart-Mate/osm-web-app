import React from "react";
import { Company } from "../../../data/company/company";
import { Badge, Button, Card, Typography } from "antd";
import CompanyForm, { CompanyFormType } from "./CompanyForm";
import AnatomySingleCollapsable from "../../components/AnatomySingleCollapsable";
import AnatomySection from "../../components/AnatomySection";
import Strings from "../../../utils/localizations/Strings";
import {
  BsBuildingAdd,
  BsDiagram3,
  BsFiles,
  BsMailbox,
  BsPerson,
  BsPhone,
  BsPinMap,
  BsTelephone,
  BsTelephoneOutbound,
} from "react-icons/bs";
import { getStatusAndText } from "../../../utils/Extensions";
import Constants from "../../../utils/Constants";
import { navigateWithProps } from "../../../routes/RoutesExtensions";

interface CompanyCardProps {
  company: Company;
  onComplete?: () => void;
}

const CompanyCard = ({
  company,
  onComplete,
}: CompanyCardProps): React.ReactElement => {
  const navigate = navigateWithProps();

  return (
    <Card
      hoverable
      className="rounded-xl shadow-md"
      title={<Typography.Title level={5}>{company.name}</Typography.Title>}
      cover={
        <img
          alt={company.name}
          style={{ width: "auto", height: 200 }}
          src={company.logo}
        />
      }
      actions={[
        <Button
          type="primary"
          onClick={() =>
            navigate({
              path: Constants.ROUTES_PATH.sites,
              companyId: company.id,
              companyName: company.name,
              companyAddress: company.address,
              companyPhone: company.phone,
              companyLogo: company.logo,
            })
          }
        >
          {Strings.viewSites}
        </Button>,
        <CompanyForm
          onComplete={() => {
            if (onComplete) {
              onComplete();
            }
          }}
          formType={CompanyFormType.UPDATE}
          data={company}
        />,
      ]}
    >
      <AnatomySingleCollapsable
        children={
          <div>
            <AnatomySection
              title={Strings.name}
              label={company.name}
              icon={<BsBuildingAdd />}
            />
            <AnatomySection
              title={Strings.rfc}
              label={company.rfc}
              icon={<BsFiles />}
            />
            <AnatomySection
              title={Strings.companyAddress}
              label={company.address}
              icon={<BsPinMap />}
            />
            <AnatomySection
              title={Strings.contact}
              label={company.contact}
              icon={<BsPerson />}
            />
            <AnatomySection
              title={Strings.position}
              label={company.position}
              icon={<BsDiagram3 />}
            />
            <AnatomySection
              title={Strings.phone}
              label={company.phone}
              icon={<BsTelephone />}
            />
            <AnatomySection
              title={Strings.extension}
              label={company.extension}
              icon={<BsTelephoneOutbound />}
            />
            <AnatomySection
              title={Strings.email}
              label={company.email}
              icon={<BsMailbox />}
            />
            <AnatomySection
              title={Strings.cellular}
              label={company.cellular}
              icon={<BsPhone />}
            />
            <AnatomySection
              title={Strings.status}
              label={
                <Badge
                  status={getStatusAndText(company.status).status}
                  text={getStatusAndText(company.status).text}
                />
              }
            />
          </div>
        }
      />
    </Card>
  );
};

export default CompanyCard;
