import { notification } from "antd";

export type TUseSessionStorage<T> = [
    () => T | undefined,
    (value: T) => void,
    () => void,
  ];

export const useSessionStorage = <T>(key: string): TUseSessionStorage<T> =>{
    const setSessionStorageItem = (value: T): void => {
        try{
            window.sessionStorage.setItem(key, JSON.stringify(value))
        }catch(error){
            window.console.error(error)
            notification.error({
              message: "Upload Error",
              description: "Your information could not be saved. Try again later.",
              placement: "topRight",
            });
        }
    }
    const getSessionStorageItem = (): T | undefined => {
        try{
            const item = window.sessionStorage.getItem(key)
            if (item === null) return undefined
            return JSON.parse(item)
        }catch(error){
            window.console.error(error)
            notification.error({
              message: "Upload Error",
              description: "There was a problem retrieving your information. Try again later.",
              placement: "topRight",
            });
            return undefined
        }
    }
    const removeSessionStorageItem = (): void => {
        try {
          window.sessionStorage.removeItem(key);
        } catch (error) {
          window.console.error(error);
          notification.error({
            message: "Upload Error",
            description: "Your information could not be deleted. Try again later.",
            placement: "topRight",
          });
        }
      };
      return [
        getSessionStorageItem,
        setSessionStorageItem,
        removeSessionStorageItem,
      ];
}