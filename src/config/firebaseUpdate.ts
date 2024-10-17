import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase"; // Assuming you have initialized Firebase Storage correctly in ./firebase
import { v4 as uuid } from "uuid";

interface UploadFile {
  name: string;
  originFileObj: File;
}

export const updateImageToFirebaseAndGetURL = async (
  directory: string,
  url: string,
  file: UploadFile
): Promise<string> => {
  try {
    const imageRef = ref(storage, url);
    const uniqueId: string = uuid();
    await deleteObject(imageRef);
    const newImageRef = ref(
      storage,
      `/images/${directory}/${file.name + uniqueId}`
    );
    await uploadBytes(newImageRef, file.originFileObj);
    const downloadURL = await getDownloadURL(newImageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error updating/deleting file in Firebase: ", error);
    throw error;
  }
};
