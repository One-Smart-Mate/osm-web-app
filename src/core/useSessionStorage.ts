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
        }
    }
    const getSessionStorageItem = (): T | undefined => {
        try{
            const item = window.sessionStorage.getItem(key)
            if (item === null) return undefined
            return JSON.parse(item)
        }catch(error){
            window.console.error(error)
            return undefined
        }
    }
    const removeSessionStorageItem = (): void => {
        try {
          window.sessionStorage.removeItem(key);
        } catch (error) {
          window.console.error(error);
        }
      };
      return [
        getSessionStorageItem,
        setSessionStorageItem,
        removeSessionStorageItem,
      ];
}