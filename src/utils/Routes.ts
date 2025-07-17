const Login = "/";
const AdminDirectionHome = "/companies";
const Priorities = "/priorities";
const Sites = "/sites";
const CardTypes = "/card-types";
const Preclassifiers = "/preclassifiers";
const Users = "/users";
const Levels = "/levels";
const LevelsReadOnly = "/levels-readonly";
const Cards = "/cards";
const TagsFastPassword = "/tags-fast-password";
const Positions = "/positions";
const AmDiscardReasons = "/am-discard-reasons";
const OplTypes = "/opl-types";
export const ResetPasswordRoute = "/reset-password";
const Charts = "/charts";
const CiltCharts = "/cilt-charts";
export const UnauthorizedRoute = "/unauthorized";
const SystemHealth = "/system-health";

const Company = "/company/:company";
const Site = "/site/:site";
const CardType = "/card-type/:cardType";
const CardDetails = "/card/:card/details";

const AdminPrefix = "/admin";
const SysadminPrefix = "/sys-admin";
const LocalAdminPrefix = "/local-admin";
const PublicCardDetailsRoute = "/public/card/:cardId/details";


export default {
  AdminDirectionHome,
  SystemHealth,
  Priorities,
  CardTypes,
  Preclassifiers,
  Users,
  Levels,
  LevelsReadOnly,
  Cards,
  TagsFastPassword,
  Login,
  CardDetails,
  Charts,
  CiltCharts,
  AdminPrefix,
  SysadminPrefix,
  LocalAdminPrefix,
  Sites,
  Site,
  Company,
  CardType,
  Positions,
  AmDiscardReasons,
  OplTypes,
  PublicCardDetailsRoute
};
