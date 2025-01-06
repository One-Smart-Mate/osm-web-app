import { useEffect, useState } from "react";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetCardDetailsMutation,
  useGetCardNotesMutation,
} from "../../services/cardService";
import { CardDetailsInterface, Evidences } from "../../data/card/card";
import { UnauthorizedRoute } from "../../utils/Routes";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetCardUpdatedIndicator,
  selectCardUpdatedIndicator,
  setSiteId,
} from "../../core/genericReducer";
import { Note } from "../../data/note";
import { Card } from "antd";
import InfoCollapseV2 from "./components/InfoCollapseV2";
import ProvisionalSolutionCollapseV2 from "./components/ProvisionalSolutionCollapseV2";
import NoteCollapseV2 from "./components/NoteCollapseV2";
import DefinitiveSolutionCollapseV2 from "./components/DefinitiveSolutionCollapseV2";
import PageTitleTag from "../../components/PageTitleTag";
import { Divider, Typography } from 'antd';



const { Text } = Typography

const CardDetails = () => {
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

  const cardName = location?.state?.cardName || Strings.empty;
  const filterEvidence = (data: Evidences[]) => {
    const creation: Evidences[] = [];
    const provisionalSolution: Evidences[] = [];
    const definitiveSolution: Evidences[] = [];
    
      data.map((evidence) => {
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
      <div className="h-full flex flex-col">
        <div className="flex flex-col items-center m-3">
          <PageTitleTag mainText={Strings.cardDetailsOf} subText={cardName}/>
        </div>

        <div className="flex flex-col overflow-y-auto overflow-x-clipb gap-2">
          {data ? (
            <InfoCollapseV2
              data={data}
              evidences={filterEvidence(data.evidences).creation}
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

              
    <Divider style={{ borderColor: '	#808080' }} >
    <Text style={{ fontSize: '24px', fontWeight: 'bold' }} >Change log</Text>
    </Divider>
    
          <div className="flex flex-col items-center m-3">
        {!isLoading ? <NoteCollapseV2 data={notes} /> : <LoadingCard />}
        </div>
        </div>
      </div>
    </>
  );
};

const LoadingCard = () => {
  return (
    <Card
      className="h-full bg-gray-100 rounded-xl shadow-md md:w-4/5"
      loading={true}
    />
  );
};

export default CardDetails;
