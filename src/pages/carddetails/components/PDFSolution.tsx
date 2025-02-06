import Strings from "../../../utils/localizations/Strings";
import { CardDetailsInterface } from "../../../data/card/card";
import {
  formatDate,
  getDaysBetween,
} from "../../../utils/Extensions";
import { Divider, Typography } from "antd";

import { Row, Col } from "antd";

const { Text } = Typography;

interface PDFSolutionProps {
  data: CardDetailsInterface;
}

const PDFSolution: React.FC<PDFSolutionProps> = ({ data }) => {
  const { card } = data;

  return (

    <div className="grid grid-rows-5 gap-y-4 gap-x-8 sm:grid-rows-none sm:gap-4 sm:px-4">

      <Divider orientation="left" style={{ borderColor: "#808080" }}>
        <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
          {Strings.provisionalSolution}
        </Text>
      </Divider>


      <Row gutter={15}>

        <Col span={12}>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-xl md:text-xl">
              {Strings.tagDate}
            </span>
            <p className="text-xl md:text-xl">
              {formatDate(card.cardProvisionalSolutionDate) || Strings.NA}
            </p>
          </div>

        </Col>

        <Col span={12}>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-xl md:text-xl">
              {Strings.tagDays}
            </span>
            <p className="text-xl md:text-xl">
              {getDaysBetween(card.createdAt, card.cardProvisionalSolutionDate) ||
                Strings.ceroDays}
            </p>
          </div>

        </Col>

      </Row>


      <Row gutter={15}>

        <Col span={8}>

          <div className="flex flex-col">
            <span className="font-semibold text-xl md:text-xl">
              {Strings.appProvisionalUser}
            </span>
            <p className="text-left px-1 text-xl md:text-xl">
              {card.userAppProvisionalSolutionName || Strings.NA}
            </p>
          </div>

        </Col>

        <Col span={8}>

          <div className="flex flex-col">
            <span className="font-semibold text-xl md:text-xl">
              {Strings.tagProvisionalUser}
            </span>
            <p className="text-left px-1 text-xl md:text-xl">
              {card.userProvisionalSolutionName || Strings.NA}
            </p>
          </div>

        </Col>

        <Col span={8}>

          <div className="flex flex-col">
            <span className="font-semibold text-xl md:text-xl">
              {Strings.tagProvisionalSoluitonApplied}
            </span>
            <p className="text-left px-1 text-xl md:text-xl">
              {card.commentsAtCardProvisionalSolution || Strings.NA}
            </p>
          </div>

        </Col>

      </Row>


    </div>
  );
};

export default PDFSolution;
