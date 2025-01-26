import { useEffect, useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetCardDetailsMutation,
  useGetCardNotesMutation,
} from "../../../services/cardService";
import { CardDetailsInterface } from "../../../data/card/card";
import { UnauthorizedRoute } from "../../../utils/Routes";
import { useAppDispatch, useAppSelector } from "../../../core/store";
import {
  resetCardUpdatedIndicator,
  selectCardUpdatedIndicator,
  setSiteId,
} from "../../../core/genericReducer";
import { Note } from "../../../data/note";
import { Card, Col, Row } from "antd";
import NoteCollapseV2 from "./NoteCollapseV2";
import { Divider, Typography } from "antd";
import PDFInfo from "./PDFInfo";
import PDFSolution from "./PDFSolution";
import PDFDefinitive from "./PDFDefinitive";

const { Text } = Typography;

const PdfContent = () => {
  const [getCardDetails] = useGetCardDetailsMutation();
  const [getNotes] = useGetCardNotesMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<CardDetailsInterface | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const dispatch = useAppDispatch();
  const cardId = location?.state?.cardId || Strings.empty;
  const isCardUpdated = useAppSelector(selectCardUpdatedIndicator);
  const [isLoading, setLoading] = useState(false);

  const storedCompanyInfo = JSON.parse(sessionStorage.getItem("companyInfo") || "{}");
 

  useEffect(() => {
    if (isCardUpdated) {
      handleGetCards();
      dispatch(resetCardUpdatedIndicator());
    }
  }, [isCardUpdated, dispatch]);

  const handleGetCards = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    const [responseData, responseNotes] = await Promise.all([
      getCardDetails(cardId).unwrap(),
      getNotes(cardId).unwrap(),
    ]);
    setData(responseData);
    setNotes(responseNotes);
    dispatch(setSiteId(responseData.card.siteId));
    setLoading(false);
  };

  useEffect(() => {
    handleGetCards();
  }, []);

  return (

    <div className="flex flex-col px-4 mx-10 my-10">
      <div className="mb-18">
        <div style={{ marginBottom: '50px' }}></div>
        <Row align="middle" style={{ width: '100%' }}>

          {/* Left column with the company information */}
          <Col
            span={18}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            <h1 style={{ fontSize: '35px', fontWeight: 'bold' }}>
              {storedCompanyInfo.companyName || 'Empresa Desconocida'}
            </h1>
            <span style={{ fontSize: '20px', marginBottom: '8px' }}>
              {storedCompanyInfo.companyAddress || 'Dirección desconocida'}
            </span>
            <span style={{ fontSize: '20px' }}>
              {storedCompanyInfo.companyPhone || 'Teléfono desconocido'}
            </span>
          </Col>

          {/* Right column with the logo of the company */}
          <Col span={5} style={{ textAlign: 'right' }}>
            <img
              src={storedCompanyInfo.companyLogo || 'LogoDesconocido.png'}
              alt="Logo de la empresa"
              style={{ maxWidth: '150px', maxHeight: '150px' }}
            />
          </Col>
        </Row>
      </div>

      <div>
        {data ? (
          <>
            <div className="mb-18">
              <PDFInfo data={data} />
            </div>
            <div className="mb-18">
              <PDFSolution data={data} />
            </div>

            <div className="mb-18">
              <PDFDefinitive data={data} />
            </div>


          </>
        ) : (
          <LoadingCard />
        )}

        <Divider style={{ borderColor: "#808080" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
            {Strings.changeLogDivider}
          </Text>
        </Divider>

        <div className="flex flex-col items-center w-full m-3">
          {!isLoading ? <NoteCollapseV2 data={notes} /> : <LoadingCard />}
        </div>
      </div>
    </div>
  );
};

const LoadingCard = () => (
  <Card
    className="h-full bg-gray-100 rounded-xl shadow-md w-full"
    loading={true}
  />
);

export default PdfContent;
