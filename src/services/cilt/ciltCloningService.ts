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

      // Get sequences from original CILT
      const ciltId = cilt.id.toString();
      const sequences = await getCiltSequencesByCilt(ciltId).unwrap();

      // Clone all sequences if they exist
      if (sequences && sequences.length > 0) {
        console.log(`Clonando ${sequences.length} secuencias para el CILT ${clonedCiltName}`);
        
        try {
          // Clone sequences one by one instead of using Promise.all
          // to avoid order conflicts
          let clonedCount = 0;
          
          for (const sequence of sequences) {
            try {
              // Create sequence payload
              const sequencePayload: CreateCiltSequenceDTO = {
                siteId: sequence.siteId || 0,
                siteName: sequence.siteName || "",
                ciltMstrId: newCiltMstr.id,
                ciltMstrName: clonedCiltName || "",
                // Omitimos completamente el campo order para que el backend lo asigne
                secuenceList: sequence.secuenceList || "",
                secuenceColor: sequence.secuenceColor || "FF0000",
                ciltTypeId: sequence.ciltTypeId || 0,
                ciltTypeName: sequence.ciltTypeName || "",
                referenceOplSopId: sequence.referenceOplSopId || 0,
                remediationOplSopId: sequence.remediationOplSopId || 0,
                standardTime: sequence.standardTime || 0,
                standardOk: sequence.standardOk || "",
                toolsRequired: sequence.toolsRequired || "",
                stoppageReason: sequence.stoppageReason || 0,
                machineStopped: sequence.machineStopped || 0,
                quantityPicturesCreate: sequence.quantityPicturesCreate || 1,
                quantityPicturesClose: sequence.quantityPicturesClose || 1,
                status: "A",
                createdAt: new Date().toISOString(),
                frecuencyId: sequence.frecuencyId || 0,
                frecuencyCode: sequence.frecuencyCode || "",
              };

              // Create cloned sequence
              await createCiltSequence(sequencePayload).unwrap();
              clonedCount++;
            } catch (individualError) {
              console.error(`Error al clonar la secuencia ${sequence.id}:`, individualError);
              // Continue with the next sequence instead of failing the entire process
            }
          }
          
          console.log(`Se clonaron exitosamente ${clonedCount} de ${sequences.length} secuencias`);
          
          if (clonedCount === 0) {
            throw new Error("No se pudo clonar ninguna secuencia");
          }
        } catch (seqError) {
          console.error("Error al clonar secuencias:", seqError);
          throw new Error(`Error al clonar secuencias: ${seqError}`);
        }
      }

      // Show success notification with information about cloned sequences
      notification.success({
        message: Strings.success,
        description: sequences && sequences.length > 0 
          ? `${Strings.ciltMasterCreateSuccess} ${Strings.copy} ${Strings.withSequences.replace('{count}', sequences.length.toString())}` 
          : `${Strings.ciltMasterCreateSuccess} ${Strings.copy}`,
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
