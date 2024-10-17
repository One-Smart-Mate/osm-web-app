import { useEffect, useState } from "react";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import {
  useGetCardDetailsMutation,
  useGetCardNotesMutation,
} from "../../services/cardService";
import { CardDetailsInterface, Evidences } from "../../data/card/card";
import { UnauthorizedRoute } from "../../utils/Routes";
import InfoCollapse from "./components/InfoCollapse";
import ProvisionalSolutionCollapse from "./components/ProvisionalSolutionCollapse";
import DefinitiveSolutionCollapse from "./components/DefinitiveSolutionCollapse";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetCardUpdatedIndicator,
  selectCardUpdatedIndicator,
  setSiteId,
} from "../../core/genericReducer";
import { Note } from "../../data/note";
import NoteCollapse from "./components/NoteCollapse";
import { Card } from "antd";

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
          <PageTitle mainText={Strings.cardDetailsOf} subText={cardName} />
        </div>

        <div className="flex flex-col items-center overflow-y-auto overflow-x-clipb gap-2">
          {data ? (
            <InfoCollapse
              data={data}
              evidences={filterEvidence(data.evidences).creation}
            />
          ) : (
            <LoadingCard />
          )}
          {data ? (
            <ProvisionalSolutionCollapse
              data={data}
              evidences={filterEvidence(data.evidences).provisionalSolution}
            />
          ) : (
            <LoadingCard />
          )}
          {data ? (
            <DefinitiveSolutionCollapse
              data={data}
              evidences={filterEvidence(data.evidences).definitiveSolution}
            />
          ) : (
            <LoadingCard />
          )}
          {!isLoading ? <NoteCollapse data={notes} /> : <LoadingCard />}
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
