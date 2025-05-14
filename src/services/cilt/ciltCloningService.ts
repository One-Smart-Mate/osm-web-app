import Strings from '../../utils/localizations/Strings';
import { CiltMstr, CreateCiltMstrDTO } from '../../data/cilt/ciltMstr/ciltMstr';
import { CreateCiltSequenceDTO } from '../../data/cilt/ciltSequences/ciltSequences';
import { useCreateCiltMstrMutation } from "./ciltMstrService";
import { useGetCiltSequencesByCiltMutation, useCreateCiltSequenceMutation } from "./ciltSequencesService";
import { notification } from "antd";

export const useCiltCloning = () => {
  const [createCiltMstr] = useCreateCiltMstrMutation();
  const [getCiltSequencesByCilt] = useGetCiltSequencesByCiltMutation();
  const [createCiltSequence] = useCreateCiltSequenceMutation();

  const cloneCilt = async (cilt: CiltMstr): Promise<boolean> => {
    try {
      
      const clonedCiltName = `${cilt.ciltName} ${Strings.copy}`;
      
      const ciltPayload: CreateCiltMstrDTO = {
        siteId: cilt.siteId || undefined,
        positionId: cilt.positionId || undefined,
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
        dateOfLastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      
      const newCiltMstr = await createCiltMstr(ciltPayload).unwrap();
      
      
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
            positionName: sequence.positionName || '',
            ciltMstrId: newCiltMstr.id, 
            ciltMstrName: clonedCiltName || '',
            levelId: sequence.levelId || undefined,
            levelName: sequence.levelName || undefined,
            order: sequence.order || undefined,
            secuenceList: sequence.secuenceList || undefined,
            secuenceColor: sequence.secuenceColor || undefined,
            ciltTypeId: sequence.ciltTypeId || undefined,
            ciltTypeName: sequence.ciltTypeName || undefined,
            referenceOplSop: sequence.referenceOplSop || undefined,
            standardTime: sequence.standardTime || undefined,
            standardOk: sequence.standardOk || undefined,
            remediationOplSop: sequence.remediationOplSop || undefined,
            toolsRequired: sequence.toolsRequired || undefined,
            stoppageReason: sequence.stoppageReason || undefined,
            quantityPicturesCreate: sequence.quantityPicturesCreate || undefined,
            quantityPicturesClose: sequence.quantityPicturesClose || undefined,
            createdAt: new Date().toISOString()
          };
          
          return createCiltSequence(sequencePayload).unwrap();
        });
        
        await Promise.all(clonePromises);
      }
      
      notification.success({
        message: Strings.success,
        description: `${Strings.ciltMasterCreateSuccess} ${Strings.copy}`
      });
      
      return true;
    } catch (error) {
      console.error('Error cloning CILT:', error);
      notification.error({
        message: Strings.error,
        description: `${Strings.errorCloningTheLevel} ${error}`
      });
      return false;
    }
  };

  return { cloneCilt };
};
