import { useEffect, useState } from "react";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useGetCardDetailsMutation,
  useGetCardNotesMutation,
} from "../../services/cardService";
import {
  CardDetailsInterface,
  Evidences,
  CardInterface,
} from "../../data/card/card";
import { UnauthorizedRoute } from "../../utils/Routes";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetCardUpdatedIndicator,
  selectCardUpdatedIndicator,
  setSiteId,
} from "../../core/genericReducer";
import { Note } from "../../data/note";
import { Card, Divider, Typography } from "antd";
import InfoCollapseV2 from "./components/InfoCollapseV2";
import ProvisionalSolutionCollapseV2 from "./components/ProvisionalSolutionCollapseV2";
import NoteCollapseV2 from "./components/NoteCollapseV2";
import DefinitiveSolutionCollapseV2 from "./components/DefinitiveSolutionCollapseV2";
import PageTitleTag from "../../components/PageTitleTag";
import PdfContent from "./components/PDFContent";
import ExportPdfButton from "./components/ButtonPDF";
import { notification } from "antd";

// Components
const { Text } = Typography;

const defaultCard: CardInterface = {
  id: "",
  siteId: "",
  siteCardId: "",
  status: "",
  cardCreationDate: "",
  cardDueDate: "",
  preclassifierCode: "",
  preclassifierDescription: "",
  areaName: "",
  creatorName: "",
  cardTypeMethodologyName: "",
  cardTypeName: "Información no disponible",
  cardTypeColor: "",
  priorityCode: "",
  priorityDescription: "",
  commentsAtCardCreation: "",
  mechanicName: "",
  userProvisionalSolutionName: "",
  cardProvisionalSolutionDate: "",
  commentsAtCardProvisionalSolution: "",
  userDefinitiveSolutionName: "",
  cardDefinitiveSolutionDate: "",
  commentsAtCardDefinitiveSolution: "",
  evidences: [],
  createdAt: "",
  responsableName: "",
  userAppProvisionalSolutionName: "",
  userAppDefinitiveSolutionName: "",
  cardLocation: "",
};

const CardDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { cardId: paramCardId, siteId: paramSiteId } = useParams<{
    siteId?: string;
    cardId: string;
  }>();

  const isExternal = location.pathname.includes("/external/");

  const cardId = isExternal
    ? paramCardId
    : (location.state && (location.state as any).cardId) ||
      paramCardId ||
      Strings.empty;
  const cardNameFromState = isExternal
    ? Strings.empty
    : location.state && (location.state as any).cardName;

  if (!isExternal && !location.state) {
    navigate(UnauthorizedRoute);
    return null;
  }

  const [data, setData] = useState<CardDetailsInterface | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setLoading] = useState(false);

  const [getCardDetails] = useGetCardDetailsMutation();
  const [getNotes] = useGetCardNotesMutation();

  const isCardUpdated = useAppSelector(selectCardUpdatedIndicator);

  const handleGetCards = async () => {
    setLoading(true);
    try {
      const [responseData, responseNotes] = await Promise.all([
        getCardDetails(cardId).unwrap(),
        getNotes(cardId).unwrap(),
      ]);
      const cardData =
        responseData?.card !== null
          ? responseData.card
          : { ...defaultCard, siteId: paramSiteId || "" };

      const modifiedResponse: CardDetailsInterface = {
        ...responseData,
        card: cardData,
        evidences: responseData?.evidences || [],
      };

      setData(modifiedResponse);
      setNotes(responseNotes);

      if (cardData && cardData.siteId && cardData.siteId !== "") {
        dispatch(setSiteId(cardData.siteId));
      }
    } catch (error) {
      console.error("Error getting card details:", error);
      notification.error({
        message: "Loading Error",
        description: "There was an error loading card details. Please try again.",
        placement: "topRight",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCardUpdated) {
      handleGetCards();
      dispatch(resetCardUpdatedIndicator());
    }
  }, [isCardUpdated, dispatch]);

  useEffect(() => {
    handleGetCards();
  }, [cardId]);

  const cardName =
    cardNameFromState || (data ? data.card.cardTypeName : Strings.empty);

  const filterEvidence = (data: Evidences[]) => {
    const creation: Evidences[] = [];
    const provisionalSolution: Evidences[] = [];
    const definitiveSolution: Evidences[] = [];

    data.forEach((evidence) => {
      switch (evidence.evidenceType) {
        case Strings.AUCR:
        case Strings.IMCR:
        case Strings.VICR:
          creation.push(evidence);
          break;
        case Strings.AUPS:
        case Strings.IMPS:
        case Strings.VIPS:
          provisionalSolution.push(evidence);
          break;
        case Strings.AUCL:
        case Strings.IMCL:
        case Strings.VICL:
          definitiveSolution.push(evidence);
          break;
        default:
          break;
      }
    });

    return {
      creation,
      provisionalSolution,
      definitiveSolution,
    };
  };

  return (
    <>
      <div className="h-full flex flex-col max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center m-2 sm:m-3 px-2 sm:px-3 gap-2 sm:gap-3">
          <div className="w-full sm:w-auto overflow-hidden">
            <PageTitleTag mainText={Strings.tagDetailsOf} subText={cardName} />
          </div>
          <div className="w-full sm:w-auto flex justify-start sm:justify-end">
            <ExportPdfButton 
              targetId="pdf-content" 
              filename={Strings.namePDF} 
              cardNumber={data?.card?.siteCardId} 
            />
          </div>
        </div>

        <div className="flex flex-col overflow-y-auto overflow-x-hidden gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 lg:px-6">
          {data ? (
            <InfoCollapseV2
              data={data}
              evidences={filterEvidence(data.evidences).creation}
              cardName={cardName}
            />
          ) : (
            <LoadingCard />
          )}
          {data ? (
            <ProvisionalSolutionCollapseV2
              data={data}
              evidences={filterEvidence(data.evidences).provisionalSolution}
            />
          ) : (
            <LoadingCard />
          )}
          {data ? (
            <DefinitiveSolutionCollapseV2
              data={data}
              evidences={filterEvidence(data.evidences).definitiveSolution}
            />
          ) : (
            <LoadingCard />
          )}

          <Divider style={{ borderColor: "#808080" }} className="my-2 sm:my-4">
            <Text style={{ fontWeight: "bold" }} className="text-sm sm:text-base md:text-lg lg:text-xl">
              {Strings.changeLogDivider}
            </Text>
          </Divider>

          <div className="w-full mx-auto my-2 sm:my-3">
            {!isLoading ? <NoteCollapseV2 data={notes} /> : <LoadingCard />}
          </div>

          <div className="App">
            <div style={{ opacity: 0, position: 'absolute', left: '-9999px' }}>
              <div id="pdf-content">
                <PdfContent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const LoadingCard = () => {
  return (
    <Card
      className="h-full bg-gray-100 rounded-xl shadow-md w-full mx-auto"
      loading={true}
    />
  );
};

export default CardDetails;