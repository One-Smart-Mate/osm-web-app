import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from 'uuid';
import { notification } from "antd";

interface UploadFile {
  name: string;
  originFileObj: File;
}

export const uploadImageToFirebaseAndGetURL = async (directory: string, file: UploadFile): Promise<string> => {
  try {
    const uniqueId: string = uuid()
    const imageRef = ref(storage, `/images/${directory}/${file.name + uniqueId}`);
    await uploadBytes(imageRef, file.originFileObj);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase: ", error);
    notification.error({
      message: "Upload Error",
      description: "An error occurred while uploading the file to Firebase. Please try again.",
      placement: "topRight",
    });
    throw error;
  }
};


export const handleUploadToFirebaseStorage = async (directory: string, file: UploadFile, fileType: String): Promise<string> => {
  try {
    const uniqueId: string = uuid()
    const imageRef = ref(storage, `/images/${directory}/${file.name}_${uniqueId}.${fileType}`);
    await uploadBytes(imageRef, file.originFileObj);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase: ", error);
    notification.error({
      message: "Upload Error",
      description: "An error occurred while uploading the file to Firebase. Please try again.",
      placement: "topRight",
    });
    throw error;
  }
};

export const FIREBASE_COMPANY_DIRECTORY = "company"
export const FIREBASE_SITE_DIRECTORY = "site"
export const FIREBASE_IMAGE_FILE_TYPE = "jpg"