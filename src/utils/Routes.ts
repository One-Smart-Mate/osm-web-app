const Login = "/";
const AdminDirectionHome = "/companies";
const Priorities = "/priorities";
const Sites = "/sites";
const CardTypes = "/card-types";
const Preclassifiers = "/preclassifiers";
const Users = "/users";
const Levels = "/levels";
const Cards = "/cards";
const Positions = "/positions";
export const ResetPasswordRoute = "/reset-password";
const Charts = "/charts";
export const UnauthorizedRoute = "/unauthorized";

const Company = "/company/:company";
const Site = "/site/:site";
const CardType = "/card-type/:cardType";
const CardDetails = "/card/:card/details";

const AdminPrefix = "/admin";
const SysadminPrefix = "/sys-admin";
const LocalAdminPrefix = "/local-admin";

export default {
  AdminDirectionHome,
  Priorities,
  CardTypes,
  Preclassifiers,
  Users,
  Levels,
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
  PublicCardDetailsRoute
};
