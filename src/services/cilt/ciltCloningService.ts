import Strings from "../../utils/localizations/Strings";
import { CiltMstr } from "../../data/cilt/ciltMstr/ciltMstr";
import { CreateCiltSequenceDTO } from "../../data/cilt/ciltSequences/ciltSequences";
import { useCreateCiltMstrMutation } from "./ciltMstrService";
import {
  useGetCiltSequencesByCiltMutation,
  useCreateCiltSequenceMutation,
} from "./ciltSequencesService";
import { notification } from "antd";

export const useCiltCloning = () => {
  const [createCiltMstr] = useCreateCiltMstrMutation();
  const [getCiltSequencesByCilt] = useGetCiltSequencesByCiltMutation();
  const [createCiltSequence] = useCreateCiltSequenceMutation();

  const cloneCilt = async (cilt: CiltMstr): Promise<boolean> => {
    try {
      let clonedCiltName = cilt.ciltName || "";
      let copyCount = 1;

      const copyPattern = new RegExp(`\\s*${Strings.copy}\\s*(\\d+)?\\s*$`);
      const copyMatch = clonedCiltName.match(copyPattern);

      if (copyMatch) {
        const currentCount = copyMatch[1] ? parseInt(copyMatch[1], 10) : 1;
        copyCount = currentCount + 1;

        clonedCiltName = clonedCiltName.replace(copyPattern, "");
      }

      clonedCiltName =
        copyCount === 1
          ? `${clonedCiltName} ${Strings.copy}`
          : `${clonedCiltName} ${Strings.copy} ${copyCount}`;

      const ciltPayload = {
        siteId: cilt.siteId || undefined,
        ciltName: clonedCiltName,
        ciltDescription: cilt.ciltDescription || undefined,
        creatorId: cilt.creatorId || undefined,
        creatorName: cilt.creatorName || undefined,
        reviewerId: cilt.reviewerId || undefined,
        reviewerName: cilt.reviewerName || undefined,
        approvedById: cilt.approvedById || undefined,
        approvedByName: cilt.approvedByName || undefined,
        standardTime: cilt.standardTime || undefined,
        urlImgLayout: cilt.urlImgLayout || undefined,
        order: cilt.order || undefined,
        status: cilt.status || undefined,
        ciltDueDate: cilt.ciltDueDate || undefined
      };

      const newCiltMstr = await createCiltMstr(ciltPayload as any).unwrap();

      const ciltId = cilt.id.toString();
      const sequences = await getCiltSequencesByCilt(ciltId).unwrap();

      if (sequences && sequences.length > 0) {
        const clonePromises = sequences.map(async (sequence) => {
          const sequencePayload: CreateCiltSequenceDTO = {
            siteId: sequence.siteId || undefined,
            siteName: sequence.siteName || undefined,
            areaId: sequence.areaId || undefined,
            areaName: sequence.areaName || undefined,
            positionId: sequence.positionId || undefined,
            positionName: sequence.positionName || "",
            ciltMstrId: newCiltMstr.id,
            ciltMstrName: clonedCiltName || "",
            levelId: sequence.levelId || undefined,
            levelName: sequence.levelName || undefined,
            order: sequence.order || undefined,
            secuenceList: sequence.secuenceList || undefined,
            secuenceColor: sequence.secuenceColor || undefined,
            ciltTypeId: sequence.ciltTypeId || undefined,
            ciltTypeName: sequence.ciltTypeName || undefined,
            referenceOplSopId: sequence.referenceOplSopId || undefined,
            standardTime: sequence.standardTime || undefined,
            standardOk: sequence.standardOk || undefined,
            remediationOplSopId: sequence.remediationOplSopId || undefined,
            toolsRequired: sequence.toolsRequired || undefined,
            stoppageReason: sequence.stoppageReason || undefined,
            quantityPicturesCreate:
              sequence.quantityPicturesCreate || undefined,
            quantityPicturesClose: sequence.quantityPicturesClose || undefined,
            createdAt: new Date().toISOString(),
          };

          return createCiltSequence(sequencePayload).unwrap();
        });

        await Promise.all(clonePromises);
      }

      notification.success({
        message: Strings.success,
        description: `${Strings.ciltMasterCreateSuccess} ${Strings.copy}`,
      });

      return true;
    } catch (error) {
      console.error("Error cloning CILT:", error);
      notification.error({
        message: Strings.error,
        description: `${Strings.errorCloningTheLevel} ${error}`,
      });
      return false;
    }
  };

  return { cloneCilt };
};
