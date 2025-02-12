import i18n from "../../config/i18n";

class StringsBase {
  // For the Routes.tsx sidebar
  static notificationsSB = "notificationsSB";
  static companiesSB = "companiesSB";
  static prioritiesSB = "prioritiesSB";
  static usersSB = "usersSB";
  static siteUsersSB = "siteUsersSB";
  static sitesSB = "sitesSB";
  static cardTypesSB = "cardTypesSB";
  static preclassifiersSB = "preclassifiersSB";
  static levelsSB = "levelsSB";
  static cardsSB = "cardsSB";
  static cardDetailsSB = "cardDetailsSB";
  static chartsSB = "chartsSB";

  // Rooutes
  static companyParam = "companyParam";
  static siteParam = "siteParam";
  static cardParam = "cardParam";
  static cardTypeParam = "cardTypeParam";
  static colon = "colon";

  static login = "login";
  static sendCode = "sendCode";
  static logout = "logout";
  static password = "password";
  static newPassword = "newPassword";
  static updatePassword = "updatePassword";
  static confirmPassword = "confirmPassword";
  static uploadCardDataWithDataNet = "uploadCardDataWithDataNet";
  static uploadCardEvidenceWithDataNet = "uploadCardEvidenceWithDataNet";
  static searchRecord = "searchRecord";
  static clearFiltersAndSorters = "clearFiltersAndSorters";
  static empty = "empty";
  static welcome = "welcome";
  static resetPassword = "resetPassword";
  static sendCodeMessage = "sendCodeMessage";
  static enterTheCode = "enterTheCode";
  static enterTheNewPassword = "enterTheNewPassword";
  static logoutModalTittle = "logoutModalTittle";
  static logutModalContent = "logutModalContent";
  static white = "white";
  static updateUser = "updateUser";
  static creation = "creation";
  static definitiveSolution = "definitiveSolution";
  static provisionalSolution = "provisionalSolution";
  static provisionalUser = "provisionalUser";
  static provisionalDate = "provisionalDate";
  static days = "days";
  static definitiveUsers = "definitiveUsers";
  static definitiveDate = "definitiveDate";
  static provisionalSoluitonApplied = "provisionalSoluitonApplied";
  static NA = "NA";
  static noResponsible = "noResponsible";
  static noMechanic = "noMechanic";
  static noDefinitiveUser = "noDefinitiveUser";
  static images = "images";
  static videos = "videos";
  static audios = "audios";
  static evidences = "evidences";
  static none = "none";

  // Login re-design
  static entrepriseName = "entrepriseName";
  static email = "email";
  static loginText = "loginText";
  static forgotPassword = "forgotPassword";

  // errors login form
  static requiredEmail = "requiredEmail";
  static requiredPassword = "requiredPassword";
  static requiredValidEmailAddress = "requiredValidEmailAddress";
  static requiredInfo = "requiredInfo";

  // errors user form
  static requiredUserName = "requiredUserName";
  static requiredSite = "requiredSite";
  static requiredRoles = "requiredRoles";
  static requiredConfirmPassword = "requiredConfirmPassword";
  static passwordsDoNotMatch = "passwordsDoNotMatch";
  static onlyLetters = "onlyLetters";
  static passwordLenght = "passwordLenght";
  static uploadFileRequired = "uploadFileRequired";

  // errors company form
  static requiredCompanyName = "requiredCompanyName";
  static requiredRFC = "requiredRFC";
  static requiredContacName = "requiredContacName";
  static requiredPosition = "requiredPosition";
  static requiredAddress = "requiredAddress";
  static requiredPhone = "requiredPhone";
  static requiredExtension = "requiredExtension";
  static requiredCellular = "requiredCellular";
  static requiredLogo = "requiredLogo";

  // errors priority form
  static requiredCode = "requiredCode";
  static requiredDescription = "requiredDescription";
  static requiredDaysNumber = "requiredDaysNumber";
  static requiredResponsableId = "requiredResponsableId";
  static requiredMechanic = "requiredMechanic";
  static requiredPriority = "requiredPriority";

  // company
  static logo = "logo";
  static companyName = "companyName";
  static rfc = "rfc";
  static companyAddress = "companyAddress";
  static contact = "contact";
  static position = "position";
  static phone = "phone";
  static extension = "extension";
  static cellular = "cellular";

  //This logo will be removed when firebase upload is implemented.
  static logoTemp = "logoTemp";
  static noExtension = "No extension";

  // company actions
  static viewSites = "viewSites";

  // levels
  static notify = "notify";

  // site actions
  static viewPriorities = "viewPriorities";
  static viewLevels = "viewLevels";
  static viewCardTypes = "viewCardTypes";
  static viewCards = "viewCards";
  static viewCharts = "viewCharts";
  static viewUsers = "viewUsers";
  static importUsers = "importUsers";

  // errors sites form
  static requiredLatitud = "requiredLatitud";
  static requiredLongitud = "requiredLongitud";
  static requiredSiteCode = "requiredSiteCode";
  static requiredSiteBusinessName = "requiredSiteBusinessName";
  static requiredSiteType = "requiredSiteType";
  static requiredDueDate = "requiredDueDate";
  static requiredMonthlyPayment = "requiredMonthlyPayment";
  static requiredCurrency = "requiredCurrency";
  static requiredAppHistoryDays = "requiredAppHistoryDays";
  static companies = "companies";
  static companiesUpperCase = "companiesUpperCase";
  static users = "users";
  static usersOf = "usersOf";
  static requiredUserLicense = "requiredUserLicense";
  static enable = "enable";

  // Import users form
  static dragFile = "dragFile";
  static singleUpload = "singleUpload";

  // sites
  static site = "site";
  static sitesOf = "sitesOf";
  static yourSitesOfCompany = "yourSitesOfCompany";
  static sites = "sites";
  static latitud = "latitud";
  static longitud = "longitud";
  static siteCode = "siteCode";
  static siteBusinessName = "siteBusinessName";
  static siteType = "siteType";
  static monthlyPayment = "monthlyPayment";
  static currency = "currency";
  static appHistoryDays = "appHistoryDays";
  static userLicense = "userLicense";
  static concurrent = "concurrent";
  static named = "named";
  static concurrente = "concurrente";
  static nombrado = "nombrado";
  static quantity = "quantity";
  static requiredAdditionalField = "requiredAdditionalField";

  // CardTypes
  static methodology = "methodology";
  static name = "name";
  static color = "color";
  static responsible = "responsible";
  static cardTypeMethodology = "cardTypeMethodology";
  static cardTypesOf = "cardTypesOf";
  static quantityPictures = "quantityPictures";
  static quantityAudios = "quantityAudios";
  static quantityVideos = "quantityVideos";
  static picturesCreatePs = "picturesCreatePs";
  static audiosCreatePs = "audiosCreatePs";
  static videosCreatePs = "videosCreatePs";
  static durationInSeconds = "durationInSeconds";
  static atCreation = "atCreation";
  static atProvisionalSolution = "atProvisionalSolution";
  static atDefinitiveSolution = "atDefinitiveSolution";

  // cardtype methodology
  static M = "M";
  static C = "C";
  static updateCardType = "updateCardType";

  static roles = "roles";
  static createNode = "createNode";

  static requiredMethodology = "requiredMethodology";
  static requiredCardTypeName = "requiredCardTypeName";
  static requiredColor = "requiredColor";

  static viewPreclassifiers = "viewPreclassifiers";

  static prioritiesOf = "prioritiesOf";
  static priority = "priority";
  static code = "code";
  static enterCode = "enterCode";
  static description = "description";
  static levelMachineId = "levelMachineId";
  static daysNumber = "daysNumber";
  static updatePriority = "updatePriority";

  static createCompany = "createCompany";
  static updateCompany = "updateCompany";
  static createPriority = "createPriority";
  static createUserFor = "createUserFor";
  static importUsersFor = "importUsersFor";
  static createUser = "createUser";
  static createSite = "createSite";
  static updateSite = "updateSite";
  static createPreclassifier = "createPreclassifier";
  static createCardType = "createCardType";
  static createLevel = "createLevel";
  static updateLevel = "updateLevel";
  static createNodefor = "createNodefor";

  static cards = "cards";
  static tagDetailsOf = "tagDetailsOf";
  static type = "type";
  static cardNumber = "cardNumber";
  static area = "area";
  static date = "date";
  static mechanic = "mechanic";
  static mechanics = "mechanics";
  static creator = "creator";
  static comments = "comments";
  static updateMechanic = "updateMechanic";
  static changeLog = "changeLog";
  static noDueDate = "noDueDate";

  static tagsOf = "tagsOf";
  static filters = "filters";
  static status = "status";
  static dueDate = "dueDate";
  static cardType = "cardType";
  static problemType = "problemType";
  static location = "location";
  static createdBy = "createdBy";
  static problemDescription = "problemDescription";

  static tagStatusCanceled = "tagStatusCanceled";
  static tagDate = "tagDate";
  static tagDays = "tagDays";
  static ceroDays = "ceroDays";
  static tagNumber = "tagNumber";
  static tagPriority = "tagPriority";
  static dateStatus = "dateStatus";
  static tagMechanic = "tagMechanic";
  static tagProvisionalUser = "tagProvisionalUser";
  static tagProvisionalSoluitonApplied = "tagProvisionalSoluitonApplied";
  static creationDate = "creationDate";
  static daysSinceCreation = "daysSinceCreation";
  static cero = "cero";
  static anomalyDetected = "anomalyDetected";
  static appProvisionalUser = "appProvisionalUser";
  static appDefinitiveUser = "appDefinitiveUser";
  static definitiveUser = "definitiveUser";
  static definitiveSolutionApplied = "definitiveSolutionApplied";

  static evidencesAtCreationDivider = "evidencesAtCreationDivider";
  static definitiveSolutionDivider = "definitiveSolutionDivider";
  static evidencesAtDefinitiveDivider = "evidencesAtDefinitiveDivider";
  static provisionalSolutionDivider = "provisionalSolutionDivider";
  static evidencesAtProvisionalDivider = "evidencesAtProvisionalDivider";
  static changeLogDivider = "changeLogDivider";

  static expired = "expired";
  static current = "current";
  static onTime = "onTime";

  static chartsOf = "chartsOf";
  static anomalies = "anomalies";
  static areas = "areas";
  static creators = "creators";
  static machines = "machines";
  static tagMonitoring = "tagMonitoring";
  static totalCards = "totalCards";
  static total = "total";
  static areaChart = "areaChart";
  static machine = "machine";
  static machineLocation = "machineLocation";
  static creatorChart = "creatorChart";
  static cardName = "cardName";
  static preclassifierChart = "preclassifierChart";
  static year = "year";
  static week = "week";
  static cumulativeIssued = "cumulativeIssued";
  static cumulativeEradicated = "cumulativeEradicated";

  static edit = "edit";
  static create = "create";
  static save = "save";
  static cancel = "cancel";
  static actions = "actions";
  static delete = "delete";
  static confirm = "confirm";

  static tagVersion = "tagVersion";

  // Tipo de evidencia
  static AUCR = "AUCR";
  static AUCL = "AUCL";
  static AUPS = "AUPS";
  static VICR = "VICR";
  static VICL = "VICL";
  static VIPS = "VIPS";
  static IMCR = "IMCR";
  static IMPS = "IMPS";
  static IMCL = "IMCL";

  // Estado
  static active = "active";
  static activeStatus = "activeStatus";
  static inactive = "inactive";
  static open = "open";
  static closed = "closed";
  static pastDue = "pastDue";

  static preclassifiersof = "preclassifiersof";
  static preclassifier = "preclassifier";
  static updatePreclassifier = "updatePreclassifier";
  static levelsof = "levelsof";

  // Páginas de error
  static notFoundPageTitle = "notFoundPageTitle";
  static notFoundPageSubTitle = "notFoundPageSubTitle";
  static unauthorizedPageTitle = "unauthorizedPageTitle";
  static unauthorizedPageSubTitle = "unauthorizedPageSubTitle";
  static goBack = "goBack";

  static downloadData = "downloadData";

  // Presets de selector de rango
  static last7days = "last7days";
  static last14days = "last14days";
  static last30days = "last30days";
  static last90days = "last90days";

  static failedToDownload = "failedToDownload";

  // Notificaciones de advertencia
  static restrictedAccessMessage = "restrictedAccessMessage";

  // Árbol de niveles
  static close = "close";
  static createLevelBtn = "createLevelBtn";
  static updateLevelTree = "updateLevelTree";
  static details = "details";
  static levelsOf = "levelsOf";
  static newLevel = "newLevel";
  static level = "level";
  static errorFetchingLevels = "errorFetchingLevels";
  static errorSavingLevel = "errorSavingLevel";
  static defaultSiteName = "defaultSiteName";
  static detailsOptionA = "detailsOptionA";
  static detailsOptionS = "detailsOptionS";
  static detailsOptionC = "detailsOptionC";
  static detailsStatusActive = "detailsStatusActive";
  static detailsStatusSuspended = "detailsStatusSuspended";
  static detailsStatsCancelled = "detailsStatsCancelled";
  static levelOptions = "levelOptions";

  // Tooltips de preclasificadores
  static preclassifierCodeTooltip = "preclassifierCodeTooltip";
  static preclassifierDescriptionTooltip = "preclassifierDescriptionTooltip";
  static preclassifierStatusTooltip = "preclassifierStatusTooltip";

  // Tooltips del formulario de prioridades
  static priorityCodeTooltip = "priorityCodeTooltip";
  static priorityDescriptionTooltip = "priorityDescriptionTooltip";
  static priorityDaysNumberTooltip = "priorityDaysNumberTooltip";

  // Tooltips de formularios basados en SiteEntity
  static siteNameTooltip = "siteNameTooltip";
  static siteRfcTooltip = "siteRfcTooltip";
  static siteBusinessNameTooltip = "siteBusinessNameTooltip";
  static siteTypeTooltip = "siteTypeTooltip";
  static siteLatitudeTooltip = "siteLatitudeTooltip";
  static siteLongitudeTooltip = "siteLongitudeTooltip";
  static siteAddressTooltip = "siteAddressTooltip";
  static siteContactTooltip = "siteContactTooltip";
  static sitePositionTooltip = "sitePositionTooltip";
  static sitePhoneTooltip = "sitePhoneTooltip";
  static siteExtensionTooltip = "siteExtensionTooltip";
  static siteCellularTooltip = "siteCellularTooltip";
  static siteEmailTooltip = "siteEmailTooltip";
  static siteDueDateTooltip = "siteDueDateTooltip";
  static siteMonthlyPaymentTooltip = "siteMonthlyPaymentTooltip";
  static siteCurrencyTooltip = "siteCurrencyTooltip";
  static siteAppHistoryDaysTooltip = "siteAppHistoryDaysTooltip";
  static siteLogoTooltip = "siteLogoTooltip";
  static siteCodeTooltip = "siteCodeTooltip";
  static appHistoryDaysTooltip = "appHistoryDaysTooltip";

  // Tooltips de registro/actualización de empresa
  static companyNameTooltip = "companyNameTooltip";
  static companyRfcTooltip = "companyRfcTooltip";
  static companyAddressTooltip = "companyAddressTooltip";
  static companyContactNameTooltip = "companyContactNameTooltip";
  static companyPositionTooltip = "companyPositionTooltip";
  static companyPhoneTooltip = "companyPhoneTooltip";
  static companyExtensionTooltip = "companyExtensionTooltip";
  static companyCellularTooltip = "companyCellularTooltip";
  static companyEmailTooltip = "companyEmailTooltip";
  static companyLogoTooltip = "companyLogoTooltip";

  static userNameTooltip = "userNameTooltip";
  static userEmailTooltip = "userEmailTooltip";
  static userPasswordTooltip = "userPasswordTooltip";
  static userConfirmPasswordTooltip = "userConfirmPasswordTooltip";
  static userSiteRfcTooltip = "userSiteRfcTooltip";
  static userUploadCardDataWithDataNetTooltip =
    "userUploadCardDataWithDataNetTooltip";
  static userUploadCardEvidenceWithDataNetTooltip =
    "userUploadCardEvidenceWithDataNetTooltip";
  static userRolesTooltip = "userRolesTooltip";
  static requiredStatus = "requiredStatus";
  static statusPlaceholder = "statusPlaceholder";
  static activeValue = "activeValue";
  static inactiveValue = "inactiveValue";
  static statusUserLabel = "statusUserLabel";
  static cardTypeMethodologyTooltip = "cardTypeMethodologyTooltip";
  static cardTypeNameTooltip = "cardTypeNameTooltip";
  static cardTypeDescriptionTooltip = "cardTypeDescriptionTooltip";
  static cardTypeColorTooltip = "cardTypeColorTooltip";
  static responsibleTooltip = "responsibleTooltip";
  static quantityPicturesCreateTooltip = "quantityPicturesCreateTooltip";
  static quantityVideosCreateTooltip = "quantityVideosCreateTooltip";
  static videosDurationCreateTooltip = "videosDurationCreateTooltip";
  static quantityAudiosCreateTooltip = "quantityAudiosCreateTooltip";
  static audiosDurationCreateTooltip = "audiosDurationCreateTooltip";
  static quantityPicturesPsTooltip = "quantityPicturesPsTooltip";
  static quantityVideosPsTooltip = "quantityVideosPsTooltip";
  static videosDurationPsTooltip = "videosDurationPsTooltip";
  static quantityAudiosPsTooltip = "quantityAudiosPsTooltip";
  static audiosDurationPsTooltip = "audiosDurationPsTooltip";

  static quantityPicturesCloseTooltip = "quantityPicturesCloseTooltip";
  static quantityVideosCloseTooltip = "quantityVideosCloseTooltip";
  static videosDurationCloseTooltip = "videosDurationCloseTooltip";
  static quantityAudiosCloseTooltip = "quantityAudiosCloseTooltip";
  static audiosDurationCloseTooltip = "audiosDurationCloseTooltip";
  static cardTypeStatusTooltip = "cardTypeStatusTooltip";
  static statusCardTypeTooltip = "statusCardTypeTooltip";
  static createNotification = "createNotification";
  static notificationName = "notificationName";
  static requiredName = "requiredName";
  static notificationDescription = "notificationDescription";
  static notificationsRequiredDescription = "notificationsRequiredDescription";
  static notificationsSite = "notificationsSite";
  static notificationsSelectSite = "notificationsSelectSite";
  static notificationsRequiredSite = "notificationsRequiredSite";
  static notificationsSelectUsers = "notificationsSelectUsers";
  static notificationsRequiredUsers = "notificationsRequiredUsers";
  static notificationsSave = "notificationsSave";
  static notificationsCancel = "notificationsCancel";
  static searchUsers = "searchUsers";
  static responsibleRequired = "responsibleRequired";
  static levelsTreeOptionCreate = "levelsTreeOptionCreate";
  static levelsTreeOptionClose = "levelsTreeOptionClose";
  static levelsTreeOptionEdit = "levelsTreeOptionEdit";
  static levelsTreeOptionClone = "levelsTreeOptionClone";
  static levelDetailsTitle = "levelDetailsTitle";
  static errorOnSubmit = "errorOnSubmit";
  static drawerTypeCreate = "drawerTypeCreate";
  static drawerTypeEdit = "drawerTypeEdit";
  static drawerTypeClone = "drawerTypeClone";
  static loading = "loading";
  static noData = "noData";
  static errorFetchingLevelData = "errorFetchingLevelData";
  static yes = "yes";
  static no = "no";
  static detailsStatusCancelled = "detailsStatusCancelled";
  static for = "for";

  static errorFetchingData = "errorFetchingData";
static namePlaceholder = "namePlaceholder";
static descriptionPlaceholder = "descriptionPlaceholder";
static responsiblePlaceholder = "responsiblePlaceholder";

// General Placeholders
static cardTypeTreeNamePlaceholder = "cardTypeTreeNamePlaceholder";
static cardTypeTreeDescriptionPlaceholder = "cardTypeTreeDescriptionPlaceholder";
static cardTypeTreeResponsiblePlaceholder = "cardTypeTreeResponsiblePlaceholder";
static cardTypeTreeStatusPlaceholder = "cardTypeTreeStatusPlaceholder";
static cardTypeTreeColorPlaceholder = "cardTypeTreeColorPlaceholder";

// Placeholders for Quantity Fields
static cardTypeTreeQuantityPicturesPlaceholder = "cardTypeTreeQuantityPicturesPlaceholder";
static cardTypeTreeQuantityVideosPlaceholder = "cardTypeTreeQuantityVideosPlaceholder";
static cardTypeTreeQuantityAudiosPlaceholder = "cardTypeTreeQuantityAudiosPlaceholder";

// Titles or Section Labels
static cardTypeTreeAtCreation = "cardTypeTreeAtCreation";
static cardTypeTreeAtProvisionalSolution = "cardTypeTreeAtProvisionalSolution";
static cardTypeTreeAtDefinitiveSolution = "cardTypeTreeAtDefinitiveSolution";

// Error Messages
static cardTypeTreeRequiredCardTypeName = "cardTypeTreeRequiredCardTypeName";
static cardTypeTreeRequiredDescription = "cardTypeTreeRequiredDescription";
static cardTypeTreeRequiredResponsableId = "cardTypeTreeRequiredResponsableId";
static cardTypeTreeRequiredColor = "cardTypeTreeRequiredColor";

// Notifications
static cardTypeTreeSuccessCardTypeUpdated = "cardTypeTreeSuccessCardTypeUpdated";
static cardTypeTreeErrorFetchingData = "cardTypeTreeErrorFetchingData";

/* Card Types and Preclassifier tree */
static cardTypesDrawerTypeCreateCardType = "cardTypesDrawerTypeCreateCardType";
static cardTypesDrawerTypeUpdateCardType = "cardTypesDrawerTypeUpdateCardType";
static cardTypesDrawerTypeCreatePreclassifier = "cardTypesDrawerTypeCreatePreclassifier";
static cardTypesDrawerTypeUpdatePreclassifier = "cardTypesDrawerTypeUpdatePreclassifier";
static cardTypesCreate = "cardTypesCreate";
static cardTypesCancel = "cardTypesCancel";
static cardTypesEdit = "cardTypesEdit";
static cardTypesEditPreclassifier = "cardTypesEditPreclassifier";
static cardTypesCloneCardType = "cardTypesCloneCardType";
static cardTypesClonePre = "cardTypesClonePre";
static cardTypesCreatePreclassifier = "cardTypesCreatePreclassifier";
static cardTypesUpdatePreclassifier = "cardTypesUpdatePreclassifier";
static cardTypesRoot = "cardTypesRoot";
static cardTypesCloneSuffix = "cardTypesCloneSuffix";
static cardTypesMethodologyError = "cardTypesMethodologyError";
static cardTypesLoadingData = "cardTypesLoadingData";
static cardTypesUpdateCardType = "cardTypesUpdateCardType";
static cardTypesCreateCardType = "cardTypesCreateCardType";
static cardTypesClonePreclassifier = "cardTypesClonePreclassifier";
static cardTypesErrorFetchingData = "cardTypesErrorFetchingData";
static cardTypesNoCardTypeIdError = "cardTypesNoCardTypeIdError";
static cardTypesOptionEdit = "cardTypesOptionEdit";
static cardTypesOptionClone = "cardTypesOptionClone";
static cardTypesOptionCreate = "cardTypesOptionCreate";
static cardTypesOptionCancel = "cardTypesOptionCancel";

static cardTypeDetailsTitle = "cardTypeDetailsTitle";
static cardTypeDetailsMethodology = "cardTypeDetailsMethodology";
static cardTypeDetailsName = "cardTypeDetailsName";
static cardTypeDetailsDescription = "cardTypeDetailsDescription";
static cardTypeDetailsColor = "cardTypeDetailsColor";
static cardTypeDetailsResponsible = "cardTypeDetailsResponsible";
static cardTypeDetailsStatus = "cardTypeDetailsStatus";

static preclassifierDetailsTitle = "preclassifierDetailsTitle";
static preclassifierDetailsCode = "preclassifierDetailsCode";
static preclassifierDetailsDescription = "preclassifierDetailsDescription";
static preclassifierDetailsStatus = "preclassifierDetailsStatus";
static notSpecified = "notSpecified";
static false = "false"

 //PDF 
 static tagDetails = "tagDetails"
 static problemDetails= "problemDetails"
 static sharePDF= "sharePDF"
 static namePDF = "namePDF"


 //Login 
 static logImgDesc = "logImgDesc"
 static enSub = "enSub"

}

const Strings = new Proxy(StringsBase, {
  get(target, prop) {
    if (typeof prop === "string" && prop in target) {
      return i18n.t((target as any)[prop]);
    }
    console.warn(`No translation for: ${String(prop)}`);
    return (target as any)[prop];
  },
});

export default Strings;
