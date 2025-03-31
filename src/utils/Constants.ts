const PAGE_SIZE = 50;
const PAGE_SIZE_OPTIONS = ["10", "20", "30","50"];
const DATE_FORMAT = "YYYY-MM-DD";
const AUDIO_FORMATS = ["mp3", "wav"];
const VIDEO_FORMATS = ["mp4", "webm"];
const IMAGE_FORMATS = ["jpg", "jpeg", "png"];

// User roles
const ihSisAdmin = "IH_sis_admin";
const mechanic = "mechanic";
const localAdmin = "local_admin";
const localSisAdmin = "local_sis_admin";
const operator = "operator";
const externalProvider = "external_provider";
const id = "Id";

// Language options
const enOption = "English";
const esOption = "Español"

const externalProviderRouteVal = "/external/"
const externalProviderConstant = "external"

// Level Clonation
const responsibleId = "responsibleId";
const siteId = "siteId";
const superiorId = "superiorId";
const name = "name";
const description = "description";
const levelMachineId = "levelMachineId";
const notify = "notify";

const cloneBridge = "_clone_";

// Status values
const STATUS_ACTIVE = "A";
const STATUS_SUSPENDED = "S";
const STATUS_CANCELED = "C";

// Position table constants
const DEFAULT_PAGE_SIZE = 6;
const POSITION_PAGE_OPTIONS = ['6', '10', '20', '50'];
const TABLE_SCROLL_CONFIG = { x: 'max-content' };

// Position popup style
const POSITION_POPUP_STYLE = {
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: "300px"
};

const nodeStartBridgeCollapsed = "node_";
const nodeEndBridgeCollapserd = "_collapsed";

export default {
  PAGE_SIZE,
  DATE_FORMAT,
  PAGE_SIZE_OPTIONS,
  AUDIO_FORMATS,
  IMAGE_FORMATS,
  VIDEO_FORMATS,
  ihSisAdmin,
  mechanic,
  localAdmin,
  localSisAdmin,
  operator,
  externalProvider,
  id,
  esOption,
  enOption,
  externalProviderRouteVal,
  externalProviderConstant,
  responsibleId,
  siteId,
  superiorId,
  name,
  description,
  levelMachineId,
  notify,
  cloneBridge,
  nodeStartBridgeCollapsed,
  nodeEndBridgeCollapserd,
  STATUS_ACTIVE,
  STATUS_SUSPENDED,
  STATUS_CANCELED,
  DEFAULT_PAGE_SIZE,
  POSITION_PAGE_OPTIONS,
  TABLE_SCROLL_CONFIG,
  POSITION_POPUP_STYLE
};
