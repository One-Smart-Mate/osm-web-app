import React, { useEffect, useState } from "react";
import { Modal, Typography, Spin, Divider, Form } from "antd";
import { useGetCardDetailsMutation, useUpdateCardMechanicMutation, useUpdateCardPriorityMutation } from "../../../services/cardService";
import { 
  hasAudios,
  hasImages,
  hasVideos
} from "../../../utils/Extensions";
import { 
  BsExclamationDiamond
} from "react-icons/bs";
import Strings from "../../../utils/localizations/Strings";
import { CardDetailsInterface, filterEvidences } from "../../../data/card/card";
import { UpdateCardMechanic, UpdateCardPriority } from "../../../data/card/card.request";
import ImagesPreviewGroup from "../../tagdetails/components/ImagesPreviewGroup";
import VideoPreviewGroup from "../../tagdetails/components/VideoPreviewGroup";
import AudioPlayerPreviewGroup from "../../tagdetails/components/AudioPlayerPreviewGroup";
import InfoTagCard from "../../tagdetails/components/InfoTagCard";
import ProvisionalSolutionTagCard from "../../tagdetails/components/ProvisionalSolutionTagCard";
import DefinitiveSolutionTagCard from "../../tagdetails/components/DefinitiveSolutionTagCard";
import TagPDFButton from "../../components/TagPDFButton";
import ModalForm from "../../components/ModalForm";
import UpdatePriorityForm from "../../tagdetails/components/UpdatePriorityForm";
import UpdateMechanicForm from "../../tagdetails/components/UpdateMechanicForm";
import { useAppDispatch, useAppSelector } from "../../../core/store";
import { selectCurrentUser } from "../../../core/authReducer";
import { setSiteId } from "../../../core/genericReducer";
import { handleErrorNotification, handleSucccessNotification, NotificationSuccess } from "../../../utils/Notifications";
import { FormInstance } from "antd";

const { Text } = Typography;

interface AMTagViewerModalProps {
  open: boolean;
  amTagId: string | number | null;
  onClose: () => void;
  title: string;
}

/**
 * Modal component to view AM Tag details - Uses same components as TagDetailsPage
 */
const AMTagViewerModal: React.FC<AMTagViewerModalProps> = ({
  open,
  amTagId,
  onClose,
  title
}) => {
  // Card details mutation
  const [getCardDetails, { data: cardData, isLoading, error }] = useGetCardDetailsMutation();
  const [updateCardPriority] = useUpdateCardPriorityMutation();
  const [updateCardMechanic] = useUpdateCardMechanicMutation();
  
  // State for modal functionality
  const [modalIsLoading, setModalLoading] = useState(false);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(Strings.empty);
  const [cardDataState, setCardDataState] = useState<CardDetailsInterface | null>(null);
  
  // Redux
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (open && amTagId) {
      // Fetch card details when modal opens and amTagId is available
      getCardDetails(String(amTagId));
    }
  }, [open, amTagId, getCardDetails]);

  // Update local state when card data changes
  useEffect(() => {
    if (cardData) {
      const transformedData = transformToCardDetails(cardData);
      setCardDataState(transformedData);
      
      // Set site ID in Redux store for the forms to work
      if (transformedData?.card?.siteId) {
        dispatch(setSiteId(transformedData.card.siteId));
      }
    }
  }, [cardData, dispatch]);

  // Handle modal close
  const handleClose = () => {
    onClose();
  };

  // Modal functionality handlers
  const handleOnOpenModal = (modalType: string) => {
    setModalOpen(true);
    setModalType(modalType);
  };

  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      setModalOpen(false);
    }
  };

  const selectFormByModalType = (modalType: string) => {
    if (modalType === Strings.priority) {
      return (form: FormInstance) => <UpdatePriorityForm form={form} />;
    } else {
      return (form: FormInstance) => (
        <UpdateMechanicForm
          form={form}
          card={cardDataState?.card}
          cardId={Number(cardDataState?.card?.id)}
          cardName={cardDataState?.card?.cardTypeName}
        />
      );
    }
  };

  const selectTitleByModalType = (modalType: string) => {
    if (modalType === Strings.priority) {
      return Strings.updatePriority;
    } else {
      return Strings.assignUser;
    }
  };

  const handleOnFormUpdateFinish = async (values: any) => {
    if (!cardDataState?.card) return;

    try {
      setModalLoading(true);
      if (modalType === Strings.priority) {
        await updateCardPriority(
          new UpdateCardPriority(
            Number(cardDataState.card.id),
            Number(values.priorityId),
            Number(currentUser.userId)
          )
        ).unwrap();
      } else {
        const mechanicId =
          values.mechanicId ??
          values.IH_sis_adminId ??
          values.local_adminId ??
          values.local_sis_adminId ??
          values.operatorId ??
          values.external_providerId;

        if (!mechanicId) {
          throw new Error("No user selected to assign");
        }
        await updateCardMechanic(
          new UpdateCardMechanic(
            Number(cardDataState.card.id),
            Number(mechanicId),
            Number(currentUser.userId)
          )
        ).unwrap();
      }
      setModalOpen(false);
      // Refresh card data after update
      await getCardDetails(String(amTagId));
      handleSucccessNotification(NotificationSuccess._UPDATE);
    } catch (error) {
      console.log(error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  // Transform cardData to match CardDetailsInterface format
  const transformToCardDetails = (data: any): CardDetailsInterface | null => {
    if (!data || !data.card) return null;
    
    return {
      card: data.card,
      evidences: data.evidences || [],
      cardDefinitiveSolutionDate: data.card.cardDefinitiveSolutionDate
    };
  };

  // Show evidences section check
  const showEvidencesSection = (evidences: any[]): boolean => {
    return hasImages(evidences) || hasVideos(evidences) || hasAudios(evidences);
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BsExclamationDiamond className="text-blue-500 mr-2" />
            {title}
          </div>
          {cardData && cardData.card && (
            <TagPDFButton 
              site={undefined} 
              data={transformToCardDetails(cardData)!} 
            />
          )}
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={1000}
      footer={null}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto', paddingRight: 20 }}
      style={{ top: 20 }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <Text type="danger">{Strings.errorOnLoadingData}</Text>
        </div>
      ) : cardData && cardData.card ? (
        <div className="flex flex-col overflow-y-auto overflow-x-hidden gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 lg:px-6">
          {(() => {
            const transformedData = transformToCardDetails(cardData);
            if (!transformedData) return null;

            const filteredEvidences = filterEvidences(transformedData.evidences);

            return (
              <>
                {/* Main Information Card - With modal functionality */}
                <InfoTagCard
                  data={transformedData}
                  evidences={filteredEvidences.creation}
                  cardName={transformedData.card.cardTypeName}
                  onOpenModal={handleOnOpenModal}
                />

                {/* Provisional Solution Card - Exact same as TagDetailsPage */}
                <ProvisionalSolutionTagCard
                  data={transformedData}
                  evidences={filteredEvidences.provisionalSolution}
                />

                {/* Definitive Solution Card - Exact same as TagDetailsPage */}
                <DefinitiveSolutionTagCard
                  data={transformedData}
                  evidences={filteredEvidences.definitiveSolution}
                />

                {/* Evidence Section - Exact same structure as TagDetailsPage */}
                {showEvidencesSection(filteredEvidences.creation) && (
                  <>
                    <Divider
                      style={{ borderColor: "#808080" }}
                      className="my-2 sm:my-4"
                    >
                      <Text
                        style={{ fontWeight: "bold", fontSize: '18px' }}
                        className="text-sm sm:text-base md:text-lg lg:text-xl"
                      >
                        {Strings.evidencesAtCreationDivider}
                      </Text>
                    </Divider>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {hasImages(filteredEvidences.creation) && (
                        <ImagesPreviewGroup data={filteredEvidences.creation} />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {hasVideos(filteredEvidences.creation) && (
                        <VideoPreviewGroup data={filteredEvidences.creation} />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {hasAudios(filteredEvidences.creation) && (
                        <AudioPlayerPreviewGroup data={filteredEvidences.creation} />
                      )}
                    </div>
                  </>
                )}

                {/* Provisional Solution Evidence Section */}
                {showEvidencesSection(filteredEvidences.provisionalSolution) && (
                  <>
                    <Divider
                      style={{ borderColor: "#808080" }}
                      className="my-2 sm:my-4"
                    >
                      <Text
                        style={{ fontWeight: "bold", fontSize: '18px' }}
                        className="text-sm sm:text-base md:text-lg lg:text-xl"
                      >
                        Evidencias de Solución Provisional
                      </Text>
                    </Divider>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {hasImages(filteredEvidences.provisionalSolution) && (
                        <ImagesPreviewGroup data={filteredEvidences.provisionalSolution} />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {hasVideos(filteredEvidences.provisionalSolution) && (
                        <VideoPreviewGroup data={filteredEvidences.provisionalSolution} />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {hasAudios(filteredEvidences.provisionalSolution) && (
                        <AudioPlayerPreviewGroup data={filteredEvidences.provisionalSolution} />
                      )}
                    </div>
                  </>
                )}

                {/* Definitive Solution Evidence Section */}
                {showEvidencesSection(filteredEvidences.definitiveSolution) && (
                  <>
                    <Divider
                      style={{ borderColor: "#808080" }}
                      className="my-2 sm:my-4"
                    >
                      <Text
                        style={{ fontWeight: "bold", fontSize: '18px' }}
                        className="text-sm sm:text-base md:text-lg lg:text-xl"
                      >
                        Evidencias de Solución Definitiva
                      </Text>
                    </Divider>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {hasImages(filteredEvidences.definitiveSolution) && (
                        <ImagesPreviewGroup data={filteredEvidences.definitiveSolution} />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {hasVideos(filteredEvidences.definitiveSolution) && (
                        <VideoPreviewGroup data={filteredEvidences.definitiveSolution} />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {hasAudios(filteredEvidences.definitiveSolution) && (
                        <AudioPlayerPreviewGroup data={filteredEvidences.definitiveSolution} />
                      )}
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <div className="p-8 text-center">
          <Text>{Strings.noDataAvailable}</Text>
        </div>
      )}

      {/* Modal Form for Priority and Mechanic Updates */}
      <Form.Provider
        onFormFinish={async (_, { values }) =>
          handleOnFormUpdateFinish(values)
        }
      >
        <ModalForm
          open={modalIsOpen}
          isLoading={modalIsLoading}
          onCancel={handleOnCancelButton}
          title={selectTitleByModalType(modalType)}
          FormComponent={selectFormByModalType(modalType)}
        />
      </Form.Provider>
    </Modal>
  );
};

export default AMTagViewerModal;
