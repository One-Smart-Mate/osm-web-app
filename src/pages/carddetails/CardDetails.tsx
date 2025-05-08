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
import { Divider, Typography, App as AntdApp  } from "antd";
import ProvisionalSolutionCollapseV2 from "./components/ProvisionalSolutionCollapseV2";
import NoteCollapseV2 from "./components/NoteCollapseV2";
import DefinitiveSolutionCollapseV2 from "./components/DefinitiveSolutionCollapseV2";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import TagInfoCard from "./components/TagInfoCard";
import { useGetSiteMutation } from "../../services/siteService";
import { SiteUpdateForm } from "../../data/site/site";
import TagPDFButton from "../components/TagPDFButton";
import AnatomyNotification from "../components/AnatomyNotification";

// Components
const { Text } = Typography;

const CardDetails = () => {
  const [data, setData] = useState<CardDetailsInterface | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [site, setSite] = useState<SiteUpdateForm>();

  const [getCardDetails] = useGetCardDetailByUUIDMutation();
  const [getNotes] = useGetCardNotesByUUIDMutation();
  const [getSite] = useGetSiteMutation();

  const isCardUpdated = useAppSelector(selectCardUpdatedIndicator);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notification } = AntdApp.useApp();
  

  const { cardId: cardUUID, siteId: siteId } = useParams<{siteId?: string, cardId: string}>();

  const isExternal = location.pathname.includes("/external/");

  const cardName = location.state?.cardName ?? Strings.empty;

  if (!isExternal && !location.state) {
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
      enableBackButton={!isExternal}
      isLoading={isLoading}
      content={
        <div>
          <div className="w-full sm:w-auto flex justify-start sm:justify-end ">
            {data && <TagPDFButton site={site} data={data} />}
          </div>

          <div className="flex flex-col overflow-y-auto overflow-x-hidden gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 lg:px-6">
            {data && (
              <>
                <TagInfoCard
                  data={data}
                  evidences={filterEvidences(data.evidences).creation}
                  cardName={data.card.cardTypeName}
                />
                <ProvisionalSolutionCollapseV2
                  data={data}
                  evidences={filterEvidences(data.evidences).provisionalSolution}
                />
                <DefinitiveSolutionCollapseV2
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

            <NoteCollapseV2 data={notes} />
          </div>
        </div>
      }
    />
  );
};

export default CardDetails;
