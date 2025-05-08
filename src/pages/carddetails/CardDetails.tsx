import { useEffect, useState } from "react";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useGetCardDetailsMutation,
  useGetCardNotesMutation,
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
import PDFButton from "../components/PdfButton";
import { useGetSiteMutation } from "../../services/siteService";
import { SiteUpdateForm } from "../../data/site/site";

// Components
const { Text } = Typography;

const CardDetails = () => {
  const [data, setData] = useState<CardDetailsInterface | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [site, setSite] = useState<SiteUpdateForm>();

  const [getCardDetails] = useGetCardDetailsMutation();
  const [getNotes] = useGetCardNotesMutation();
  const [getSite] = useGetSiteMutation();

  const isCardUpdated = useAppSelector(selectCardUpdatedIndicator);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notification } = AntdApp.useApp();
  

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


  const cardName =
    cardNameFromState || (data ? data.card.cardTypeName : Strings.empty);

  const handleGetCards = async () => {
    setLoading(true);
    try {
      console.log(`[PARAMS] ${paramCardId} -- ${paramSiteId}`);
      const [responseData, responseNotes, site] = await Promise.all([
        getCardDetails(cardId).unwrap(),
        getNotes(cardId).unwrap(),
        getSite(paramSiteId ?? '').unwrap()
      ]);
      
      const cardData = responseData.card;

      const modifiedResponse: CardDetailsInterface = {
        ...responseData,
        card: cardData,
        evidences: responseData?.evidences || [],
      };

      setData(modifiedResponse);
      setNotes(responseNotes);
      setSite(site);
      console.log(`[CARD] ${Object.values(cardData)}`);
      if (cardData && cardData.siteId && cardData.siteId !== "") {
        dispatch(setSiteId(cardData.siteId));
      }
    } catch (error) {
      console.error("Error getting card details:", error);
      notification.error({
        message: "Loading Error",
        description:
          "There was an error loading card details. Please try again.",
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


  return (
    <MainContainer
      title={Strings.tagDetailsOf}
      description={cardName}
      enableBackButton={!isExternal}
      isLoading={isLoading}
      content={
        <div>
          <div className="w-full sm:w-auto flex justify-start sm:justify-end ">
            {data && <PDFButton site={site} data={data} />}
          </div>

          <div className="flex flex-col overflow-y-auto overflow-x-hidden gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 lg:px-6">
            {data && (
              <>
                <TagInfoCard
                  data={data}
                  evidences={filterEvidences(data.evidences).creation}
                  cardName={cardName}
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
