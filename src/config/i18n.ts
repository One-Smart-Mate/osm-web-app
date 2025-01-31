import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      notificationsSB: "Notifications",
      companiesSB: "Companies",
      prioritiesSB: "Priorities",
      usersSB: "Users",
      siteUsersSB: "Site Users",
      sitesSB: "Sites",
      cardTypesSB: "Card Types",
      preclassifiersSB: "Preclassifiers",
      levelsSB: "Levels",
      cardsSB: "Cards",
      cardDetailsSB: "Card Details",
      chartsSB: "Charts",

      login: "Log in",
      companyParam: ":company",
      siteParam: ":site",
      cardParam: ":card",
      cardTypeParam: ":cardType",
      colon: ":",
      password: "Password",
      newPassword: "New Password",
      sendCode: "Send code",
      logout: "Log out",
      updatePassword: "Update password",
      confirmPassword: "Confirm password",
      uploadCardDataWithDataNet: "Upload card with data net",
      uploadCardEvidenceWithDataNet: "Upload card evidence with data net",
      searchRecord: "Search record",
      clearFiltersAndSorters: "Clear filters and sorters",
      empty: "",
      welcome: "Welcome!",
      resetPassword: "Reset password",
      sendCodeMessage:
        "Enter your email address and we will send you a code to reset your password.",
      enterTheCode:
        "Enter the code that we have sent to you in your e-mail. Please note that the code expires in 24 hours.",
      enterTheNewPassword: "Please enter the new password.",
      logoutModalTittle: "Are you sure you want to log out?",
      logutModalContent: "You are about to log out of your account.",
      white: "white",
      updateUser: "Update user",
      creation: "Creation",
      definitiveSolution: "Definitive solution",
      provisionalSolution: "Provisional solution",
      provisionalUser: "Provisional user",
      provisionalDate: "Provisional date",
      days: "Days",
      definitiveUsers: "Definitive users",
      definitiveDate: "Definitive date",
      provisionalSoluitonApplied: "Provisional solution applied",
      NA: "N/A",
      noResponsible: "No responsible",
      noMechanic: "No mechanic",
      noDefinitiveUser: "No definitive user",
      images: "Images",
      videos: "Videos",
      audios: "Audios",
      evidences: "Evidences",
      none: "None",

      email: "Email",
loginText:
  "Get a comprehensive view of all your company's maintenance needs before they turn into costly repairs.",
forgotPassword: "Forgot your password?",

// errors login form
requiredEmail: "Please enter your email address.",
requiredPassword: "Please enter your password.",
requiredValidEmailAddress: "Please enter a valid email address.",
requiredInfo: "Please provide the information.",

// errors user form
requiredUserName: "Please enter the user's name.",
requiredSite: "Please select a site.",
requiredRoles: "Please assign at least one role.",
requiredConfirmPassword: "Please confirm your password.",
passwordsDoNotMatch: "Passwords do not match.",
onlyLetters: "Please enter letters only.",
passwordLenght: "The password must be at least 8 characters long.",
uploadFileRequired: "Please upload a file.",
logoutModalContent: "You are about to log out of your account.",
provisionalSolutionApplied: "Provisional solution applied",

// errors company form
requiredCompanyName: "Please enter the company's name.",
requiredRFC: "Please enter the RFC.",
requiredContacName: "Please enter the contact name.",
requiredPosition: "Please enter the contact's position.",
requiredAddress: "Please enter the address.",
requiredPhone: "Please enter the phone number.",
requiredExtension: "Please enter an extension.",
requiredCellular: "Please enter the cell phone number.",
requiredLogo: "Please upload the logo.",

// errors priority form
requiredCode: "Please enter the code.",
requiredDescription: "Please enter the description.",
requiredDaysNumber: "Please enter the number of days.",
requiredResponsableId: "Please select the person in charge.",
requiredMechanic: "Please select the mechanic.",
requiredPriority: "Priority required.",


      companyName: "Name",
      rfc: "RFC",
      companyAddress: "Address",
      contact: "Contact",
      position: "Position",
      phone: "Phone",
      extension: "Extension",
      cellular: "Mobile Phone",

      logoTemp: "https://th.bing.com/th/id/OIG4.jIj.NbKiwFNdl.C3Ltft?pid=ImgGn",
      // company actions
      viewSites: "View sites",

      // levels
      notify: " Notify",

      // site actions
      viewPriorities: "View priorities",
      viewLevels: "View levels",
      viewCardTypes: "View card types",
      viewCards: "View cards",
      viewCharts: "View charts",
      viewUsers: "View users",
      importUsers: "Import users",

      // errors sites form
      requiredLatitud: "Please enter the latitud",
      requiredLongitud: "Please enter de Longitud",
      requiredSiteCode: "Please enter the site code",
      requiredSiteBusinessName: "Please enter the business name",
      requiredSiteType: "Please enter the site type",
      requiredDueDate: "Please enter the due date",
      requiredMonthlyPayment: "Please enter the monthly payment",
      requiredCurrency: "Please selet the currency",
      requiredAppHistoryDays: "Please enter app history days",
      companies: "companies",
      companiesUpperCase: "Companies",
      users: "Users",
      usersOf: "Users of",
      requiredUserLicense: "Please select the user license",
      enable: "Enable",

      // Import users form
      dragFile: "Click or drag file to this area to upload",
      singleUpload: "Support for a single upload .xlsx",

      // sites
      site: "Site",
      sitesOf: "Sites of",
      yourSitesOfCompany: "Your sites of Company",
      sites: "sites",
      latitud: "Latitud",
      longitud: "Longitud",
      siteCode: "Site code",
      siteBusinessName: "Site business name",
      siteType: "Site type",
      monthlyPayment: "Monthly payment",
      currency: "Currency",
      appHistoryDays: "App history days",
      userLicense: "User license",
      concurrent: "Concurrent",
      named: "Named",
      concurrente: "concurrente",
      nombrado: "nombrado",
      quantity: "Quantity",
      requiredAdditionalField: "Please input the additional field",

      // CardTypes
      methodology: "Methodology name",
      name: "Name",
      color: "Color",
      responsible: "Responsible",
      cardTypeMethodology: "Card Type Methodology",
      cardTypesOf: "Card types of",
      quantityPictures: "Quantity pictures",
      quantityAudios: "Quantity audios",
      quantityVideos: "Quantity videos",
      picturesCreatePs: "Pictures create provisional solution",
      audiosCreatePs: "Audios create provisional solution",
      videosCreatePs: "Videos create provisional solution",
      durationInSeconds: "Duration in seconds",
      atCreation: "At creation",
      atProvisionalSolution: "At provisional solution",
      atDefinitiveSolution: "At definitive solution",

      // cardtype methodology
      M: "M",
      C: "C",
      updateCardType: "Update card type",

      // roles
      roles: "Roles",
      createNode: "Create node",

      // errors card type form
      requiredMethodology: "Please select the methodology",
      requiredCardTypeName: "Please enter the card type name",
      requiredColor: "Please select a color",

      // CardTypes actions
      viewPreclassifiers: "View preclassifiers",

      // Priority
      prioritiesOf: "Priorities of",
      priority: "Priority",
      code: "Code",
      enterCode: "Enter the code!",
      description: "Description",
      levelMachineId: "Level machine id",
      daysNumber: "Days number",
      updatePriority: "Update priority",

      // Card titles
      createCompany: "Create company",
      updateCompany: "Update company",
      createPriority: "Create priority for",
      createUserFor: "Create user for",
      importUsersFor: "Import users for",
      createUser: "Create user",
      createSite: "Create site for",
      updateSite: "Update site",
      createPreclassifier: "Create Preclassifier",
      createCardType: "Create card type for",
      createLevel: "Create level for",
      updateLevel: "Update level",
      createNodefor: "Create node for",

      cards: "Cards",
      tagDetailsOf: "Tag details of",
      type: "Type",
      cardNumber: "Card Number",
      area: "Area",
      date: "Date",
      mechanic: "Mechanic",
      mechanics: "Mechanics",
      creator: "Creator",
      comments: "Comments",
      updateMechanic: "Update mechanic",
      changeLog: "Change log",
      noDueDate: "No due date",

      // Tags re-design
      tagsOf: "Tags of",
      filters: "Filters",
      status: "Status: ",
      dueDate: "Due date: ",
      cardType: "Tag type: ",
      problemType: "Problem type: ",
      location: "Location: ",
      createdBy: "Created by: ",
      problemDescription: "Problem description: ",

      // Tags details re-design
      tagStatusCanceled: "Canceled",
      tagDate: "Date: ",
      tagDays: "Days: ",
      ceroDays: "0 days",
      tagNumber: "Tag number: ",
      tagPriority: "Priority: ",
      dateStatus: "Date status: ",
      tagMechanic: "Mechanic: ",
      tagProvisionalUser: "Provisional user: ",
      tagProvisionalSoluitonApplied: "Provisional soluiton applied: ",
      creationDate: "Creation date: ",
      daysSinceCreation: "Days since creation: ",
      cero: "0",
      anomalyDetected: "Anomaly detected: ",
      appProvisionalUser: "App provisional user: ",
      appDefinitiveUser: "App definitive user: ",
      definitiveUser: "Definitive user: ",
      definitiveSolutionApplied: "Definitive solution applied: ",

      // Constants for the dividers
      evidencesAtCreationDivider: "Evidences at creation",
      definitiveSolutionDivider: "Definitive solution",
      evidencesAtDefinitiveDivider: "Evidences at definitive solution",
      provisionalSolutionDivider: "Provisional solution",
      evidencesAtProvisionalDivider: "Evidences at provisional solution",
      changeLogDivider: "Change log",

      // Constants for the date status
      expired: "Expired",
      current: "Current",
      onTime: "On time",

      // charts
      chartsOf: "Charts of",
      anomalies: "Anomalies",
      areas: "Areas",
      creators: "Creators",
      machines: "Machines",
      tagMonitoring: "Tag monitoring",
      totalCards: "Total cards",
      total: "Total",
      areaChart: "Area",
      machine: "Machine",
      machineLocation: "Machine location",
      creatorChart: "Creator",
      cardName: "Card name",
      preclassifierChart: "Preclassifier",
      year: "Year:",
      week: "Week:",
      cumulativeIssued: "Cumulative issued:",
      cumulativeEradicated: "Cumulative eradicated:",

      // general actions
      edit: "Edit",
      create: "Create",
      save: "Save",
      cancel: "Cancel",
      actions: "Actions",
      delete: "Delete",
      confirm: "Confirm",

      tagVersion: import.meta.env.VITE_AP_VERSION,

      // Evidence type
      AUCR: "AUCR",
      AUCL: "AUCL",
      AUPS: "AUPS",
      VICR: "VICR",
      VICL: "VICL",
      VIPS: "VIPS",
      IMCR: "IMCR",
      IMPS: "IMPS",
      IMCL: "IMCL",

      // Status
      active: "Active",
      activeStatus: "A",
      inactive: "Inactive",
      open: "Open",
      closed: "Closed",
      pastDue: "Past due",

      preclassifiersof: "Preclassifiers of",
      preclassifier: "Preclassifier",
      updatePreclassifier: "Update preclassifier",
      levelsof: "Levels of",

      // Errors pages
      notFoundPageTitle: "404",
      notFoundPageSubTitle: "Sorry, the page you visited does not exist.",
      unauthorizedPageTitle: "403",
      unauthorizedPageSubTitle:
        "Sorry, you are not authorized to access this page.",
      goBack: "Go back",
      downloadData: "Download data",

      // Rangepicker presets
      last7days: "Last 7 Days",
      last14days: "Last 14 Days",
      last30days: "Last 30 Days",
      last90days: "Last 90 Days",

      failedToDownload: "Failed to download",

      // Warning notifications
      restrictedAccessMessage:
        "Access Denied: Your role is limited to the app and does not grant permission to access the site. Please contact the administrator if you believe this is an error.",

      // Levels Tree
      close: "Close",
      createLevelBtn: "Create Level",
      updateLevelTree: "Update Level",
      details: "Details",
      levelsOf: "Levels of ",
      newLevel: " New Level",
      level: "Level",
      errorFetchingLevels: "Error fetching levels",
      errorSavingLevel: "Error saving level",
      defaultSiteName: "Site Name",
      detailsOptionA: "A",
      detailsOptionS: "S",
      detailsOptionC: "C",
      detailsStatusActive: "Active",
      detailsStatusSuspended: "Suspended",
      detailsStatsCancelled: "Cancelled",
      levelOptions: "Level Options",

      // Create Update preclassifier tooltips
      preclassifierCodeTooltip: "Enter the preclassifier code.",
      preclassifierDescriptionTooltip:
        "Provide a detailed description for the preclassifier. Maximum length: 100 characters.",
      preclassifierStatusTooltip: "Select the status of the preclassifier.",

      // Register Priority Form Tooltips
      priorityCodeTooltip:
        "A unique alphanumeric code representing the priority (e.g., '7D' for seven days). Maximum 4 characters.",
      priorityDescriptionTooltip:
        "A brief description of the priority. Use clear, concise language. Maximum 50 characters.",
      priorityDaysNumberTooltip:
        "The number of days associated with this priority. Must be a positive number.",

        entrepriseName: "OSM",
      // Form tooltips based on SiteEntity
      siteNameTooltip:
        "Enter the name of the site . Maximum length: 100 characters.",
      siteRfcTooltip:
        "Enter the  RFC for the company associated with the site. It should be exactly 13 characters long for companies.",
      siteBusinessNameTooltip:
        "Enter the legal business name of the site, as registered officially. Maximum length: 100 characters.",
      siteTypeTooltip:
        "Specify the type of the site (e.g., office, warehouse, retail). Maximum length: 20 characters.",
      siteLatitudeTooltip:
        "Enter the latitude coordinates of the site. Use a format with up to 11 characters, e.g., '19.432608'.",
      siteLongitudeTooltip:
        "Enter the longitude coordinates of the site. Use a format with up to 11 characters, e.g., '-99.133209'.",
      siteAddressTooltip:
        "Provide the complete physical address of the site, including street, city, and ZIP code. Maximum length: 200 characters.",
      siteContactTooltip:
        "Enter the name of the primary contact person for this site. Maximum length: 100 characters.",
      sitePositionTooltip:
        "Specify the position or job title of the contact person (e.g., Manager, Supervisor). Maximum length: 100 characters.",
      sitePhoneTooltip:
        "Provide the main contact phone number, including area code. Maximum length: 13 characters.",
      siteExtensionTooltip:
        "If applicable, specify the phone extension for the contact person. Maximum length: 10 characters.",
      siteCellularTooltip:
        "Provide a mobile phone number for the contact person. Maximum length: 13 characters.",
      siteEmailTooltip:
        "Provide the email address of the contact person. Ensure it is valid and has a maximum length of 60 characters.",
      siteDueDateTooltip:
        "Select the due date for site-related payments or obligations. Format: YYYY-MM-DD.",
      siteMonthlyPaymentTooltip:
        "Specify the monthly payment amount for the site in decimal format, e.g., '1200.00'.",
      siteCurrencyTooltip:
        "Select the currency for financial transactions related to this site. Use ISO 4217 codes (e.g., USD, MXN).",
      siteAppHistoryDaysTooltip:
        "Enter the number of days to retain the site's application history. ",
      siteLogoTooltip: "Upload the site's logo. Accepted formats: JPG, PNG.",
      siteCodeTooltip: "Auto-generated site code.",
      appHistoryDaysTooltip:
        "Enter the number of days the application's history will be retained.",

      // Register / Update Company Tooltips
      companyNameTooltip: "Legal name of the company",
      companyRfcTooltip:
        "The RFC (Federal Taxpayer Registry) must consist of 12 characters for individuals or 13 characters for legal entities. It includes letters and numbers: the first letters correspond to the name or business name, followed by the date of incorporation or birth, and a verification digit. Ensure it matches the official format.",
      companyAddressTooltip:
        "Complete address of the company, including street and city.",
      companyContactNameTooltip: "Name of the primary contact person.",
      companyPositionTooltip: "Job position of the contact person.",
      companyPhoneTooltip: "Company's landline number.",
      companyExtensionTooltip:
        "Extension for the phone number (if applicable).",
      companyCellularTooltip: "Primary mobile phone number.",
      companyEmailTooltip: "Official company email address.",
      companyLogoTooltip: "Upload the company logo in image format.",

      userNameTooltip:
        "Enter the full name of the user. Only letters are allowed.",
      userEmailTooltip: "Enter a valid email address for the user.",
      userPasswordTooltip:
        "Enter a secure password. It must be at least 8 characters long.",
      userConfirmPasswordTooltip:
        "Confirm the password to ensure it matches the original.",
      userSiteRfcTooltip:
        "Select the RFC of the site to which the user will be assigned.",
      userUploadCardDataWithDataNetTooltip:
        "Enable this option if the user can upload card data using DataNet.",
      userUploadCardEvidenceWithDataNetTooltip:
        "Enable this option if the user can upload card evidence using DataNet.",
      userRolesTooltip: "Select one or more roles to assign to the user.",
      requiredStatus: "Status is required",
      statusPlaceholder: "Choose a status",
      activeValue: "A",
      inactiveValue: "I",
      statusUserLabel: "User status",
      cardTypeMethodologyTooltip:
        "Select the methodology associated with this card type.",
      cardTypeNameTooltip:
        "Provide a unique name for the card type. Maximum 45 characters.",
      cardTypeDescriptionTooltip:
        "Briefly describe the purpose of the card type. Maximum 100 characters.",
      cardTypeColorTooltip:
        "Choose a color to visually represent this card type.",
      responsibleTooltip:
        "Select the person responsible for managing this card type.",
      quantityPicturesCreateTooltip:
        "Enter the number of pictures required at the creation stage.",
      quantityVideosCreateTooltip:
        "Specify the number of videos required at the creation stage.",
      videosDurationCreateTooltip:
        "Provide the total duration (in seconds) of videos for the creation stage.",
      quantityAudiosCreateTooltip:
        "Specify the number of audio files required at the creation stage.",
      audiosDurationCreateTooltip:
        "Provide the total duration (in seconds) of audio files for the creation stage.",
      quantityPicturesPsTooltip:
        "Enter the number of pictures required at the provisional solution stage.",
      quantityVideosPsTooltip:
        "Specify the number of videos required at the provisional solution stage.",
      videosDurationPsTooltip:
        "Provide the total duration (in seconds) of videos for the provisional solution stage.",
      quantityAudiosPsTooltip:
        "Specify the number of audio files required at the provisional solution stage.",
      audiosDurationPsTooltip:
        "Provide the total duration (in seconds) of audio files for the provisional solution stage.",

      quantityPicturesCloseTooltip:
        "Enter the number of pictures required at the definitive solution stage.",
      quantityVideosCloseTooltip:
        "Specify the number of videos required at the definitive solution stage.",
      videosDurationCloseTooltip:
        "Provide the total duration (in seconds) of videos for the definitive solution stage.",
      quantityAudiosCloseTooltip:
        "Specify the number of audio files required at the definitive solution stage.",
      audiosDurationCloseTooltip:
        "Provide the total duration (in seconds) of audio files for the definitive solution stage.",
      cardTypeStatusTooltip:
        "Select the current status of the card type. It determines whether the card type is active or inactive in the system.",
      statusCardTypeTooltip: "You can change the status of the card type",
      createNotification: "Create Notification",
      notificationName: "Notification Name",
      requiredName: "The notification name is required.",
      notificationDescription: "Notification Description",
      notificationsRequiredDescription: "The description is required.",
      notificationsSite: "Site",
      notificationsSelectSite: "Select a site",
      notificationsRequiredSite: "You must select a site.",
      notificationsSelectUsers: "Select Users",
      notificationsRequiredUsers: "You must select at least one user.",
      notificationsSave: "Save",
      notificationsCancel: "Cancel",
      searchUsers: "Search User",
      responsibleRequired: "Responsible Required",
      levelsTreeOptionCreate: "Create",
      levelsTreeOptionClose: "Close",
      levelsTreeOptionEdit: "Edit",
      levelsTreeOptionClone: "Clone",
      levelDetailsTitle: "Level Details",
      errorOnSubmit: "Error on submit",
      drawerTypeCreate: "create",
      drawerTypeEdit: "update",
      drawerTypeClone: "clone",
      loading: "Loading",
      noData: "No data",
      errorFetchingLevelData: "Error fetching level data",
      yes: "Yes",
      no: "No",
      detailsStatusCancelled: "Cancelled",
      for: "for",


      errorFetchingData: "Error fetching data",
namePlaceholder: "Enter the name",
descriptionPlaceholder: "Enter the description",
responsiblePlaceholder: "Select a responsible",

// General Placeholders
cardTypeTreeNamePlaceholder: "Enter the name",
cardTypeTreeDescriptionPlaceholder: "Enter the description",
cardTypeTreeResponsiblePlaceholder: "Select a responsible",
cardTypeTreeStatusPlaceholder: "Select a status",
cardTypeTreeColorPlaceholder: "Pick a color",

// Placeholders for Quantity Fields
cardTypeTreeQuantityPicturesPlaceholder: "Enter the number of pictures",
cardTypeTreeQuantityVideosPlaceholder: "Enter the number of videos",
cardTypeTreeQuantityAudiosPlaceholder: "Enter the number of audios",

// Titles or Section Labels
cardTypeTreeAtCreation: "At Creation",
cardTypeTreeAtProvisionalSolution: "At Provisional Solution",
cardTypeTreeAtDefinitiveSolution: "At Definitive Solution",

// Error Messages
cardTypeTreeRequiredCardTypeName: "Card type name is required",
cardTypeTreeRequiredDescription: "Description is required",
cardTypeTreeRequiredResponsableId: "Responsible is required",
cardTypeTreeRequiredColor: "Color is required",

// Notifications
cardTypeTreeSuccessCardTypeUpdated: "Card type successfully updated!",
cardTypeTreeErrorFetchingData: "Error fetching data",

/* Card Types and Preclassifier tree */
cardTypesDrawerTypeCreateCardType: "createCardType",
cardTypesDrawerTypeUpdateCardType: "updateCardType",
cardTypesDrawerTypeCreatePreclassifier: "createPreclassifier",
cardTypesDrawerTypeUpdatePreclassifier: "updatePreclassifier",
cardTypesCreate: "Create Card Type",
cardTypesCancel: "Cancel",
cardTypesEdit: "Edit Card Type",
cardTypesEditPreclassifier: "Edit Preclassifier",
cardTypesCloneCardType: "Clone Card Type",
cardTypesClonePre: "Clone Preclassifier",
cardTypesCreatePreclassifier: "Create Preclassifier",
cardTypesUpdatePreclassifier: "Edit Preclassifier",
cardTypesRoot: "Root",
cardTypesCloneSuffix: "(Clone)",
cardTypesMethodologyError: "Card Type Methodology is required for creation.",
cardTypesLoadingData: "Loading data...",
cardTypesUpdateCardType: "Edit Card Type",
cardTypesCreateCardType: "Create Card Type",
cardTypesClonePreclassifier: "Clone preclassifier",
cardTypesErrorFetchingData: "Error fetching data",
cardTypesNoCardTypeIdError: "No cardTypeId found to create a preclassifier.",
cardTypesOptionEdit: "editCT",
cardTypesOptionClone: "cloneCT",
cardTypesOptionCreate: "createPre",
cardTypesOptionCancel: "cancelCT",

cardTypeDetailsTitle: "Card Type Details",
cardTypeDetailsMethodology: "Methodology",
cardTypeDetailsName: "Name",
cardTypeDetailsDescription: "Description",
cardTypeDetailsColor: "Color",
cardTypeDetailsResponsible: "Responsible",
cardTypeDetailsStatus: "Status",

preclassifierDetailsTitle: "Preclassifier Details",
preclassifierDetailsCode: "Code",
preclassifierDetailsDescription: "Description",
preclassifierDetailsStatus: "Status",
notSpecified: "Not Specified",
false: "false",

//PDF
tagDetails : "Tag details",
problemDetails: "Problem details",
sharePDF: "Share PDF",
namePDF: "Tag details.pdf"

    },
  },
  es: {
    translation: {
      notificationsSB: "Notificaciones",
      companiesSB: "Empresas",
      prioritiesSB: "Prioridades",
      usersSB: "Usuarios",
      siteUsersSB: "Usuarios del Sitio",
      sitesSB: "Sitios",
      cardTypesSB: "Tipos de Tarjeta",
      preclassifiersSB: "Preclasificadores",
      levelsSB: "Niveles",
      cardsSB: "Tarjetas",
      cardDetailsSB: "Detalles de Tarjeta",
      chartsSB: "Gráficos",

      login: "Iniciar sesión",
      companyParam: ":company",
      siteParam: ":site",
      cardParam: ":card",
      cardTypeParam: ":cardType",
      colon: ":",
      password: "Contraseña",
      newPassword: "Nueva Contraseña",
      sendCode: "Enviar código",
      logout: "Cerrar sesión",
      updatePassword: "Actualizar contraseña",
      confirmPassword: "Confirmar contraseña",
      uploadCardDataWithDataNet: "Cargar Tarjeta con datos de red",
      uploadCardEvidenceWithDataNet:
        "Cargar evidencia de Tarjeta con datos de red",
      searchRecord: "Buscar registro",
      clearFiltersAndSorters: "Limpiar filtros y ordenadores",
      empty: "",
      welcome: "¡Bienvenido!",
      resetPassword: "Restablecer contraseña",
      sendCodeMessage:
        "Introduce tu dirección de correo electrónico y te enviaremos un código para restablecer tu contraseña.",
      enterTheCode:
        "Introduce el código que te hemos enviado a tu correo electrónico. Ten en cuenta que el código expira en 24 horas.",
      enterTheNewPassword: "Por favor, introduce la nueva contraseña.",
      logoutModalTittle: "¿Estás seguro de que quieres cerrar sesión?",
      logutModalContent: "Estás a punto de cerrar la sesión de tu cuenta.",
      white: "white",
      updateUser: "Actualizar usuario",
      creation: "Creación",
      definitiveSolution: "Solución definitiva",
      provisionalSolution: "Solución provisional",
      provisionalUser: "Usuario provisional",
      provisionalDate: "Fecha provisional",
      days: "Días",
      definitiveUsers: "Usuarios definitivos",
      definitiveDate: "Fecha definitiva",
      provisionalSoluitonApplied: "Solución provisional aplicada",
      NA: "N/D",
      noResponsible: "Sin responsable",
      noMechanic: "Sin mecánico",
      noDefinitiveUser: "Sin usuario definitivo",
      images: "Imágenes",
      videos: "Videos",
      audios: "Audios",
      evidences: "Evidencias",
      none: "Ninguno",
      // Login re-design
      entrepriseName: "OSM",
      email: "Correo electrónico",
      loginText:
        "Obtén una visión completa de todas las necesidades de mantenimiento de tu empresa antes de que se conviertan en reparaciones costosas.",
      forgotPassword: "¿Olvidaste tu contraseña?",

      // errors login form
      requiredEmail: "Por favor, introduce tu dirección de correo electrónico.",
      requiredPassword: "Por favor, introduce tu contraseña.",
      requiredValidEmailAddress:
        "Por favor, introduce una dirección de correo electrónico válida.",
      requiredInfo: "Por favor, introduce la información.",

      // errors user form
      requiredUserName: "Por favor, introduce el nombre del usuario.",
      requiredSite: "Por favor, selecciona un sitio.",
      requiredRoles: "Por favor, asigna al menos un rol.",
      requiredConfirmPassword: "Por favor, confirma tu contraseña.",
      passwordsDoNotMatch: "Las contraseñas no coinciden.",
      onlyLetters: "Por favor, introduce solo letras.",
      passwordLenght: "La contraseña debe tener al menos 8 caracteres.",
      uploadFileRequired: "Por favor, sube un archivo.",
      logoutModalContent: "Estás a punto de cerrar la sesión de tu cuenta.",
      provisionalSolutionApplied: "Solución provisional aplicada",

      // errors company form
      requiredCompanyName: "Por favor, introduce el nombre de la empresa.",
      requiredRFC: "Por favor, introduce el RFC.",
      requiredContacName: "Por favor, introduce el nombre del contacto.",
      requiredPosition: "Por favor, introduce el puesto del contacto.",
      requiredAddress: "Por favor, introduce la dirección.",
      requiredPhone: "Por favor, introduce el número de teléfono.",
      requiredExtension: "Por favor, introduce una extensión.",
      requiredCellular: "Por favor, introduce el celular.",
      requiredLogo: "Por favor, sube el logo.",

      // errors priority form
      requiredCode: "Por favor, introduce el código.",
      requiredDescription: "Por favor, introduce la descripción.",
      requiredDaysNumber: "Por favor, introduce el número de días.",
      requiredResponsableId: "Por favor, selecciona el responsable.",
      requiredMechanic: "Por favor, selecciona el mecánico.",
      requiredPriority: "Prioridad requerida.",

      // company
      logo: "Logo",
      companyName: "Nombre",
      rfc: "RFC",
      companyAddress: "Dirección",
      contact: "Contacto",
      position: "Puesto",
      phone: "Teléfono",
      extension: "Extensión",
      cellular: "Celular",

      logoTemp: "https://th.bing.com/th/id/OIG4.jIj.NbKiwFNdl.C3Ltft?pid=ImgGn",

      // company actions
      viewSites: "Ver sitios",

      // levels
      notify: "Notificar",

      // site actions
      viewPriorities: "Ver prioridades",
      viewLevels: "Ver niveles",
      viewCardTypes: "Ver tipos de Tarjeta",
      viewCards: "Ver Tarjetas",
      viewCharts: "Ver gráficos",
      viewUsers: "Ver usuarios",
      importUsers: "Importar usuarios",

      // errors sites form
      requiredLatitud: "Por favor, introduce la latitud",
      requiredLongitud: "Por favor, introduce la longitud",
      requiredSiteCode: "Por favor, introduce el código del sitio",
      requiredSiteBusinessName: "Por favor, introduce el nombre comercial",
      requiredSiteType: "Por favor, introduce el tipo de sitio",
      requiredDueDate: "Por favor, introduce la fecha de vencimiento",
      requiredMonthlyPayment: "Por favor, introduce el pago mensual",
      requiredCurrency: "Por favor, selecciona la moneda",
      requiredAppHistoryDays:
        "Por favor, introduce los días del historial de la app",
      companies: "empresas",
      companiesUpperCase: "Empresas",
      users: "Usuarios",
      usersOf: "Usuarios de",
      requiredUserLicense: "Por favor, selecciona la licencia de usuario",
      enable: "Habilitar",

      // Import users form
      dragFile: "Haz clic o arrastra un archivo a esta área para subirlo",
      singleUpload: "Compatible con una sola carga .xlsx",

      // sites
      site: "Sitio",
      sitesOf: "Sitios de",
      yourSitesOfCompany: "Tus sitios de la empresa",
      sites: "sitios",
      latitud: "Latitud",
      longitud: "Longitud",
      siteCode: "Código del sitio",
      siteBusinessName: "Nombre comercial del sitio",
      siteType: "Tipo de sitio",
      monthlyPayment: "Pago mensual",
      currency: "Moneda",
      appHistoryDays: "Días del historial de la app",
      userLicense: "Licencia de usuario",
      concurrent: "Concurrente",
      named: "Nombrado",
      concurrente: "concurrente",
      nombrado: "nombrado",
      quantity: "Cantidad",
      requiredAdditionalField: "Por favor, introduce el campo adicional",

      // CardTypes
      methodology: "Nombre de la metodología",
      name: "Nombre",
      color: "Color",
      responsible: "Responsable",
      cardTypeMethodology: "Metodología del tipo de Tarjeta",
      cardTypesOf: "Tipos de Tarjeta de",
      quantityPictures: "Cantidad de imágenes",
      quantityAudios: "Cantidad de audios",
      quantityVideos: "Cantidad de videos",
      picturesCreatePs: "Imágenes para crear solución provisional",
      audiosCreatePs: "Audios para crear solución provisional",
      videosCreatePs: "Videos para crear solución provisional",
      durationInSeconds: "Duración en segundos",
      atCreation: "En la creación",
      atProvisionalSolution: "En la solución provisional",
      atDefinitiveSolution: "En la solución definitiva",

      // cardtype methodology
      M: "M",
      C: "C",
      updateCardType: "Actualizar tipo de Tarjeta",

      // roles
      roles: "Roles",
      createNode: "Crear nodo",

      // errors card type form
      requiredMethodology: "Por favor, selecciona la metodología",
      requiredCardTypeName:
        "Por favor, introduce el nombre del tipo de Tarjeta",
      requiredColor: "Por favor, selecciona un color",

      // CardTypes actions
      viewPreclassifiers: "Ver preclasificadores",

      // Priority
      prioritiesOf: "Prioridades de",
      priority: "Prioridad",
      code: "Código",
      enterCode: "¡Introduce el código!",
      description: "Descripción",
      levelMachineId: "ID del nivel de la máquina",
      daysNumber: "Número de días",
      updatePriority: "Actualizar prioridad",

      // Card titles
      createCompany: "Crear empresa",
      updateCompany: "Actualizar empresa",
      createPriority: "Crear prioridad para",
      createUserFor: "Crear usuario para",
      importUsersFor: "Importar usuarios para",
      createUser: "Crear usuario",
      createSite: "Crear sitio para",
      updateSite: "Actualizar sitio",
      createPreclassifier: "Crear preclasificador",
      createCardType: "Crear tipo de Tarjeta para",
      createLevel: "Crear nivel para",
      updateLevel: "Actualizar nivel",
      createNodefor: "Crear nodo para",

      cards: "Tarjetas",
      tagDetailsOf: "Detalles de la Tarjeta de",
      type: "Tipo",
      cardNumber: "Número de Tarjeta",
      area: "Área",
      date: "Fecha",
      mechanic: "Mecánico",
      mechanics: "Mecánicos",
      creator: "Creador",
      comments: "Comentarios",
      updateMechanic: "Actualizar mecánico",
      changeLog: "Registro de cambios",
      noDueDate: "Sin fecha de vencimiento",

      // Tags re-design
      tagsOf: "Tarjetas de",
      filters: "Filtros",
      status: "Estado: ",
      dueDate: "Fecha de vencimiento: ",
      cardType: "Tipo de Tarjeta: ",
      problemType: "Tipo de problema: ",
      location: "Ubicación: ",
      createdBy: "Creado por: ",
      problemDescription: "Descripción del problema: ",

      // Tags details re-design
      tagStatusCanceled: "Cancelado",
      tagDate: "Fecha: ",
      tagDays: "Días: ",
      ceroDays: "0 días",
      tagNumber: "Número de Tarjeta: ",
      tagPriority: "Prioridad: ",
      dateStatus: "Estado de la fecha: ",
      tagMechanic: "Mecánico: ",
      tagProvisionalUser: "Usuario provisional: ",
      tagProvisionalSoluitonApplied: "Solución provisional aplicada: ",
      creationDate: "Fecha de creación: ",
      daysSinceCreation: "Días desde la creación: ",
      cero: "0",
      anomalyDetected: "Anomalía detectada: ",
      appProvisionalUser: "Usuario provisional de la app: ",
      appDefinitiveUser: "Usuario definitivo de la app: ",
      definitiveUser: "Usuario definitivo: ",
      definitiveSolutionApplied: "Solución definitiva aplicada: ",

      // Constants for the dividers
      evidencesAtCreationDivider: "Evidencias en la creación",
      definitiveSolutionDivider: "Solución definitiva",
      evidencesAtDefinitiveDivider: "Evidencias en la solución definitiva",
      provisionalSolutionDivider: "Solución provisional",
      evidencesAtProvisionalDivider: "Evidencias en la solución provisional",
      changeLogDivider: "Registro de cambios",

      // Constants for the date status
      expired: "Expirado",
      current: "Actual",
      onTime: "A tiempo",

      // charts
      chartsOf: "Gráficos de",
      anomalies: "Anomalías",
      areas: "Áreas",
      creators: "Creadores",
      machines: "Máquinas",
      tagMonitoring: "Monitoreo de Tarjetas",
      totalCards: "Total de Tarjetas",
      total: "Total",
      areaChart: "Área",
      machine: "Máquina",
      machineLocation: "Ubicación de la máquina",
      creatorChart: "Creador",
      cardName: "Nombre de la Tarjeta",
      preclassifierChart: "Preclasificador",
      year: "Año:",
      week: "Semana:",
      cumulativeIssued: "Emitido acumulado:",
      cumulativeEradicated: "Erradicado acumulado:",

      // general actions
      edit: "Editar",
      create: "Crear",
      save: "Guardar",
      cancel: "Cancelar",
      actions: "Acciones",
      delete: "Eliminar",
      confirm: "Confirmar",

      tagVersion: import.meta.env.VITE_AP_VERSION,

      // Tipo de evidencia
      AUCR: "AUCR",
      AUCL: "AUCL",
      AUPS: "AUPS",
      VICR: "VICR",
      VICL: "VICL",
      VIPS: "VIPS",
      IMCR: "IMCR",
      IMPS: "IMPS",
      IMCL: "IMCL",

      // Estado
      active: "Activo",
      activeStatus: "A",
      inactive: "Inactivo",
      open: "Abierto",
      closed: "Cerrado",
      pastDue: "Vencido",

      preclassifiersof: "Preclasificadores de",
      preclassifier: "Preclasificador",
      updatePreclassifier: "Actualizar preclasificador",
      levelsof: "Niveles de",

      // Páginas de error
      notFoundPageTitle: "404",
      notFoundPageSubTitle: "Lo sentimos, la página que visitaste no existe.",
      unauthorizedPageTitle: "403",
      unauthorizedPageSubTitle:
        "Lo sentimos, no tienes autorización para acceder a esta página.",
      goBack: "Volver atrás",

      downloadData: "Descargar datos",

      // Presets de selector de rango
      last7days: "Últimos 7 días",
      last14days: "Últimos 14 días",
      last30days: "Últimos 30 días",
      last90days: "Últimos 90 días",

      failedToDownload: "Error al descargar",

      // Notificaciones de advertencia
      restrictedAccessMessage:
        "Acceso denegado: Tu rol está limitado a la aplicación y no te permite acceder al sitio. Por favor, contacta al administrador si crees que esto es un error.",

      // Árbol de niveles
      close: "Cerrar",
      createLevelBtn: "Crear nivel",
      updateLevelTree: "Actualizar nivel",
      details: "Detalles",
      levelsOf: "Niveles de ",
      newLevel: " Nuevo nivel",
      level: "Nivel",
      errorFetchingLevels: "Error al obtener niveles",
      errorSavingLevel: "Error al guardar nivel",
      defaultSiteName: "Nombre del sitio",
      detailsOptionA: "A",
      detailsOptionS: "S",
      detailsOptionC: "C",
      detailsStatusActive: "Activo",
      detailsStatusSuspended: "Suspendido",
      detailsStatsCancelled: "Cancelado",
      levelOptions: "Opciones de nivel",

      // Tooltips de preclasificadores
      preclassifierCodeTooltip: "Introduce el código del preclasificador.",
      preclassifierDescriptionTooltip:
        "Proporciona una descripción detallada para el preclasificador. Longitud máxima: 100 caracteres.",
      preclassifierStatusTooltip: "Selecciona el estado del preclasificador.",

      // Tooltips del formulario de prioridades
      priorityCodeTooltip:
        "Un código alfanumérico único que representa la prioridad (por ejemplo, '7D' para siete días). Máximo 4 caracteres.",
      priorityDescriptionTooltip:
        "Una breve descripción de la prioridad. Usa un lenguaje claro y conciso. Máximo 50 caracteres.",
      priorityDaysNumberTooltip:
        "El número de días asociado con esta prioridad. Debe ser un número positivo.",

      // Tooltips de formularios basados en SiteEntity
      siteNameTooltip:
        "Introduce el nombre del sitio. Longitud máxima: 100 caracteres.",
      siteRfcTooltip:
        "Introduce el RFC para la empresa asociada al sitio. Debe tener exactamente 13 caracteres.",
      siteBusinessNameTooltip:
        "Introduce el nombre comercial legal del sitio, tal como está registrado oficialmente. Longitud máxima: 100 caracteres.",
      siteTypeTooltip:
        "Especifica el tipo de sitio (por ejemplo, oficina, almacén, tienda). Longitud máxima: 20 caracteres.",
      siteLatitudeTooltip:
        "Introduce las coordenadas de latitud del sitio. Usa un formato con hasta 11 caracteres, por ejemplo, '19.432608'.",
      siteLongitudeTooltip:
        "Introduce las coordenadas de longitud del sitio. Usa un formato con hasta 11 caracteres, por ejemplo, '-99.133209'.",
      siteAddressTooltip:
        "Proporciona la dirección física completa del sitio, incluyendo calle, ciudad y código postal. Longitud máxima: 200 caracteres.",
      siteContactTooltip:
        "Introduce el nombre del contacto principal para este sitio. Longitud máxima: 100 caracteres.",
      sitePositionTooltip:
        "Especifica el puesto o título del contacto (por ejemplo, Gerente, Supervisor). Longitud máxima: 100 caracteres.",
      sitePhoneTooltip:
        "Proporciona el número de teléfono principal, incluyendo el código de área. Longitud máxima: 13 caracteres.",
      siteExtensionTooltip:
        "Si aplica, especifica la extensión telefónica del contacto. Longitud máxima: 10 caracteres.",
      siteCellularTooltip:
        "Proporciona un número de teléfono móvil para el contacto. Longitud máxima: 13 caracteres.",
      siteEmailTooltip:
        "Proporciona la dirección de correo electrónico del contacto. Asegúrate de que sea válida y tenga una longitud máxima de 60 caracteres.",
      siteDueDateTooltip:
        "Selecciona la fecha de vencimiento para los pagos u obligaciones relacionadas con el sitio. Formato: AAAA-MM-DD.",
      siteMonthlyPaymentTooltip:
        "Especifica el monto de pago mensual del sitio en formato decimal, por ejemplo, '1200.00'.",
      siteCurrencyTooltip:
        "Selecciona la moneda para las transacciones financieras relacionadas con este sitio. Usa códigos ISO 4217 (por ejemplo, USD, MXN).",
      siteAppHistoryDaysTooltip:
        "Introduce el número de días para conservar el historial de la aplicación del sitio.",
      siteLogoTooltip: "Sube el logo del sitio. Formatos aceptados: JPG, PNG.",
      siteCodeTooltip: "Código del sitio generado automáticamente.",
      appHistoryDaysTooltip:
        "Introduce el número de días que se conservará el historial de la aplicación.",

      // Tooltips de registro/actualización de empresa
      companyNameTooltip: "Nombre legal de la empresa.",
      companyRfcTooltip:
        "El RFC (Registro Federal de Contribuyentes) debe constar de 12 caracteres para personas físicas o 13 caracteres para personas morales. Asegúrate de que coincide con el formato oficial.",
      companyAddressTooltip:
        "Dirección completa de la empresa, incluyendo calle y ciudad.",
      companyContactNameTooltip: "Nombre del contacto principal.",
      companyPositionTooltip: "Puesto del contacto.",
      companyPhoneTooltip: "Teléfono fijo de la empresa.",
      companyExtensionTooltip: "Extensión telefónica (si aplica).",
      companyCellularTooltip: "Teléfono móvil principal.",
      companyEmailTooltip: "Correo electrónico oficial de la empresa.",
      companyLogoTooltip: "Sube el logo de la empresa en formato de imagen.",

      userNameTooltip:
        "Ingrese el nombre completo del usuario. Solo se permiten letras.",
      userEmailTooltip:
        "Ingrese una dirección de correo electrónico válida para el usuario.",
      userPasswordTooltip:
        "Ingrese una contraseña segura. Debe tener al menos 8 caracteres.",
      userConfirmPasswordTooltip:
        "Confirme la contraseña para asegurarse de que coincide con la original.",
      userSiteRfcTooltip:
        "Seleccione el RFC del sitio al que se asignará el usuario.",
      userUploadCardDataWithDataNetTooltip:
        "Habilite esta opción si el usuario puede cargar datos de Tarjetas utilizando DataNet.",
      userUploadCardEvidenceWithDataNetTooltip:
        "Habilite esta opción si el usuario puede cargar evidencias de Tarjetas utilizando DataNet.",
      userRolesTooltip: "Seleccione uno o más roles para asignar al usuario.",
      requiredStatus: "El estado es obligatorio",
      statusPlaceholder: "Seleccione un estado",
      activeValue: "A",
      inactiveValue: "I",
      statusUserLabel: "Estado del usuario",
      cardTypeMethodologyTooltip:
        "Seleccione la metodología asociada con este tipo de Tarjeta.",
      cardTypeNameTooltip:
        "Proporcione un nombre único para el tipo de Tarjeta. Máximo 45 caracteres.",
      cardTypeDescriptionTooltip:
        "Describa brevemente el propósito del tipo de Tarjeta. Máximo 100 caracteres.",
      cardTypeColorTooltip:
        "Elija un color para representar visualmente este tipo de Tarjeta.",
      responsibleTooltip:
        "Seleccione la persona responsable de gestionar este tipo de Tarjeta.",
      quantityPicturesCreateTooltip:
        "Ingrese el número de imágenes requeridas en la etapa de creación.",
      quantityVideosCreateTooltip:
        "Especifique el número de videos requeridos en la etapa de creación.",
      videosDurationCreateTooltip:
        "Proporcione la duración total (en segundos) de los videos para la etapa de creación.",
      quantityAudiosCreateTooltip:
        "Especifique el número de archivos de audio requeridos en la etapa de creación.",
      audiosDurationCreateTooltip:
        "Proporcione la duración total (en segundos) de los archivos de audio para la etapa de creación.",
      quantityPicturesPsTooltip:
        "Ingrese el número de imágenes requeridas en la etapa de solución provisional.",
      quantityVideosPsTooltip:
        "Especifique el número de videos requeridos en la etapa de solución provisional.",
      videosDurationPsTooltip:
        "Proporcione la duración total (en segundos) de los videos para la etapa de solución provisional.",
      quantityAudiosPsTooltip:
        "Especifique el número de archivos de audio requeridos en la etapa de solución provisional.",
      audiosDurationPsTooltip:
        "Proporcione la duración total (en segundos) de los archivos de audio para la etapa de solución provisional.",

      quantityPicturesCloseTooltip:
        "Ingrese el número de imágenes requeridas en la etapa de solución definitiva.",
      quantityVideosCloseTooltip:
        "Especifique el número de videos requeridos en la etapa de solución definitiva.",
      videosDurationCloseTooltip:
        "Proporcione la duración total (en segundos) de los videos para la etapa de solución definitiva.",
      quantityAudiosCloseTooltip:
        "Especifique el número de archivos de audio requeridos en la etapa de solución definitiva.",
      audiosDurationCloseTooltip:
        "Proporcione la duración total (en segundos) de los archivos de audio para la etapa de solución definitiva.",
      cardTypeStatusTooltip:
        "Seleccione el estado actual del tipo de Tarjeta. Esto determina si el tipo de Tarjeta está activo o inactivo en el sistema.",
      statusCardTypeTooltip: "Puede cambiar el estado del tipo de Tarjeta",
      createNotification: "Crear Notificación",
      notificationName: "Nombre de la Notificación",
      requiredName: "El nombre de la notificación es obligatorio.",
      notificationDescription: "Descripción de la Notificación",
      notificationsRequiredDescription: "La descripción es obligatoria.",
      notificationsSite: "Sitio",
      notificationsSelectSite: "Seleccione un sitio",
      notificationsRequiredSite: "Debe seleccionar un sitio.",
      notificationsSelectUsers: "Seleccionar Usuarios",
      notificationsRequiredUsers: "Debe seleccionar al menos un usuario.",
      notificationsSave: "Guardar",
      notificationsCancel: "Cancelar",
      searchUsers: "Buscar Usuario",
      responsibleRequired: "Responsable Obligatorio",
      levelsTreeOptionCreate: "Crear",
      levelsTreeOptionClose: "Cerrar",
      levelsTreeOptionEdit: "Editar",
      levelsTreeOptionClone: "Clonar",
      levelDetailsTitle: "Detalles del Nivel",
      errorOnSubmit: "Error al enviar",
      drawerTypeCreate: "create",
      drawerTypeEdit: "update",
      drawerTypeClone: "clone",
      loading: "Cargando",
      noData: "Sin datos",
      errorFetchingLevelData: "Error al obtener datos del nivel",
      yes: "Sí",
      no: "No",
      detailsStatusCancelled: "Cancelado",
      for: "para",

      errorFetchingData: "Error al obtener datos",
namePlaceholder: "Introduce el nombre",
descriptionPlaceholder: "Introduce la descripción",
responsiblePlaceholder: "Selecciona un responsable",

// General Placeholders
cardTypeTreeNamePlaceholder: "Introduce el nombre",
cardTypeTreeDescriptionPlaceholder: "Introduce la descripción",
cardTypeTreeResponsiblePlaceholder: "Selecciona un responsable",
cardTypeTreeStatusPlaceholder: "Selecciona un estado",
cardTypeTreeColorPlaceholder: "Selecciona un color",

// Placeholders for Quantity Fields
cardTypeTreeQuantityPicturesPlaceholder: "Introduce la cantidad de imágenes",
cardTypeTreeQuantityVideosPlaceholder: "Introduce la cantidad de videos",
cardTypeTreeQuantityAudiosPlaceholder: "Introduce la cantidad de audios",

// Titles or Section Labels
cardTypeTreeAtCreation: "En la creación",
cardTypeTreeAtProvisionalSolution: "En la solución provisional",
cardTypeTreeAtDefinitiveSolution: "En la solución definitiva",

// Error Messages
cardTypeTreeRequiredCardTypeName: "El nombre del tipo de Tarjeta es obligatorio",
cardTypeTreeRequiredDescription: "La descripción es obligatoria",
cardTypeTreeRequiredResponsableId: "El responsable es obligatorio",
cardTypeTreeRequiredColor: "El color es obligatorio",

// Notifications
cardTypeTreeSuccessCardTypeUpdated: "¡El tipo de Tarjeta se actualizó con éxito!",
cardTypeTreeErrorFetchingData: "Error al obtener datos",

/* Card Types and Preclassifier tree */
cardTypesDrawerTypeCreateCardType: "crearTipoTarjeta",
cardTypesDrawerTypeUpdateCardType: "actualizarTipoTarjeta",
cardTypesDrawerTypeCreatePreclassifier: "crearPreclasificador",
cardTypesDrawerTypeUpdatePreclassifier: "actualizarPreclasificador",
cardTypesCreate: "Crear Tipo de Tarjeta",
cardTypesCancel: "Cancelar",
cardTypesEdit: "Editar Tipo de Tarjeta",
cardTypesEditPreclassifier: "Editar Preclasificador",
cardTypesCloneCardType: "Clonar Tipo de Tarjeta",
cardTypesClonePre: "Clonar Preclasificador",
cardTypesCreatePreclassifier: "Crear Preclasificador",
cardTypesUpdatePreclassifier: "Editar Preclasificador",
cardTypesRoot: "Raíz",
cardTypesCloneSuffix: "(Clon)",
cardTypesMethodologyError: "La metodología del tipo de Tarjeta es obligatoria para la creación.",
cardTypesLoadingData: "Cargando datos...",
cardTypesUpdateCardType: "Editar Tipo de Tarjeta",
cardTypesCreateCardType: "Crear Tipo de Tarjeta",
cardTypesClonePreclassifier: "Clonar Preclasificador",
cardTypesErrorFetchingData: "Error al obtener datos",
cardTypesNoCardTypeIdError: "No se encontró el ID del tipo de Tarjeta para crear un preclasificador.",
cardTypesOptionEdit: "editarCT",
cardTypesOptionClone: "clonerCT",
cardTypesOptionCreate: "createPre",
cardTypesOptionCancel: "cancelCT",

cardTypeDetailsTitle: "Detalles del Tipo de Tarjeta",
cardTypeDetailsMethodology: "Metodología",
cardTypeDetailsName: "Nombre",
cardTypeDetailsDescription: "Descripción",
cardTypeDetailsColor: "Color",
cardTypeDetailsResponsible: "Responsable",
cardTypeDetailsStatus: "Estado",

preclassifierDetailsTitle: "Detalles del Preclasificador",
preclassifierDetailsCode: "Código",
preclassifierDetailsDescription: "Descripción",
preclassifierDetailsStatus: "Estado",
notSpecified: "No especificado",
false: "false",

//PDF 
tagDetails : "Detalles de la tarjeta",
problemDetails: "Detalles del problema",
sharePDF: "Compartir PDF",
namePDF: "Detalles de la tarjeta.pdf"

    },
  },
};
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,          
    resources,
    fallbackLng: "es",
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      cleanCode: true,
    } as any,
  });
export default i18n;
