import { useEffect, useState } from "react";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useGetCardDetailByUUIDMutation,
  useGetCardNotesByUUIDMutation,
} from "../../services/cardService";
import  {
  CardDetailsInterface,
  filterEvidences,
} from "../../data/card/card";
import { UnauthorizedRoute } from "../../utils/Routes";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetCardUpdatedIndicator,
  selectCardUpdatedIndicator,
  setSiteId,
} from "../../core/genericReducer";
import { Note } from "../../data/note";
import { Divider, Typography, App as AntdApp, Button } from "antd";
import ProvisionalSolutionTagCard from "./components/ProvisionalSolutionTagCard";
import NoteTagCard from "./components/NoteTagCard";
import DefinitiveSolutionTagCard from "./components/DefinitiveSolutionTagCard";
import MainContainer from "../layouts/MainContainer";
import InfoTagCard from "./components/InfoTagCard";
import { useGetSiteMutation } from "../../services/siteService";
import { SiteUpdateForm } from "../../data/site/site";
import TagPrintPDF from "../components/TagPrintPDF";
import AnatomyNotification from "../components/AnatomyNotification";
import DiscardCardModal from "./components/DiscardCardModal";

// Components
const { Text } = Typography;

const TagDetailsPage = () => {
  const [data, setData] = useState<CardDetailsInterface | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [site, setSite] = useState<SiteUpdateForm>();
  const [isDiscardModalVisible, setIsDiscardModalVisible] = useState(false);

  const [getCardDetails] = useGetCardDetailByUUIDMutation();
  const [getNotes] = useGetCardNotesByUUIDMutation();
  const [getSite] = useGetSiteMutation();

  const isCardUpdated = useAppSelector(selectCardUpdatedIndicator);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notification } = AntdApp.useApp();
  

  const { cardId: cardUUID, siteId: siteId } = useParams<{siteId?: string, cardId: string}>();
  const cardName = location.state?.cardName ?? Strings.empty;

  if (!location.state) {
    navigate(UnauthorizedRoute);
    return null;
  }

  const handleGetData = async () => {
    setLoading(true);
    await handleGetCard();
    await handleGetSite();
    handleGetNotes();
    setLoading(false);
  }

  const handleGetSite = async (): Promise<boolean> => {
    try {
      if(!siteId) {
        return Promise.reject(false);
      }
      const site = await getSite(siteId).unwrap();
      setSite(site);
      return Promise.resolve(true);
    } catch (error) {
      console.error("Error getting card details:", error);
      AnatomyNotification.error(notification, error);
      return Promise.resolve(false);
    }
  }

  const handleGetNotes = async (): Promise<boolean> => {
    try {
      if(!cardUUID) {
        return Promise.reject(false);
      }
      const notes = await getNotes(cardUUID).unwrap();
      setNotes(notes);
      return Promise.resolve(true);
    } catch (error) {
      console.error("Error getting card details:", error);
      AnatomyNotification.error(notification, error);
      return Promise.resolve(false);
    }
  }

  const handleGetCard = async (): Promise<boolean> => {
    try {
      if(!cardUUID) {
        return Promise.reject(false);
      }
      const response = await getCardDetails(cardUUID).unwrap();
      console.log(`[CARD] ${Object.values(response)}`);

      const cardDetail: CardDetailsInterface = {
        card: response,
        evidences: response.evidences,
        cardDefinitiveSolutionDate: response.cardDefinitiveSolutionDate
      };

      console.log("AAAAAAAAAA", cardDetail.evidences);

      setData(cardDetail);
      if (cardDetail.card && cardDetail.card.siteId && cardDetail.card.siteId !== "") {
        dispatch(setSiteId(cardDetail.card.siteId));
      }
      return Promise.resolve(true);
    } catch (error) {
      console.error("Error getting card details:", error);
      AnatomyNotification.error(notification, error);
      return Promise.resolve(false);
    }
  }

  const handleDiscardSuccess = () => {
    setIsDiscardModalVisible(false);
    handleGetData(); // Refresh card data after successful discard
  };

  useEffect(() => {
    if (isCardUpdated) {
      handleGetData();
      dispatch(resetCardUpdatedIndicator());
    }
  }, [isCardUpdated, dispatch]);

  useEffect(() => {
    handleGetData();
  }, [cardUUID]);


  return (
    <MainContainer
      title={Strings.tagDetailsOf}
      description={cardName}
      enableBackButton={true}
      isLoading={isLoading}
      content={
        <div>
          <div className="w-full sm:w-auto flex justify-start sm:justify-end gap-2">
            {data && (
              <>
                <Button
                  type="primary"
                  danger
                  onClick={() => setIsDiscardModalVisible(true)}
                >
                  {Strings.discardCard}
                </Button>
                <TagPrintPDF site={site} data={data} />
              </>
            )}
          </div>

          <div className="flex flex-col overflow-y-auto overflow-x-hidden gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 lg:px-6">
            {data && (
              <>
                <InfoTagCard
                  data={data}
                  evidences={filterEvidences(data.evidences).creation}
                  cardName={data.card.cardTypeName}
                />
                <ProvisionalSolutionTagCard
                  data={data}
                  evidences={filterEvidences(data.evidences).provisionalSolution}
                />
                <DefinitiveSolutionTagCard
                  data={data}
                  evidences={filterEvidences(data.evidences).definitiveSolution}
                />
              </>
            )}

            <Divider
              style={{ borderColor: "#808080" }}
              className="my-2 sm:my-4"
            >
              <Text
                style={{ fontWeight: "bold", fontSize:'18px' }}
                className="text-sm sm:text-base md:text-lg lg:text-xl"
              >
                {Strings.changeLogDivider}
              </Text>
            </Divider>

            <NoteTagCard data={notes} />
          </div>

          {/* Discard Card Modal */}
          {data && siteId && (() => {
            // Debug log outside JSX
            console.log("🔍 Modal Debug:", {
              cardId: data.card.id,
              cardIdType: typeof data.card.id,
              cardIdParsed: parseInt(String(data.card.id), 10),
              siteId: siteId,
              siteIdType: typeof siteId,
              siteIdParsed: parseInt(siteId, 10)
            });
            
            return (
              <DiscardCardModal
                isVisible={isDiscardModalVisible}
                onCancel={() => setIsDiscardModalVisible(false)}
                onSuccess={handleDiscardSuccess}
                cardId={parseInt(String(data.card.id), 10)}
                siteId={parseInt(siteId, 10)}
              />
            );
          })()}
        </div>
      }
    />
  );
};

export default TagDetailsPage;
