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
const Positions = "/positions";
const AmDiscardReasons = "/am-discard-reasons";
export const ResetPasswordRoute = "/reset-password";
const Charts = "/charts";
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
  Login,
  CardDetails,
  Charts,
  AdminPrefix,
  SysadminPrefix,
  LocalAdminPrefix,
  Sites,
  Site,
  Company,
  CardType,
  Positions,
  AmDiscardReasons,
  PublicCardDetailsRoute
};
