import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Divider, Typography, Spin, Alert } from "antd";
import {
  useGetCardDetailsMutation,
  useGetCardNotesMutation,
} from "../../services/cardService";
import {
  CardDetailsInterface,
  CardInterface,
  Evidences,
} from "../../data/card/card";
import PageTitleTag from "../../components/PageTitleTag";
import InfoCollapseV2 from "./components/InfoCollapseV2";
import ProvisionalSolutionCollapseV2 from "./components/ProvisionalSolutionCollapseV2";
import DefinitiveSolutionCollapseV2 from "./components/DefinitiveSolutionCollapseV2";
import NoteCollapseV2 from "./components/NoteCollapseV2";
import Strings from "../../utils/localizations/Strings";

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
  cardTypeName: "",
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

const PublicCardDetails = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const cardNameParam = queryParams.get("cardName");
  const [data, setData] = useState<CardDetailsInterface | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  const [getCardDetails] = useGetCardDetailsMutation();
  const [getCardNotes] = useGetCardNotesMutation();

  const handleGetCards = async () => {
    if (!cardId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [responseData, responseNotes] = await Promise.all([
        getCardDetails(cardId).unwrap(),
        getCardNotes(cardId).unwrap(),
      ]);
      const cardData =
        responseData?.card !== null ? responseData.card : { ...defaultCard };

      const modifiedResponse: CardDetailsInterface = {
        ...responseData,
        card: cardData,
        evidences: responseData?.evidences || [],
      };

      setData(modifiedResponse);
      setNotes(responseNotes);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetCards();
  }, [cardId, getCardDetails, getCardNotes]);

  if (isLoading) return <Spin tip={Strings.loading} />;
  if (error) return <Alert message={error} type="error" />;
  if (!data || !data.card)
    return (
      <Alert
        message={Strings.notCardInfoFound}
        type="info"
      />
    );

  const cardName =
    cardNameParam || (data ? data.card.cardTypeName : Strings.empty);

  const filterEvidence = (evidences: Evidences[]) => {
    const creation: Evidences[] = [];
    const provisionalSolution: Evidences[] = [];
    const definitiveSolution: Evidences[] = [];
    evidences.forEach((evidence) => {
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
    return { creation, provisionalSolution, definitiveSolution };
  };

  return (
    <div className="px-8 md:px-16 py-4">
      <div className="my-10 flex flex-col items-center">
        <PageTitleTag mainText={Strings.tagDetailsOf} subText={cardName} />
      </div>

      <div className="space-y-4 mt-10">
        <InfoCollapseV2
          data={data}
          evidences={filterEvidence(data.evidences).creation}
        />

        <ProvisionalSolutionCollapseV2
          data={data}
          evidences={filterEvidence(data.evidences).provisionalSolution}
        />

        <DefinitiveSolutionCollapseV2
          data={data}
          evidences={filterEvidence(data.evidences).definitiveSolution}
        />

        <Divider orientation="left">
          <Text className="text-xl font-bold">Registro de Cambios</Text>
        </Divider>

        <div>
          <NoteCollapseV2 data={notes} />
        </div>
      </div>
    </div>
  );
};

export default PublicCardDetails;
