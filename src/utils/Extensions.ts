import { RuleObject } from "antd/lib/form";
import User from "../data/user/user";
import Routes from "../utils/Routes";
import Strings from "./localizations/Strings";
import { v4 as uuidv4 } from "uuid";
import Constants from "./Constants";
import { Evidences } from "../data/card/card";

export const isAudioURL = (url: string) => {
  return Constants.AUDIO_FORMATS.some((ext) => url.includes(ext));
};

export const isImageURL = (url: string) => {
  return Constants.IMAGE_FORMATS.some((ext) => url.includes(ext));
};

export const isVideoURL = (url: string) => {
  return Constants.VIDEO_FORMATS.some((ext) => url.includes(ext));
};

export const hasVideos = (evidenceArray?: Evidences[]): boolean =>
  Array.isArray(evidenceArray) &&
  evidenceArray.some((evidence) => isVideoURL(evidence.evidenceName));

export const hasAudios = (evidenceArray?: Evidences[]): boolean =>
  Array.isArray(evidenceArray) &&
  evidenceArray.some((evidence) => isAudioURL(evidence.evidenceName));

export const hasImages = (evidenceArray?: Evidences[]): boolean =>
  Array.isArray(evidenceArray) &&
  evidenceArray.some((evidence) => isImageURL(evidence.evidenceName));

export const generateShortUUID = (): string => {
  const fullUUID = uuidv4();
  const shortUUID = fullUUID.replace(/-/g, "").substring(0, 6).toUpperCase();
  return shortUUID;
};

export const validateEmail = (
  _: RuleObject,
  value: string,
  callback: (error?: string) => void
) => {
  if (!value || value.trim() === "") {
    callback(Strings.requiredEmail);
  } else if (!/^\S+@\S+\.\S+$/.test(value.trim())) {
    callback(Strings.requiredValidEmailAddress);
  } else {
    callback();
  }
};

export const getInitRoute = (user: User): string => {
  const isihSisAdmin = user.roles?.some(
    (role) => role === Constants.ihSisAdmin
  );
  if (isihSisAdmin) {
    return Routes.AdminPrefix + Routes.AdminDirectionHome;
  }
  const isLocalSisAdmin = user.roles?.some(
    (role) => role === Constants.localSisAdmin
  );
  const isLocalAdmin = user.roles?.some(
    (role) => role === Constants.localAdmin
  );

  return isLocalSisAdmin
    ? Routes.SysadminPrefix + Routes.Sites
    : isLocalAdmin
    ? Routes.LocalAdminPrefix + Routes.Sites
    : "/";
};

export const getUserRol = (user: User): UserRoles | null => {
  const isihSisAdmin = user.roles?.some(
    (role) => role === Constants.ihSisAdmin
  );
  if (isihSisAdmin) {
    return UserRoles.IHSISADMIN;
  }
  const isLocalSisAdmin = user.roles?.some(
    (role) => role === Constants.localSisAdmin
  );
  const isLocalAdmin = user.roles?.some(
    (role) => role === Constants.localAdmin
  );

  return isLocalSisAdmin
    ? UserRoles.LOCALSYSADMIN
    : isLocalAdmin
    ? UserRoles.LOCALADMIN
    : UserRoles.UNDEFINED;
};

export const enum UserRoles {
  IHSISADMIN,
  LOCALSYSADMIN,
  LOCALADMIN,
  UNDEFINED,
}

export const formatDate = (date: string | null) => {
  if (!date) {
    return null;
  }

  const dateObject: Date = new Date(date);
  if (isNaN(dateObject.getTime())) {
    return null;
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",  // Day of the week
    year: "numeric",  // Complete year
    month: "long",    // Complete name of the month
    day: "numeric",   // Day
    hour: "numeric",  // Hour with two digits
    minute: "numeric",// Minutes with two digits
    timeZoneName: "short", // Short name of the timezone
  };

  // Use the automatic timezone
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(dateObject);

  return formattedDate;
};




export const getDaysSince = (dateString: string) => {
  const dateObject: Date = new Date(dateString);
  const currentDate = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const differenceInTime = Math.abs(
    currentDate.getTime() - dateObject.getTime()
  );
  const differenceInDays = Math.round(differenceInTime / oneDay);
  return differenceInDays;
};

export const getDaysBetween = (date1: string, date2: string): number => {
  if (date1 === null || date2 === null) {
    return 0;
  }

  const normalizeDate = (date: string): Date | null => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return null;
    }
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);

  if (!d1 || !d2) {
    console.error("One of the dates is not valid:", date1, date2);
    return 0;
  }

  const differenceInMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(differenceInMs / (24 * 60 * 60 * 1000));
};

export const RESPONSIVE_LIST = {
  gutter: 20,
  xs: 1,
  sm: 2,
  md: 2,
  lg: 2,
  xl: 3,
  xxl: 5,
};

export const RESPONSIVE_AVATAR = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 80,
  xxl: 80,
};

const compareDates = (date1: string, date2: string): boolean => {
  if (!date1 || !date2) {
    throw new Error("Both dates must be provided.");
  }

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new Error("One of the dates is not valid.");
  }

  const date1Formatted = d1.toISOString().split("T")[0];
  const date2Formatted = d2.toISOString().split("T")[0];

 // console.log("Formatted Date 1:", date1Formatted);
 // console.log("Formatted Date 2:", date2Formatted);

  return date1Formatted <= date2Formatted;
};

export const getStatusAndText = (
  input: string
): { status: "error" | "success"; text: string } => {
  if (input === Strings.activeStatus) {
    return {
      status: "success",
      text: Strings.active,
    };
  } else {
    return {
      status: "error",
      text: Strings.inactive,
    };
  }
};

export const getCardStatusAndText = (
  input: string,
  duDate?: string,
  DefiniSolutionDate?: string,
  CreatDate?: string
): { status: "error" | "success"; text: string; dateStatus: string } => {
  const currentDate = new Date();

  switch (input) {
    case "A":
    case "P":
    case "V":
      if (duDate) {
        const isExpired = compareDates(duDate, currentDate.toISOString());
        return {
          status: "success",
          text: Strings.open,
          dateStatus: isExpired ? Strings.expired : Strings.current,
        };
      } else {
        return {
          status: "success",
          text: Strings.open,
          dateStatus: Strings.current,
        };
      }

    case "R":
      if (duDate) {
        if (DefiniSolutionDate) {
          const isOnTime = compareDates(DefiniSolutionDate, duDate);
          if (CreatDate) {
            const daysBetween = getDaysBetween(CreatDate, DefiniSolutionDate);
          //  console.log("compareDates result: ", isOnTime);
           // console.log("Days between: ", daysBetween);

            return {
              status: "error",
              text: Strings.closed,
              dateStatus:
                isOnTime || daysBetween === 0
                  ? Strings.onTime
                  : Strings.expired,
            };
          } else {
            return {
              status: "error",
              text: Strings.closed,
              dateStatus: " ",
            };
          }
        } else {
          return {
            status: "error",
            text: Strings.closed,
            dateStatus: " ",
          };
        }
      } else {
        return {
          status: "error",
          text: Strings.closed,
          dateStatus: " ",
        };
      }

    default:
      return {
        status: "error",
        text: Strings.tagStatusCanceled,
        dateStatus: " ",
      };
  }
};



export const capitalizeFirstLetter = (input: string): string => {
  if (!input) return "";
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
};


export const formatCompanyName = (input: string): string => {
  return input
  .trim()
  .normalize("NFD") // separate accents from letters
  .replace(/[\u0300-\u036f]/g, "") // remove accents
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, "") // remove special characters except spaces
  .replace(/\s+/g, "_"); // replace spaces with underscores
};


export const isRedesign = (): boolean => {
  const redesign = import.meta.env.VITE_IS_REDESIGN;
  return redesign != null && redesign != undefined && redesign != "" && redesign == "yes";
}
