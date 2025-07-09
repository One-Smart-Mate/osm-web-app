import { createSlice } from "@reduxjs/toolkit";
import Strings from "../utils/localizations/Strings";
import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface GenericState {
  rowData: any;
  indicators: {
    company: { updated: boolean };
    site: { updated: boolean };
    priority: { updated: boolean };
    cardType: { updated: boolean };
    level: { created: boolean; updated: boolean };
    preclassifier: { updated: boolean };
    user: { updated: boolean };
    card: { updated: boolean };
  };
  siteId: string;
  siteCode: string;
  cardUpdatedIndicator: boolean;
  isSessionLocked: boolean;
}

const initialState: GenericState = {
  rowData: null,
  indicators: {
    company: { updated: false },
    site: { updated: false },
    priority: { updated: false },
    cardType: { updated: false },
    level: { created: false, updated: false },
    preclassifier: { updated: false },
    user: { updated: false },
    card: { updated: false },
  },
  siteId: "",
  siteCode: Strings.empty,
  cardUpdatedIndicator: false,
  isSessionLocked: false,
};

const genericSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setRowData: (state, action) => {
      state.rowData = action.payload;
    },
    resetRowData: (state) => {
      state.rowData = null;
    },
    setGeneratedSiteCode: (state, action) => {
      state.siteCode = action.payload;
    },
    resetGeneratedSiteCode: (state) => {
      state.siteCode = Strings.empty;
    },
    setSiteId: (state, action) => {
      state.siteId = action.payload;
    },
    setCompanyUpdatedIndicator: (state) => {
      state.indicators.company.updated = true;
    },
    resetCompanyUpdatedIndicator: (state) => {
      state.indicators.company.updated = false;
    },
    setSiteUpdatedIndicator: (state) => {
      state.indicators.site.updated = true;
    },
    resetSiteUpdatedIndicator: (state) => {
      state.indicators.site.updated = false;
    },
    setPriorityUpdatedIndicator: (state) => {
      state.indicators.priority.updated = true;
    },
    resetPriorityUpdatedIndicator: (state) => {
      state.indicators.priority.updated = false;
    },
    setCardTypeUpdatedIndicator: (state) => {
      state.indicators.cardType.updated = true;
    },
    resetCardTypeUpdatedIndicator: (state) => {
      state.indicators.cardType.updated = false;
    },
    setLevelCreatedIndicator: (state) => {
      state.indicators.level.created = true;
    },
    resetLevelCreatedIndicator: (state) => {
      state.indicators.level.created = false;
    },
    setLevelUpdatedIndicator: (state) => {
      state.indicators.level.updated = true;
    },
    resetLevelUpdatedIndicator: (state) => {
      state.indicators.level.updated = false;
    },
    setPreclassifierUpdatedIndicator: (state) => {
      state.indicators.preclassifier.updated = true;
    },
    resetPreclassifierUpdatedIndicator: (state) => {
      state.indicators.preclassifier.updated = false;
    },
    setUserUpdatedIndicator: (state) => {
      state.indicators.user.updated = true;
    },
    resetUserUpdatedIndicator: (state) => {
      state.indicators.user.updated = false;
    },
    setCardUpdatedIndicator: (state) => {
      state.indicators.card.updated = true;
    },
    resetCardUpdatedIndicator: (state) => {
      state.indicators.card.updated = false;
    },
    setSessionLocked: (state, action: PayloadAction<boolean>) => {
      state.isSessionLocked = action.payload;
    },
    toggleSessionLock: (state) => {
      state.isSessionLocked = !state.isSessionLocked;
    },
  },
});

export const {
  setRowData,
  resetRowData,
  setSiteId,
  setCompanyUpdatedIndicator,
  resetCompanyUpdatedIndicator,
  setSiteUpdatedIndicator,
  resetSiteUpdatedIndicator,
  setPriorityUpdatedIndicator,
  resetPriorityUpdatedIndicator,
  setCardTypeUpdatedIndicator,
  resetCardTypeUpdatedIndicator,
  setLevelCreatedIndicator,
  resetLevelCreatedIndicator,
  setLevelUpdatedIndicator,
  resetLevelUpdatedIndicator,
  setPreclassifierUpdatedIndicator,
  resetPreclassifierUpdatedIndicator,
  setGeneratedSiteCode,
  resetGeneratedSiteCode,
  setUserUpdatedIndicator,
  resetUserUpdatedIndicator,
  setCardUpdatedIndicator,
  resetCardUpdatedIndicator,
  setSessionLocked,
  toggleSessionLock,
} = genericSlice.actions;

export default genericSlice.reducer;

export const selectCurrentRowData = (state: any) => state.data.rowData;
export const selectGeneratedSiteCode = (state: any) => state.data.siteCode;
export const selectSiteUpdatedIndicator = (state: any) =>
  state.data.indicators.site.updated;
export const selectCompanyUpdatedIndicator = (state: any) =>
  state.data.indicators.company.updated;
export const selectPriorityUpdatedIndicator = (state: any) =>
  state.data.indicators.priority.updated;
export const selectCardTypeUpdatedIndicator = (state: any) =>
  state.data.indicators.cardType.updated;
export const selectLevelCreatedIndicator = (state: any) =>
  state.data.indicators.level.created;
export const selectLevelUpdatedIndicator = (state: any) =>
  state.data.indicators.level.updated;
export const selectPreclassifierUpdatedIndicator = (state: any) =>
  state.data.indicators.preclassifier.updated;
export const selectUserUpdatedIndicator = (state: any) =>
  state.data.indicators.user.updated;
export const selectCardUpdatedIndicator = (state: any) =>
  state.data.indicators.card.updated;
export const selectSiteId = (state: any) => state.data.siteId;
export const selectIsSessionLocked = (state: RootState) => state.data.isSessionLocked;
