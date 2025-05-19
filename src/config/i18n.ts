import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      selectUsers: "Selected Users",
      selected: "Selected",
      usersSelected: "Users Selected",
      noUsersSelected: "No Users Selected",
      selectedUsers: "Selected Users",

      requiredLevelId: "Level id required",
      requiredLevelName: "Level Name required",
      requiredRoute: "Required Route",
      requiredAreaId: "Required Area Id",
      requiredAreaName: "Required Area Name",
      tagsIssued: "Tags issued",
      tagsEradicated: "Tags eradicated",
      cloningLevelsMessage: "Cloning levels...",
      errorCloningTheLevel: "Error cloning the tree: ",
      errorGettingLevelId: "Error getting level id",
      copy: "(copy)",
      associatedTags: "Associated Tags",
      commentsTag: "Comments:",
      noCommentsTag: "No comments",
      notCardInfoFound: "No data found for this tag",
      assignUser: "Assign User",
      assignedTo: "Responsible:",
      selectRole: "Select",
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
      positionsSB: "Positions",
      systemHealthSB: "System Health",

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
      noMechanic: "No responsible",
      noDefinitiveUser: "No definitive user",
      images: "Images",
      videos: "Videos",
      audios: "Audios",
      evidences: "Evidences",
      none: "None",
      expand: "Expand",

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
      viewPositions: "View positions",
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
      mechanics: "Responsibles",
      creator: "Creator",
      comments: "Comments",
      updateMechanic: "Update mechanic",
      changeLog: "Change log",
      noDueDate: "No due date",

      // Tags re-design
      tagsOf: "Tags of",
      filters: "Filters",
      status: "Status ",
      dueDate: "Due date ",
      cardType: "Tag type ",
      problemType: "Problem type ",
      location: "Location ",
      createdBy: "Created by ",
      problemDescription: "Problem description ",

      // Tags details re-design
      tagStatusCanceled: "Canceled",
      tagDate: "Date",
      tagDays: "Days",
      ceroDays: "0 days",
      tagNumber: "Tag number",
      tagPriority: "Priority",
      dateStatus: "Date status",
      tagMechanic: "Mechanic",
      tagProvisionalUser: "Provisional user",
      tagProvisionalSoluitonApplied: "Provisional soluiton applied",
      creationDate: "Creation date",
      daysSinceCreation: "Days since creation",
      cero: "0",
      anomalyDetected: "Anomaly detected",
      appProvisionalUser: "App provisional user",
      appDefinitiveUser: "App definitive user",
      definitiveUser: "Definitive user",
      definitiveSolutionApplied: "Definitive solution applied",

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
      machines: "Zones",
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
      add: "Add",

      tagVersion: import.meta.env.VITE_AP_VERSION,
      redesign: import.meta.env.VITE_IS_REDESIGN,

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
      suspended: "Suspended",
      canceled: "Canceled",
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

      // Árbol de niveles
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

      // Tooltips de preclasificadores
      preclassifierCodeTooltip: "Enter the preclassifier code.",
      preclassifierDescriptionTooltip:
        "Provide a detailed description for the preclassifier. Maximum length: 100 characters.",
      preclassifierStatusTooltip: "Select the status of the preclassifier.",

      // Tooltips del formulario de prioridades
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
      cardTypesMethodologyError:
        "Card Type Methodology is required for creation.",
      cardTypesLoadingData: "Loading data...",
      cardTypesUpdateCardType: "Edit Card Type",
      cardTypesCreateCardType: "Create Card Type",
      cardTypesClonePreclassifier: "Clone preclassifier",
      cardTypesErrorFetchingData: "Error fetching data",
      cardTypesNoCardTypeIdError:
        "No cardTypeId found to create a preclassifier.",
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
      tagDetails: "Tag details",
      problemDetails: "Problem details",
      sharePDF: "Share PDF",
      namePDF: "Tag details.pdf",

      logImgDesc: "Log In Image",
      enSub: "One Smart Mate",

      // Positions Page
      positions: "Positions",
      createPosition: "Create Position",
      searchPositions: "Search by name, area, level or status",
      noAssignedUsers: "No users assigned to this position",
      assignedUsers: "Assigned users",
      loadingPositions: "Loading positions...",
      positionFound: "position found",
      positionsFound: "positions found",

      // System Health
      systemHealthTitle: "System Health Status",
      testingNotifications: "Testing notifications",
      testingEmails: "Testing email delivery",
      testingServices: "Testing services",
      testingDbWrite: "Testing database write",
      testingServerRam: "Testing server RAM",
      testingEvidenceWrite: "Testing evidence write",
      healthStatusOk: "OK",
      healthStatusFailed: "FAILED",

      // System Health additional strings
      sessionPerformance: "Your Session Performance",
      memoryUsage: "Memory Usage",
      usedMemory: "Used Memory",
      totalMemory: "Total Memory",
      pageLoadTime: "Page Load Time",
      domComplete: "DOM Complete",
      networkLatency: "Network Latency",
      positionsRange: "{{start}}-{{end}} of {{total}} positions",
      noPositionsToShow: "No positions to show",
      noUsersAvailableForSite: "No users available for this site",
      positionName: "Position name",
      positionDescription: "Position description",
      selectUsersForPosition:
        "Select users that will be assigned to this position",
      cancelPosition: "Cancel",
      updatePositionTitle: "Edit Position",
      selectStatus: "Select a status",
      positionNameMaxLength: "The name cannot exceed 45 characters",
      positionDescriptionMaxLength:
        "The description cannot exceed 100 characters",
      noPositionData: "No position data found for update.",
      positionUpdatedSuccess: "The position has been updated successfully.",
      positionUpdateError:
        "An error occurred while updating the position. Please try again.",
      pleaseSelectStatus: "Please select a status",

      // Table locale strings
      accept: "Accept",
      reset: "Reset",
      search: "Search",
      filter: "Filter",
      selectCurrentPage: "Select current page",
      invertSelection: "Invert selection",
      selectAll: "Select all",
      sort: "Sort",
      sortDesc: "Click to sort descending",
      sortAsc: "Click to sort ascending",
      cancelSort: "Click to cancel sorting",

      // Position table headers
      positionAreaHeader: "Area",
      positionNodeZoneHeader: "Node / Zone",
      positionNameHeader: "Name",
      positionDescriptionHeader: "Description",
      positionStatusHeader: "Status",
      positionActionsHeader: "Actions",

      success: "Success",
      error: "Error",
      createPositionHere: "Create position here",

      // User positions
      loadingUserPositions: "Loading positions",
      noPositionsAvailable: "No positions available",
      userPositions: "Positions",
      confirmCloneLevel: "Confirm Clone Level",
      confirmCloneLevelMessage: "Are you sure you want to clone the level?. ",
      levelSubLebelsWarning:
        "If you clone a level, all its sub-levels will also be cloned.",
      defaultNotificationTitle: "Notification",
      defaultNotificationMessage: "You have received a new notification",
      notificationReceived: "Notification received",

      collapseAll: "Collapse All",
      expandAll: "Expand All",
      machinesOfArea: "Zones of Area",
      assignPositions: "Assign Positions",
      uploadCardAndEvidenceWithDataNet: "Upload tag and evidence with data net",
      databaseConnectionTest: "Database connection test",
      verificationOfServices: "Verification of services",
      catalogs: "Catalogs",
      accounts: "Accounts",
      dashboard: "Dashboard",
      technicalSupport: "Technical Support",
      enterEmail: "Enter your email",
      enterPassword: "Enter your password",
      permissionsError:
        "You do not have permission to access this application.",

      // CILT related strings
      createCiltProcedure: "Create CILT procedure",
      createCiltProcedureForPosition: "Create CILT procedure for",
      ciltName: "CILT name",
      registerCiltNameRequiredValidation: "Please enter the CILT name",
      registerCiltNameMaxLengthValidation: "Name cannot exceed 100 characters",
      registerCiltNamePlaceholer: "Enter CILT name",
      ciltDescription: "CILT description",
      registerCiltDescriptionRequiredValidation:
        "Please enter the CILT description",
      registerCiltDescriptionMaxLengthValidation:
        "Description cannot exceed 500 characters",
      registerCiltDescriptionPlaceholer: "Enter CILT description",
      standardTime: "Standard time",
      registerCiltStandardTimeRequiredValidation:
        "Please enter the standard time",
      registerCiltStandardTimePlaceholer: "Standard time",
      learningTime: "Learning time",
      registerCiltLearningTimeRequiredValidation:
        "Please enter the learning time",
      registerCiltLearningTimePlaceholer: "Learning time",
      reviewer: "Reviewer",
      registerCiltReviewerRequiredValidation: "Please enter the reviewer",
      registerCiltReviewerPlaceholer: "Select a reviewer",
      approver: "Approver",
      registerCiltApproverRequiredValidation: "Please enter the approver",
      registerCiltApproverPlaceholer: "Select an approver",
      layoutImage: "Diagram Image",
      registerCiltLayoutImageRequiredValidation: "Please upload a diagram image",
      imageUploadError: "Only image files are allowed",
      selectCreator: "Select a creator",
      selectReviewer: "Select a reviewer",
      selectApprover: "Select an approver",
      ciltProceduresSB: "CILT Procedures",
      ciltProceduresDescription:
        "This page contains information about CILT procedures and their implementation.",
      seconds: "seconds",
      oplSB: "OPL",
      oplDescription:
        "This page contains information about One Point Lessons (OPL).",
      ciltTypesSB: "CILT Types",
      ciltTypesOf: "CILT Types of",
      ciltTypesDescription:
        "This page contains information about different types of CILT.",
      ciltFrecuenciesSB: "CILT Frequencies",
      ciltFrecuenciesOf: "CILT Frequencies of",
      ciltFrecuenciesDescription:
        "This page contains information about CILT frequencies.",

    
      searchByName: "Search by name",
      addNewCiltType: "Add new type of CILT",
      errorLoadingNewTypesCilt: "Error loading CILT types",
      typeCiltUpdated: "Type Cilt Updated",
      errorUpdatingCiltType: "Error updating CILT type",
      ciltTypeAdded: "Cilt type added",
      errorAddingCiltType: "Error adding CILT type",
      noCiltTypes: "There are no CILT types to display.",
      obligatoryName: "The name is obligatory",
      editCiltType: "Edit Cilt Type",
      addCiltType: "Add Cilt Type",
      errorNoSiteId: "A site Id is obligatory",
      clearFilters: "Clear filters",

   
      frequencyCode: "Frequency Code",
      addNewCiltFrequency: "Add New Cilt Frequency",
      editCiltFrequency: "Edit Cilt Frequency",
      addCiltFrequency: "Add Frequency",
      ciltFrequencyAdded: "Frequency added successfully",
      ciltFrequencyUpdated: "Frequency updated successfully",
      errorAddingCiltFrequency: "Error adding frequency",
      errorUpdatingCiltFrequency: "Error updating frequency",
      errorLoadingCiltFrequencies: "Error loading frequencies",
      noCiltFrequencies: "No frequencies available",
      obligatoryCode: "Frequency code is required",
      obligatoryDescription: "Description is required",
      searchbyDescriptionOrCode: "Search by code or description",

      // CILT Master strings
      ciltMstrPageTitle: "CILT Procedures",
      ciltMstrCreateSuccess: "CILT procedure created successfully",
      ciltMstrSelectPositionTitle: "Select a position",
      ciltMstrCreateButtonLabel: "Create CILT procedure",
      ciltMstrCreateModalTitle: "Create CILT procedure",
      ciltMstrPositionLabel: "Position",
      // CILT Edit Modal strings
      ciltMstrEditModalTitle: "Edit CILT",
      ciltMstrSaveChangesButton: "Save Changes",
      ciltMstrCancelButton: "Cancel",
      ciltMstrUpdateError: "Error updating. Please try again.",
      ciltMstrNameLabel: "CILT Name",
      ciltMstrNameRequired: "Please enter the name!",
      ciltMstrDescriptionLabel: "Description",
      ciltMstrStandardTimeLabel: "Standard Time in seconds",
      ciltMstrInvalidNumberMessage: "Please enter a valid number",
      ciltMstrLearningTimeLabel: "Learning Time",
      ciltMstrStatusLabel: "Status",
      ciltMstrStatusRequired: "Please select a status!",
      ciltMstrStatusPlaceholder: "Select a status",
      ciltMstrStatusActive: "Active",
      ciltMstrStatusSuspended: "Suspended",
      ciltMstrStatusCanceled: "Canceled",

      // CILT Details Modal strings
      ciltMstrDetailsModalTitle: "CILT Details",
      ciltMstrCloseButton: "Close",
      ciltMstrDetailsNameLabel: "Name",
      ciltMstrDetailsDescriptionLabel: "Description",
      ciltMstrCreatorLabel: "Creator",
      ciltMstrReviewerLabel: "Reviewer",
      ciltMstrApproverLabel: "Approved by",
      ciltMstrDetailsStandardTimeLabel: "Standard Time in seconds",
      ciltMstrDetailsLearningTimeLabel: "Learning Time",
      ciltMstrOrderLabel: "Order",
      ciltMstrDetailsStatusLabel: "Status",
      ciltMstrLastUsedLabel: "Last Used",
      ciltMstrLayoutLabel: "Diagram",
      ciltMstrViewFullImage: "View full image",
      ciltMstrNotAvailable: "Not available",
      ciltMstrNA: "N/A",

      // CILT Card List strings
      ciltMstrListNameColumn: "Name",
      ciltMstrListDescriptionColumn: "Description",
      ciltMstrListCreatorColumn: "Creator",
      ciltMstrListStandardTimeColumn: "Standard Time in seconds",
      ciltMstrListStatusColumn: "Status",
      ciltMstrListCreationDateColumn: "Creation Date",
      ciltMstrListActionsColumn: "Actions",
      ciltMstrListEditAction: "Edit",
      ciltMstrListDetailsAction: "Details",
      ciltMstrListSequencesAction: "Sequences",
      ciltMstrListActiveFilter: "Active",
      ciltMstrListSuspendedFilter: "Suspended",
      ciltMstrListCanceledFilter: "Canceled",
      ciltMstrCreateSequenceButton: "Create Sequence",
      addFiles: "Add Files",

      // OPL related strings
      oplViewModalTitle: "OPL Details",
      oplGeneralInfo: "General Information",
      oplTitle: "Title",
      oplObjective: "Objective",
      oplCreatedBy: "Created By",
      oplReviewedBy: "Reviewed By",
      oplCreationDate: "Creation Date",
      oplContentPreview: "Content Preview",
      oplNoDetails: "No details available for this OPL",
      oplTextType: "Text",
      oplImageType: "Image",
      oplVideoType: "Video",
      oplPdfType: "PDF",
      oplPlayVideo: "Play Video",
      oplViewPdf: "View PDF",
      oplOpenInNewTab: "Open in New Tab",
      oplPdfPreviewTitle: "PDF Preview",
      oplVideoPreviewTitle: "Video Preview",
      oplClose: "Close",

      // OplTable strings
      oplTableTitleColumn: "Title",
      oplTableObjectiveColumn: "Objective",
      oplTableTypeColumn: "Type",
      oplTableActionsColumn: "Actions",
      oplTableViewTooltip: "View OPL",
      oplTableEditTooltip: "Edit OPL",
      oplTableOplType: "OPL",
      oplTableSopType: "SOP",
      oplTableViewButtonText: "Details",
      oplTableEditButtonText: "Edit",
      // OplTextForm strings
      oplTextFormLabel: "Text",
      oplTextFormPlaceholder: "Enter text content",
      oplTextFormValidationMessage: "Please enter text content",
      oplTextFormSubmitButton: "Add Text",

      // OplMediaUploader strings
      oplMediaImageTitle: "Click or drag an image to this area to upload",
      oplMediaImageHint: "Supports JPG, PNG, GIF, etc.",
      oplMediaImageButton: "Upload Image",
      oplMediaVideoTitle: "Click or drag a video to this area to upload",
      oplMediaVideoHint: "Supports MP4, MOV, AVI, etc.",
      oplMediaVideoButton: "Upload Video",
      oplMediaPdfTitle: "Click or drag a PDF to this area to upload",
      oplMediaPdfHint: "Supports PDF files only",
      oplMediaPdfButton: "Upload PDF",
      oplMediaDefaultTitle: "Click or drag a file to this area to upload",
      oplMediaDefaultHint: "Supports various file formats",
      oplMediaDefaultButton: "Upload File",
      oplErrorInvalidFileType: "The selected file is not a valid {type} file",
      oplErrorInvalidFileType_es: "El archivo seleccionado no es un archivo válido de tipo {type}",

      // OplFormModal strings
      oplFormModalViewTitle: "View OPL",
      oplFormModalEditTitle: "Edit OPL",
      oplFormModalCreateTitle: "Create OPL",
      oplFormModalCloseButton: "Close",
      oplFormModalCancelButton: "Cancel",
      oplFormModalSaveButton: "Save",
      oplFormTitleLabel: "Title",
      oplFormTitleRequired: "Please enter a title",
      oplFormTitlePlaceholder: "Enter OPL title",
      oplFormObjectiveLabel: "Objective",
      oplFormObjectiveRequired: "Please enter an objective",
      oplFormObjectivePlaceholder: "Enter OPL objective",
      oplFormTypeLabel: "Type",
      oplFormTypeRequired: "Please select a type",
      oplFormTypePlaceholder: "Select type",
      oplFormTypeOpl: "OPL",
      oplFormTypeSop: "SOP",
      oplFormCreatorLabel: "Creator",
      oplFormCreatorPlaceholder: "Select a creator (optional)",
      oplFormReviewerLabel: "Reviewer",
      oplFormReviewerPlaceholder: "Select a reviewer (optional)",
      oplFormNotAssigned: "Not assigned",
      oplFormUpdateButton: "Update",
      oplFormCreateButton: "Create",

      // OplDetailsModal strings
      oplDetailsModalTitle: "OPL Details: {title}",
      oplDetailsContentPreview: "Content Preview",
      oplDetailsNoContent: "No details to display.",
      oplDetailsAddContent: "Add Content",
      oplDetailsTextType: "Text",
      oplDetailsImageType: "Image",
      oplDetailsVideoType: "Video",
      oplDetailsPdfType: "PDF",
      oplDetailsAddText: "Add Text",
      oplDetailsAddImage: "Add Image",
      oplDetailsAddVideo: "Add Video",
      oplDetailsAddPdf: "Add PDF",
      oplDetailsViewTab: "View",
      oplDetailsPlayVideo: "Play Video",
      oplDetailsViewPdf: "View PDF",
      oplDetailsPdfPreviewTitle: "PDF Preview",
      oplDetailsVideoPreviewTitle: "Video Preview",
      oplDetailsClose: "Close",
      oplDetailsOpenInNewTab: "Open in New Tab",

      // OplDetailsList strings
      oplDetailsListNoDetails:
        "No details to display. Add content using the other tabs.",
      oplDetailsListOrderColumn: "Order",
      oplDetailsListTypeColumn: "Type",
      oplDetailsListContentColumn: "Content",
      oplDetailsListActionsColumn: "Actions",
      oplDetailsListTextType: "Text",
      oplDetailsListImageType: "Image",
      oplDetailsListVideoType: "Video",
      oplDetailsListPdfType: "PDF",
      oplDetailsListViewContent: "View {type}",
      oplDetailsListNoContent: "No content",

      oplPageManagementTitle: "OPL Management",
      oplPageCreateButton: "Create OPL",
      oplPageEditModalTitle: "Edit OPL",
      oplPageCreateModalTitle: "Create OPL",

      oplErrorLoadingList: "Error loading OPL list",
      oplErrorLoadingUsers: "Error loading users",
      oplErrorLoadingDetails: "Error loading OPL details",
      oplSuccessUpdated: "OPL updated successfully",
      oplSuccessCreated: "OPL created successfully",
      oplErrorSaving: "Error saving the OPL",
      oplSuccessTextAdded: "Text detail added successfully",
      oplErrorAddingText: "Error adding text detail",
      oplErrorNoFileSelected: "No file selected",
      oplSuccessMediaAdded: "{type} detail added successfully",
      oplErrorAddingMedia: "Error adding {type} detail",

      // CreateCiltSequenceModal strings
      createCiltSequenceModalTitle: "Create CILT Sequence",
      createCiltSequenceModalSuccess: "Success",
      createCiltSequenceModalSuccessDescription:
        "CILT sequence created successfully",
      createCiltSequenceModalError: "Error",
      createCiltSequenceModalErrorDescription:
        "Error creating CILT sequence",
      createCiltSequenceModalErrorLoadingTypes: "Error loading CILT types",
      createCiltSequenceModalErrorLoadingFrequencies:
        "Error loading frequencies",
      createCiltSequenceModalErrorNoFrequency:
        "Please select at least one frequency",
      createCiltSequenceModalBasicInfoTitle: "Basic Information",
      createCiltSequenceModalDetailsTitle: "Details",
      createCiltSequenceModalFrequenciesTitle: "Frequencies",
      createCiltSequenceModalFrequenciesDescription:
        "Select one or more frequencies for this sequence",
      createCiltSequenceModalFrequenciesRequired:
        "Please select at least one frequency",
      createCiltSequenceModalDefaultSiteName: "Site",

      // EditCiltSequenceModal strings
      editCiltSequenceModalCiltTypeLabel: "CILT Type",
      editCiltSequenceModalCiltTypeRequired: "CILT type is required",
      editCiltSequenceModalCiltTypePlaceholder: "Select CILT type",
      editCiltSequenceModalLevelLabel: "Level",
      editCiltSequenceModalLevelRequired: "Level is required",
      editCiltSequenceModalSelectLevel: "Select level",
      editCiltSequenceModalReferenceOplLabel: "Reference OPL/SOP",
      editCiltSequenceModalSelectReferenceOpl: "Select reference OPL/SOP",
      editCiltSequenceModalRemediationOplLabel: "Remediation OPL/SOP",
      editCiltSequenceModalSelectRemediationOpl: "Select remediation OPL/SOP",
      editCiltSequenceModalSequenceListLabel: "Instructions",
      editCiltSequenceModalSequenceListRequired: "Instructions is required",
      editCiltSequenceModalSequenceListPlaceholder: "Enter instructions",
      editCiltSequenceModalColorLabel: "Sequence Color",
      editCiltSequenceModalColorRequired: "Color is required",
      editCiltSequenceModalStandardTimeLabel: "Standard Time (seconds)",
      editCiltSequenceModalStandardTimeRequired: "Standard time is required",
      editCiltSequenceModalStandardOkLabel: "Standard OK",
      editCiltSequenceModalStandardOkRequired: "Standard OK is required",
      editCiltSequenceModalStoppageReasonLabel: "Is it a stoppage reason?",
      editCiltSequenceModalMachineStoppedLabel: "Machine stopped?",
      editCiltSequenceModalStatusLabel: "Status",
      editCiltSequenceModalQuantityPicturesCreateLabel: "Fotos al inicio",
      editCiltSequenceModalQuantityPicturesCreateRequired:
        "Quantity Pictures Create is required",
      editCiltSequenceModalQuantityPicturesCloseLabel:
        "Quantity Pictures Close",
      editCiltSequenceModalQuantityPicturesCloseRequired:
        "Quantity Pictures Close is required",
      editCiltSequenceModalToolsRequiredLabel: "Tools Required",
      // EditCiltSequenceModal strings
      editCiltSequenceModalTitle: "Edit CILT Sequence",
      editCiltSequenceModalSuccess: "Success",
      editCiltSequenceModalSuccessDescription:
        "CILT sequence updated successfully",
      editCiltSequenceModalError: "Error",
      editCiltSequenceModalErrorDescription: "Error updating CILT sequence",
      editCiltSequenceModalErrorLoadingTypes: "Error loading CILT types",
      editCiltSequenceModalPositionLabel: "Position",
      editCiltSequenceModalPositionPlaceholder: "Select position",
      editCiltSequenceModalReferenceOplPlaceholder: "Select reference OPL/SOP",
      editCiltSequenceModalRemediationOplPlaceholder:
        "Select remediation OPL/SOP",
      editCiltSequenceModalOrderLabel: "Order",
      editCiltSequenceModalOrderRequired: "Order is required",
      editCiltSequenceModalOrderPlaceholder: "Enter order",
      editCiltSequenceModalColorPlaceholder: "Enter color code",
      editCiltSequenceModalStandardTimePlaceholder: "Enter standard time",
      editCiltSequenceModalToolsRequiredPlaceholder: "Enter tools required",
      editCiltSequenceModalStandardOkPlaceholder: "Enter standard OK",

      // CiltCardList strings
      ciltCardListSequencesModalTitle: "Sequences of {ciltName}",
      ciltCardListCloseButton: "Close",
      ciltCardListCreateNewSequenceButton: "Create New Sequence",
      ciltCardListSearchPlaceholder:
        "Search sequences...",
      ciltCardListTotalSequences: "Total: {count} sequences",
      ciltCardListNoSequencesAssociated:
        "No sequences associated with this CILT.",
      ciltCardListNoSequencesMatchingSearch:
        "No sequences match your search criteria.",
      ciltCardListSequenceLabel: "Sequence {order}",
      ciltCardListStandardTimeLabel: "Standard Time:",
      ciltCardListToolsLabel: "Required Tools:",
      ciltCardListCreatedLabel: "Created:",
      ciltCardListViewDetailsButton: "View Details",
      ciltCardListViewReferenceOplButton: "View Reference OPL",
      ciltCardListViewRemediationOplButton: "View Remediation OPL",
      ciltCardListEditSequenceButton: "Edit Sequence",
      ciltCardListSequenceDetailsModalTitle: "Sequence Details",
      ciltCardListPositionLabel: "Position:",
      ciltCardListCiltTypeLabel: "CILT Type:",
      ciltCardListColorLabel: "Color:",
      ciltCardListRequiredToolsLabel: "Required Tools:",
      ciltCardListStoppageReasonLabel: "Stoppage Reason:",
      ciltCardListStandardOkLabel: "Standard OK:",
      ciltCardListQuantityPicturesCreateLabel: "Pictures for Creation:",
      ciltCardListQuantityPicturesCloseLabel: "Pictures for Closure:",
      ciltCardListRelatedOplsTitle: "Related OPLs",
      ciltCardListReferenceOplLabel: "Reference OPL:",
      ciltCardListRemediationOplLabel: "Remediation OPL:",
      ciltCardListViewReferenceOplLinkText: "View Reference OPL",
      ciltCardListViewRemediationOplLinkText: "View Remediation OPL",
      ciltCardListCreationDateLabel: "Creation Date:",
      ciltCardListLastUpdateLabel: "Last Update:",
      ciltCardListYesText: "Yes",
      ciltCardListNoText: "No",
      ciltCardListOplInfoMessage: "OPL Information",
      ciltCardListNoSequencesMessage:
        "No sequences associated with {ciltName}.",
      ciltCardListNoOplAssociatedMessage:
        "No OPL associated with this sequence.",
      ciltCardListNoMultimediaMessage:
        'No multimedia files available for OPL: {oplTitle}',
      ciltCardListErrorLoadingSequences: "Error loading sequences",
      ciltCardListErrorReloadingSequences: "Error reloading sequences",
      ciltCardListErrorLoadingOplDetails: "Error loading OPL details",
      ciltCardListCreateSequence: "Create Sequence",
      ciltCardListViewSequences: "View Sequences",
      ciltCardListObjectiveLabel: "Objective:",
      ciltCardListMultimediaFilesTitle: "Multimedia Files",
      ciltCardListImageLabel: "Image",
      ciltCardListVideoLabel: "Video",
      ciltCardListPlayVideoButton: "Play Video",
      ciltCardListPdfLabel: "PDF",
      ciltCardListViewPdfButton: "View PDF",
      ciltCardListPdfPreviewModalTitle: "PDF Preview",
      ciltCardListVideoPreviewModalTitle: "Video Preview",
      ciltCardListVideoNotSupported: "Your browser does not support the video tag.",
      searchBarDefaultPlaceholder: "Searching...",
      ciltLevelTreeModalCreateSequenceHere: "Create Sequence Here",
      ciltProceduresSearchPlaceholder: "Searching...",
      informationDetail: "Information",

      oplSelectionModalTitle: "Select OPL / SOP",
      oplSelectionModalTitleColumn: "OPL / SOP Name",
      oplSelectionModalTypeColumn: "Type",
      oplSelectionModalActionsColumn: "Actions",
      oplSelectionModalSelectButton: "Select OPL / SOP",
      oplSelectionModalMultimediaButton: "View multimedia",
      oplSelectionModalMultimediaTitle: "Multimedia",
      oplSelectionModalNoContent: "No content",
      oplSelectionModalCreateTitle: "Create OPL / SOP",
      oplSelectionModalSuccessDetail: "OPL / SOP created successfully",
      oplSelectionModalSuccessDescription: "OPL / SOP created successfully",
      oplSelectionModalErrorDetail: "Error creating OPL / SOP",
      oplSelectionModalImageTitle: "Image",
      oplSelectionModalImageAlt: "Image",
      oplSelectionModalSuccessOpl: "OPL / SOP created successfully",
      oplSelectionModalErrorOpl: "Error creating OPL / SOP",
      oplSearchBarPlaceholder: "Search OPL / SOP",
      
      // CILT Table strings
      createSequence: "Create Sequence",
      viewSequences: "View Sequences",
      information: "Information",
      
      // CILT Sequences strings
      sequences: "Sequences",
      sequence: "Sequence",
      createNewSequence: "Create New Sequence",
      searchByDescriptionOrderOrTime: "Search by description, order or time",
      noSequencesForCilt: "No sequences associated with this CILT.",
      noSequencesMatchSearch: "No sequences match your search.",
      thisGroup: "This CILT",
      noSequencesYet: "doesn't have sequences yet. You can create a new sequence using the \"Create New Sequence\" button.",
      viewDetails: "View Details",
      detailsOf: "Details of",
      editSequence: "Edit Sequence",

      // CILT Details and OPL strings
      ciltType: "CILT Type",
  
      requiredTools: "Required Tools",
      stoppageReason: "Stoppage Reason",
      standardOk: "Standard OK",
      quantityPicturesCreate: "Quantity of Pictures (Create)",
      quantityPicturesClose: "Quantity of Pictures (Close)",
      relatedOPLs: "Related OPLs",
      referenceOPL: "Reference OPL",
      viewReferenceOPL: "View Reference OPL",
      remediationOPL: "Remediation OPL",
      viewRemediationOPL: "View Remediation OPL",
      tools: "Tools",
      created: "Created",
      noOplAssociated: "This sequence doesn't have an associated OPL yet.",
      thisOpl: "This OPL",
      noMediaFiles: "doesn't have associated multimedia files yet.",
      browserNotSupportVideo: "Your browser doesn't support video playback.",
      viewReferenceOpl: "View Reference OPL",
      viewRemediationOpl: "View Remediation OPL",
      cilt: "CILT",
      selectedUsersList: "Selected Users:",
      ciltMstrLastUpdated: "Last Updated:",
      lastLoginWeb: "Last login web",
      lastLoginApp: "Last login app",
      imageLoadSuccess: "Image uploaded successfully",
      imageLoadError: "Error uploading image",
      warningImageUpload: "Warning: image not uploaded correctly",
      scheduleSecuence: "Schedule Sequence",
      confirmCloneCiltMstrMessage: "Are you sure you want to clone the CILT?",
      confirmCloneSecuencesMessage: "All sequences will also be cloned",
      draft: "Draft",
      totalUsersCreated: "Total number of users created",
      totalUsersProcessed: "Total number of users processed",
      importUsersSummary: "Summary of imported users",
      reason: "Reason",
      registered: "Registered",
      noProceduresFound: "No procedures found",

      
      dayValue: "day",
      weekValue: "week",
      monthValue: "month",
      yearValue: "year",
      repeat : "Repeat",
      repeatEach : "Repeat each",

      ciltDueDate: "CILT Due Date",
      ciltDueDatePlaceholder: "CILT Due Date",
      select: "Select",
      editUser:"Update user",
      fastPassword: "Fast password",
      manual: "User manual",
      downloadUsersTemplate: "Download users template",

      //NEW UPDATE ENGLISH
      start: "Start",
      eachPlace: "It takes place every",
      until: "until", 
      quitDate: "Remove end date",
      freqMessage: "The code cannot exceed 3 characters",
      referencePoint: "Reference Point",
      selectableWithoutProgramming: "Selectable Without Programming",
      createCiltSequenceModalErrorSelectFrequency: "Please select at least one frequency.",
    },
  },
  es: {
    translation: {
      selectUsers: "Usuarios seleccionados",
      selected: "Seleccionados",
      usersSelected: "Usuarios seleccionados",
      noUsersSelected: "No hay usuarios seleccionados",
      selectedUsers: "Usuarios seleccionados",

      requiredLevelId: "Id de nivel requerido",
      requiredLevelName: "Nombre del nivel requerido",
      requiredRoute: "Ruta de posición requerida",
      requiredAreaId: "Id de área requerido",
      requiredAreaName: "Nombre de área requerido",
      tagsIssued: "Tarjetas emitidas",
      tagsEradicated: "Tarjetas erradicadas",
      cloningLevelsMessage: "Clonando niveles...",
      errorCloningTheLevel: "Error al clonar el arbol: ",
      errorGettingLevelId: "Error al obtener el id del nivel",
      copy: "(copia)",
      associatedTags: "Tarjetas asociadas",
      commentsTag: "Comentarios:",
      noCommentsTag: "Sin comentarios",
      notCardInfoFound: "No se encontró información para esta tarjeta.",
      assignUser: "Asignar Usuario",
      assignedTo: "Responsable:",
      selectRole: "Seleccionar",
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
      positionsSB: "Posiciones",
      systemHealthSB: "Salud del Sistema",

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
      noMechanic: "Sin responsable",
      noDefinitiveUser: "Sin usuario definitivo",
      images: "Imágenes",
      videos: "Videos",
      audios: "Audios",
      evidences: "Evidencias",
      none: "None",
      expand: "Ampliar",

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
      viewPositions: "Ver posiciones",
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
      createPreclassifier: "Crear Preclasificador",
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
      mechanics: "Responsables",
      creator: "Creador",
      comments: "Comentarios",
      updateMechanic: "Actualizar mecánico",
      changeLog: "Registro de cambios",
      noDueDate: "Sin fecha de vencimiento",

      // Tags re-design
      tagsOf: "Tarjetas de",
      filters: "Filtros",
      status: "Estado",
      dueDate: "Fecha de vencimiento",
      cardType: "Tipo de Tarjeta",
      problemType: "Tipo de problema",
      location: "Ubicación",
      createdBy: "Creado por",
      problemDescription: "Descripción del problema",

      // Tags details re-design
      tagStatusCanceled: "Cancelado",
      tagDate: "Fecha",
      tagDays: "Días",
      ceroDays: "0 días",
      tagNumber: "Número de Tarjeta",
      tagPriority: "Prioridad",
      dateStatus: "Estado de la fecha",
      tagMechanic: "Mecánico",
      tagProvisionalUser: "Usuario provisional",
      tagProvisionalSoluitonApplied: "Solución provisional aplicada",
      creationDate: "Fecha de creación",
      daysSinceCreation: "Días desde la creación",
      cero: "0",
      anomalyDetected: "Anomalía detectada",
      appProvisionalUser: "Usuario provisional de la app",
      appDefinitiveUser: "Usuario definitivo de la app",
      definitiveUser: "Usuario definitivo",
      definitiveSolutionApplied: "Solución definitiva aplicada",

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
      machines: "Zonas",
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
      add: "Agregar",

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
      suspended: "Suspendido",
      canceled: "Cancelado",
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
        "Introduce el nombre del sitio . Longitud máxima: 100 caracteres.",
      siteRfcTooltip:
        "Introduce el  RFC para la empresa asociada al sitio. Debe tener exactamente 13 caracteres.",
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
        "Proporciona el número de teléfono principal, incluyendo código de área. Longitud máxima: 13 caracteres.",
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
        "Proporcione la duración total (en segundos) de videos para la etapa de creación.",
      quantityAudiosCreateTooltip:
        "Especifique el número de archivos de audio requeridos en la etapa de creación.",
      audiosDurationCreateTooltip:
        "Proporcione la duración total (en segundos) de archivos de audio para la etapa de creación.",
      quantityPicturesPsTooltip:
        "Ingrese el número de imágenes requeridas en la etapa de solución provisional.",
      quantityVideosPsTooltip:
        "Especifique el número de videos requeridos en la etapa de solución provisional.",
      videosDurationPsTooltip:
        "Proporcione la duración total (en segundos) de videos para la etapa de solución provisional.",
      quantityAudiosPsTooltip:
        "Especifique el número de archivos de audio requeridos en la etapa de solución provisional.",
      audiosDurationPsTooltip:
        "Proporcione la duración total (en segundos) de archivos de audio para la etapa de solución provisional.",

      quantityPicturesCloseTooltip:
        "Ingrese el número de imágenes requeridas en la etapa de solución definitiva.",
      quantityVideosCloseTooltip:
        "Especifique el número de videos requeridos en la etapa de solución definitiva.",
      videosDurationCloseTooltip:
        "Proporcione la duración total (en segundos) de videos para la etapa de solución definitiva.",
      quantityAudiosCloseTooltip:
        "Especifique el número de archivos de audio requeridos en la etapa de solución definitiva.",
      audiosDurationCloseTooltip:
        "Proporcione la duración total (en segundos) de archivos de audio para la etapa de solución definitiva.",
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
      notificationsSelectUsers: "Seleccione Usuarios",
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
      cardTypeTreeColorPlaceholder: "Pick a color",

      // Placeholders for Quantity Fields
      cardTypeTreeQuantityPicturesPlaceholder:
        "Introduce la cantidad de imágenes",
      cardTypeTreeQuantityVideosPlaceholder: "Introduce la cantidad de videos",
      cardTypeTreeQuantityAudiosPlaceholder: "Introduce la cantidad de audios",

      // Titles or Section Labels
      cardTypeTreeAtCreation: "En la creación",
      cardTypeTreeAtProvisionalSolution: "En la solución provisional",
      cardTypeTreeAtDefinitiveSolution: "En la solución definitiva",

      // Error Messages
      cardTypeTreeRequiredCardTypeName:
        "El nombre del tipo de Tarjeta es obligatorio",
      cardTypeTreeRequiredDescription: "La descripción es obligatoria",
      cardTypeTreeRequiredResponsableId: "El responsable es obligatorio",
      cardTypeTreeRequiredColor: "El color es obligatorio",

      // Notifications
      cardTypeTreeSuccessCardTypeUpdated:
        "¡El tipo de Tarjeta se actualizó con éxito!",
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
      cardTypesMethodologyError:
        "La metodología del tipo de Tarjeta es obligatoria para la creación.",
      cardTypesLoadingData: "Cargando datos...",
      cardTypesUpdateCardType: "Editar Tipo de Tarjeta",
      cardTypesCreateCardType: "Crear Tipo de Tarjeta",
      cardTypesClonePreclassifier: "Clonar preclasificador",
      cardTypesErrorFetchingData: "Error al obtener datos",
      cardTypesNoCardTypeIdError:
        "No se encontró el ID del tipo de Tarjeta para crear un preclasificador.",
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
      tagDetails: "Detalles de la tarjeta",
      problemDetails: "Detalles del problema",
      sharePDF: "Compartir PDF",
      namePDF: "Detalles de la tarjeta.pdf",

      logImgDesc: "Imagen del Log In",
      enSub: "One Smart Mate",

      // Positions Page
      positions: "Posiciones",
      createPosition: "Crear Posición",
      searchPositions: "Buscar por nombre, área, nivel o estado",
      noAssignedUsers: "No hay usuarios asignados a esta posición",
      assignedUsers: "Usuarios asignados",
      loadingPositions: "Cargando posiciones...",
      positionFound: "posición encontrada",
      positionsFound: "posiciones encontradas",

      // System Health
      systemHealthTitle: "Estado de Salud del Sistema",
      testingNotifications: "Probando notificaciones",
      testingEmails: "Probando envío de correos",
      testingServices: "Probando servicios",
      testingDbWrite: "Probando escritura en base de datos",
      testingServerRam: "Probando RAM en servidor",
      testingEvidenceWrite: "Probando escritura de evidencias",
      healthStatusOk: "OK",
      healthStatusFailed: "FALLO",

      // System Health additional strings
      sessionPerformance: "Rendimiento de tu Sesión",
      memoryUsage: "Uso de Memoria",
      usedMemory: "Memoria Utilizada",
      totalMemory: "Memoria Total",
      pageLoadTime: "Tiempo de Carga",
      domComplete: "DOM Completo",
      networkLatency: "Latencia de Red",
      positionsRange: "{{start}}-{{end}} de {{total}} posiciones",
      noPositionsToShow: "No hay posiciones para mostrar",
      noUsersAvailableForSite: "No hay usuarios disponibles para este sitio",
      positionName: "Nombre de la posición",
      positionDescription: "Descripción de la posición",
      selectUsersForPosition:
        "Seleccione los usuarios que estarán asignados a esta posición",
      cancelPosition: "Cancelar",
      updatePositionTitle: "Editar Posición",
      selectStatus: "Seleccione un estado",
      positionNameMaxLength: "El nombre no puede exceder los 45 caracteres",
      positionDescriptionMaxLength:
        "La descripción no puede exceder los 100 caracteres",
      noPositionData: "No se encontraron datos de posición para actualizar.",
      positionUpdatedSuccess: "La posición ha sido actualizada exitosamente.",
      positionUpdateError:
        "Ocurrió un error al actualizar la posición. Por favor intente de nuevo.",
      pleaseSelectStatus: "Por favor seleccione un estado",

      // Table locale strings
      accept: "Aceptar",
      reset: "Reiniciar",
      search: "Buscar",
      filter: "Filtrar",
      selectCurrentPage: "Seleccionar página actual",
      invertSelection: "Invertir selección",
      selectAll: "Seleccionar todo",
      sort: "Ordenar",
      sortDesc: "Click para ordenar descendente",
      sortAsc: "Click para ordenar ascendente",
      cancelSort: "Click para cancelar ordenamiento",

      // Position table headers
      positionAreaHeader: "Área",
      positionNodeZoneHeader: "Nodo / Zona",
      positionNameHeader: "Nombre",
      positionDescriptionHeader: "Descripción",
      positionStatusHeader: "Estado",
      positionActionsHeader: "Acciones",

      success: "Éxito",
      error: "Error",
      "No position data found for update.":
        "No se encontró información de posición para actualizar.",
      "The position has been updated successfully.":
        "La posición se actualizó con éxito.",
      "An error occurred while updating the position. Please try again.":
        "Ocurrió un error al actualizar la posición. Por favor, inténtalo de nuevo.",
      "The name cannot exceed 45 characters":
        "El nombre no puede exceder los 45 caracteres",
      "The description cannot exceed 100 characters":
        "La descripción no puede exceder los 100 caracteres",
      "Please select a status": "Por favor, selecciona un estado",
      "Select a status": "Selecciona un estado",
      createPositionHere: "Crear posición aquí",

      // User positions
      loadingUserPositions: "Cargando posiciones",
      noPositionsAvailable: "No hay posiciones disponibles",
      userPositions: "Posiciones",
      confirmCloneLevel: "Confirmar Clonación de Nivel",
      confirmCloneLevelMessage:
        "¿Estás seguro de que deseas clonar el nivel?. ",
      levelSubLebelsWarning:
        "Al clonar un nivel, todos sus sub-niveles también serán clonados.",
      defaultNotificationTitle: "Notificación",
      defaultNotificationMessage: "Has recibido una nueva notificación",
      notificationReceived: "Notificación recibida",

      collapseAll: "Contraer todo",
      expandAll: "Expandir todo",
      machinesOfArea: "Zonas del Area",
      assignPositions: "Asignar Posiciones",
      uploadCardAndEvidenceWithDataNet:
        "Cargar tarjeta y evidencias con datos de red",
      databaseConnectionTest: "Prueba de conexión a base de datos",
      verificationOfServices: "Verificación de Servicios",
      catalogs: "Catálogos",
      accounts: "Cuentas",
      dashboard: "Panel",
      technicalSupport: "Soporte Técnico",
      tagVersion: import.meta.env.VITE_AP_VERSION,
      redesign: import.meta.env.VITE_IS_REDESIGN,
      enterEmail: "Introduce tu correo electrónico",
      enterPassword: "Introduce tu contraseña",
      permissionsError: "No tienes permisos para acceder a esta aplicación.",

      // CILT related strings
      createCiltProcedure: "Crear procedimiento CILT",
      createCiltProcedureForPosition: "Crear procedimiento CILT para posición",
      ciltName: "Nombre del procedimiento CILT",
      registerCiltNameRequiredValidation:
        "Por favor, ingresa el nombre del procedimiento CILT",
      registerCiltNameMaxLengthValidation:
        "Nombre del procedimiento CILT no puede exceder 100 caracteres",
      registerCiltNamePlaceholer: "Nombre del procedimiento CILT",
      ciltDescription: "Descripción del procedimiento CILT",
      registerCiltDescriptionRequiredValidation:
        "Por favor, ingresa la descripción del procedimiento CILT",
      registerCiltDescriptionMaxLengthValidation:
        "Descripción del procedimiento CILT no puede exceder 500 caracteres",
      registerCiltDescriptionPlaceholer: "Descripción del procedimiento CILT",
      standardTime: "Tiempo estándar",
      registerCiltStandardTimeRequiredValidation:
        "Por favor, ingresa el tiempo estándar",
      registerCiltStandardTimePlaceholer: "Tiempo estándar",
      learningTime: "Tiempo de aprendizaje",
      registerCiltLearningTimeRequiredValidation:
        "Por favor, ingresa el tiempo de aprendizaje",
      registerCiltLearningTimePlaceholer: "Tiempo de aprendizaje",
      ciltCreator: "Creador",
      registerCiltCreatorRequiredValidation: "Por favor, ingresa el creador",
      reviewer: "Revisor",
      registerCiltReviewerRequiredValidation: "Por favor, ingresa el revisor",
      registerCiltReviewerPlaceholer: "Selecciona un revisor",
      approver: "Aprobador",
      registerCiltApproverRequiredValidation: "Por favor, ingresa el aprobador",
      registerCiltApproverPlaceholer: "Selecciona un aprobador",
      layoutImage: "Diagrama",
      registerCiltLayoutImageRequiredValidation:
        "Por favor, ingresa la imagen del diagrama",
      imageUploadError: "Only image files are allowed",
      selectCreator: "Selecciona un creador",
      selectReviewer: "Selecciona un revisor",
      selectApprover: "Selecciona un aprobador",
      ciltProceduresSB: "Procedimientos CILT",
      ciltProceduresDescription:
        "Esta página contiene información sobre los procedimientos CILT y su implementación.",
      seconds: "segundos",
      oplSB: "OPL",
      oplDescription:
        "Esta página contiene información sobre One Point Lessons (OPL).",
      ciltTypesSB: "Tipos de CILT",
      ciltTypesOf: "Tipos de CILT de",
      ciltTypesDescription:
        "Esta página contiene información sobre diferentes tipos de CILT.",
      ciltFrecuenciesSB: "Frecuencias de CILT",
      ciltFrecuenciesOf: "Frecuencias de CILT de",
      ciltFrecuenciesDescription:
        "Esta página contiene información sobre frecuencias de CILT.",

  
        searchByName: "Buscar por nombre",
        addNewCiltType: "Agregar nuevo tipo de CILT",
        errorLoadingNewTypesCilt: "Error al cargar los tipos de CILT",
        typeCiltUpdated: "Tipo de CILT actualizado",
        errorUpdatingCiltType: "Error al actualizar el tipo de CILT",
        ciltTypeAdded: "Tipo de CILT agregado",
        errorAddingCiltType: "Error al agregar el tipo de CILT",
        noCiltTypes: "No hay tipos de CILT para mostrar.",
        obligatoryName: "El nombre es obligatorio",
        editCiltType: "Editar tipo de CILT",
        addCiltType: "Agregar tipo de CILT",
        
        frequencyCode: "Código de frecuencia",
        addNewCiltFrequency: "Agregar nueva frecuencia de CILT",
        editCiltFrequency: "Editar frecuencia de CILT",
        addCiltFrequency: "Agregar frecuencia",
        ciltFrequencyAdded: "Frecuencia agregada exitosamente",
        ciltFrequencyUpdated: "Frecuencia actualizada exitosamente",
        errorAddingCiltFrequency: "Error al agregar la frecuencia",
        errorUpdatingCiltFrequency: "Error al actualizar la frecuencia",
        errorLoadingCiltFrequencies: "Error al cargar las frecuencias",
        noCiltFrequencies: "No hay frecuencias disponibles",
        obligatoryCode: "El código de frecuencia es obligatorio",
        obligatoryDescription: "La descripción es obligatoria",
        searchbyDescriptionOrCode: "Buscar por código o descripción",
        

      // CILT Master strings
      ciltMstrPageTitle: "Procedimientos CILT",
      ciltMstrCreateSuccess: "Procedimiento CILT creado exitosamente",
      ciltMstrSelectPositionTitle: "Selecciona una posición",
      ciltMstrCreateButtonLabel: "Crear procedimiento CILT",
      ciltMstrCreateModalTitle: "Crear procedimiento CILT",
      ciltMstrPositionLabel: "Posición",
      // CILT Edit Modal strings
      ciltMstrEditModalTitle: "Editar CILT",
      ciltMstrSaveChangesButton: "Guardar Cambios",
      ciltMstrCancelButton: "Cancelar",
      ciltMstrUpdateError: "Error al actualizar. Intente de nuevo.",
      ciltMstrUpdateSuccess: "CILT actualizado correctamente.",
      ciltMstrNameLabel: "Nombre CILT",
      ciltMstrNameRequired: "Por favor ingrese el nombre!",
      ciltMstrDescriptionLabel: "Descripción",
      ciltMstrStandardTimeLabel: "Tiempo Estándar en segundos",
      ciltMstrInvalidNumberMessage: "Por favor ingrese un número válido",
      ciltMstrLearningTimeLabel: "Tiempo Aprendizaje",
      ciltMstrStatusLabel: "Estado",
      ciltMstrStatusRequired: "Por favor seleccione un estado!",
      ciltMstrStatusPlaceholder: "Seleccione un estado",
      ciltMstrStatusActive: "Activo",
      ciltMstrStatusSuspended: "Suspendido",
      ciltMstrStatusCanceled: "Cancelado",

      // CILT Details Modal strings
      ciltMstrDetailsModalTitle: "Detalles del CILT",
      ciltMstrCloseButton: "Cerrar",
      ciltMstrDetailsNameLabel: "Nombre",
      ciltMstrDetailsDescriptionLabel: "Descripción",
      ciltMstrCreatorLabel: "Creador",
      ciltMstrReviewerLabel: "Revisor",
      ciltMstrApproverLabel: "Aprobado por",
      ciltMstrDetailsStandardTimeLabel: "Tiempo Estándar en segundos",
      ciltMstrDetailsLearningTimeLabel: "Tiempo Aprendizaje",
      ciltMstrOrderLabel: "Orden",
      ciltMstrDetailsStatusLabel: "Estado",
      ciltMstrLastUsedLabel: "Última vez utilizado",
      ciltMstrLayoutLabel: "Diagrama",
      ciltMstrViewFullImage: "Ver imagen completa",
      ciltMstrNotAvailable: "No disponible",
      ciltMstrNA: "N/D",

      // CILT Card List strings
      ciltMstrListNameColumn: "Nombre",
      ciltMstrListDescriptionColumn: "Descripción",
      ciltMstrListCreatorColumn: "Creador",
      ciltMstrListStandardTimeColumn: "Tiempo Estándar en segundos",
      ciltMstrListStatusColumn: "Estado",
      ciltMstrListCreationDateColumn: "Fecha de Creación",
      ciltMstrListActionsColumn: "Acciones",
      ciltMstrListEditAction: "Editar",
      ciltMstrListDetailsAction: "Detalles",
      ciltMstrListSequencesAction: "Secuencias",
      ciltMstrListActiveFilter: "Activo",
      ciltMstrListSuspendedFilter: "Suspendido",
      ciltMstrListCanceledFilter: "Cancelado",
      ciltMstrCreateSequenceButton: "Crear Secuencia",
      addFiles: "Agregar archivos",

      // OPL related strings
      oplViewModalTitle: "Detalles del OPL",
      oplGeneralInfo: "Información general",
      oplTitle: "Título",
      oplObjective: "Objetivo",
      oplCreatedBy: "Creado por",
      oplReviewedBy: "Revisado por",
      oplCreationDate: "Fecha de creación",
      oplContentPreview: "Vista previa del contenido",
      oplNoDetails: "No hay detalles disponibles para este OPL",
      oplTextType: "Texto",
      oplImageType: "Imagen",
      oplVideoType: "Video",
      oplPdfType: "PDF",
      oplPlayVideo: "Reproducir video",
      oplViewPdf: "Ver PDF",
      oplOpenInNewTab: "Abrir en una nueva pestaña",
      oplPdfPreviewTitle: "Vista previa de PDF",
      oplVideoPreviewTitle: "Vista previa de video",
      oplClose: "Cerrar",

      // OplTable strings
      oplTableTitleColumn: "Título",
      oplTableObjectiveColumn: "Objetivo",
      oplTableTypeColumn: "Tipo",
      oplTableActionsColumn: "Acciones",
      oplTableViewTooltip: "Ver OPL",
      oplTableEditTooltip: "Editar OPL",
      oplTableOplType: "OPL",
      oplTableSopType: "SOP",
      oplTableViewButtonText: "Detalles",
      oplTableEditButtonText: "Editar",
      // OplTextForm strings
      oplTextFormLabel: "Texto",
      oplTextFormPlaceholder: "Ingrese contenido de texto",
      oplTextFormValidationMessage: "Por favor, ingrese contenido de texto",
      oplTextFormSubmitButton: "Agregar texto",

      // OplMediaUploader strings
      oplMediaImageTitle:
        "Haz clic o arrastra una imagen a esta área para subirla",
      oplMediaImageHint: "Compatible con JPG, PNG, GIF, etc.",
      oplMediaImageButton: "Subir imagen",
      oplMediaVideoTitle:
        "Haz clic o arrastra un video a esta área para subirlo",
      oplMediaVideoHint: "Compatible con MP4, MOV, AVI, etc.",
      oplMediaVideoButton: "Subir video",
      oplMediaPdfTitle: "Haz clic o arrastra un PDF a esta área para subirlo",
      oplMediaPdfHint: "Compatible con archivos PDF solo",
      oplMediaPdfButton: "Subir PDF",
      oplMediaDefaultTitle:
        "Haz clic o arrastra un archivo a esta área para subir",
      oplMediaDefaultHint: "Admite varios formatos de archivo",
      oplMediaDefaultButton: "Subir Archivo",
      oplErrorInvalidFileType: "El archivo seleccionado no es un archivo válido de tipo {type}",

      // OplFormModal strings
      oplFormModalViewTitle: "Ver OPL",
      oplFormModalEditTitle: "Editar OPL",
      oplFormModalCreateTitle: "Crear OPL",
      oplFormModalCloseButton: "Cerrar",
      oplFormModalCancelButton: "Cancelar",
      oplFormModalSaveButton: "Guardar",
      oplFormTitleLabel: "Título",
      oplFormTitleRequired: "Por favor ingrese un título",
      oplFormTitlePlaceholder: "Ingrese título de OPL",
      oplFormObjectiveLabel: "Objetivo",
      oplFormObjectiveRequired: "Por favor ingrese un objetivo",
      oplFormObjectivePlaceholder: "Ingrese objetivo de OPL",
      oplFormTypeLabel: "Tipo",
      oplFormTypeRequired: "Por favor seleccione un tipo",
      oplFormTypePlaceholder: "Seleccione tipo",
      oplFormTypeOpl: "OPL",
      oplFormTypeSop: "SOP",
      oplFormCreatorLabel: "Creador",
      oplFormCreatorPlaceholder: "Seleccione un creador (opcional)",
      oplFormReviewerLabel: "Revisor",
      oplFormReviewerPlaceholder: "Seleccione un revisor (opcional)",
      oplFormNotAssigned: "No asignado",
      oplFormUpdateButton: "Actualizar",
      oplFormCreateButton: "Crear",

      // OplDetailsModal strings
      oplDetailsModalTitle: "Detalles del OPL: {title}",
      oplDetailsContentPreview: "Vista previa del contenido",
      oplDetailsNoContent: "No hay detalles disponibles para este OPL.",
      oplDetailsAddContent: "Agregar contenido",
      oplDetailsTextType: "Texto",
      oplDetailsImageType: "Imagen",
      oplDetailsVideoType: "Video",
      oplDetailsPdfType: "PDF",
      oplDetailsAddText: "Agregar texto",
      oplDetailsAddImage: "Agregar imagen",
      oplDetailsAddVideo: "Agregar video",
      oplDetailsAddPdf: "Agregar PDF",
      oplDetailsViewTab: "Ver",
      oplDetailsPlayVideo: "Reproducir video",
      oplDetailsViewPdf: "Ver PDF",
      oplDetailsPdfPreviewTitle: "Vista previa de PDF",
      oplDetailsVideoPreviewTitle: "Vista previa de video",
      oplDetailsClose: "Cerrar",
      oplDetailsOpenInNewTab: "Abrir en una nueva pestaña",

      // OplDetailsList strings
      oplDetailsListNoDetails:
        "No hay detalles disponibles para mostrar. Agregue contenido utilizando las otras pestañas.",
      oplDetailsListOrderColumn: "Orden",
      oplDetailsListTypeColumn: "Tipo",
      oplDetailsListContentColumn: "Contenido",
      oplDetailsListActionsColumn: "Acciones",
      oplDetailsListTextType: "Texto",
      oplDetailsListImageType: "Imagen",
      oplDetailsListVideoType: "Video",
      oplDetailsListPdfType: "PDF",
      oplDetailsListViewContent: "Ver {type}",
      oplDetailsListNoContent: "No hay contenido",

      oplPageManagementTitle: "Administración de OPL",
      oplPageCreateButton: "Crear OPL",
      oplPageEditModalTitle: "Editar OPL",
      oplPageCreateModalTitle: "Crear OPL",

      oplErrorLoadingList: "Error al cargar la lista de OPL",
      oplErrorLoadingUsers: "Error al cargar usuarios",
      oplErrorLoadingDetails: "Error al cargar detalles de OPL",
      oplSuccessUpdated: "OPL actualizado con éxito",
      oplSuccessCreated: "OPL creado con éxito",
      oplErrorSaving: "Error al guardar OPL",
      oplSuccessTextAdded: "Detalle de texto agregado con éxito",
      oplErrorAddingText: "Error al agregar detalle de texto",
      oplErrorNoFileSelected: "No se seleccionó un archivo",
      oplSuccessMediaAdded: "{type} agregado con éxito",
      oplErrorAddingMedia: "Error al agregar {type}",

      // CreateCiltSequenceModal strings
      createCiltSequenceModalTitle: "Crear Secuencia CILT",
      createCiltSequenceModalSuccess: "Éxito",
      createCiltSequenceModalSuccessDescription:
        "Secuencia CILT creada exitosamente",
      createCiltSequenceModalError: "Error",
      createCiltSequenceModalErrorDescription:
        "Error al crear la secuencia CILT",
      createCiltSequenceModalErrorLoadingTypes:
        "Error al cargar los tipos de CILT",
      createCiltSequenceModalErrorLoadingFrequencies:
        "Error al cargar las frecuencias",
      createCiltSequenceModalErrorNoFrequency:
        "Por favor seleccione al menos una frecuencia",
      createCiltSequenceModalBasicInfoTitle: "Información Básica",
      createCiltSequenceModalDetailsTitle: "Detalles",
      createCiltSequenceModalFrequenciesTitle: "Frecuencias",
      createCiltSequenceModalFrequenciesDescription:
        "Seleccione una o más frecuencias para esta secuencia",
      createCiltSequenceModalFrequenciesRequired:
        "Por favor seleccione al menos una frecuencia",
      createCiltSequenceModalDefaultSiteName: "Sitio",

      // EditCiltSequenceModal strings
      editCiltSequenceModalCiltTypeLabel: "Tipo de CILT",
      editCiltSequenceModalCiltTypeRequired: "El tipo de CILT es requerido",
      editCiltSequenceModalCiltTypePlaceholder: "Seleccione tipo de CILT",
      editCiltSequenceModalLevelLabel: "Nivel",
      editCiltSequenceModalLevelRequired: "El nivel es requerido",
      editCiltSequenceModalSelectLevel: "Seleccione nivel",
      editCiltSequenceModalReferenceOplLabel: "OPL/SOP de Referencia",
      editCiltSequenceModalSelectReferenceOpl:
        "Seleccione OPL/SOP de referencia",
      editCiltSequenceModalRemediationOplLabel: "OPL/SOP de Remediación",
      editCiltSequenceModalSelectRemediationOpl:
        "Seleccione OPL/SOP de remediación",
      editCiltSequenceModalSequenceListLabel: "Instrucciones",
      editCiltSequenceModalSequenceListRequired:
        "Las instrucciones son requeridas",
      editCiltSequenceModalSequenceListPlaceholder:
        "Ingrese instrucciones",
      editCiltSequenceModalColorLabel: "Color de Secuencia",
      editCiltSequenceModalColorRequired: "El color es requerido",
      editCiltSequenceModalStandardTimeLabel: "Tiempo Estándar en segundos",
      editCiltSequenceModalStandardTimeRequired:
        "El tiempo estándar es requerido",
      editCiltSequenceModalStandardOkLabel: "Estándar OK",
      editCiltSequenceModalStandardOkRequired: "El estándar OK es requerido",
      editCiltSequenceModalStoppageReasonLabel: "Razón de Parada",
      editCiltSequenceModalMachineStoppedLabel: "¿Máquina detenida?",
      editCiltSequenceModalStatusLabel: "Estado",
      editCiltSequenceModalQuantityPicturesCreateLabel:
        "Cantidad de Imágenes al Crear",
      editCiltSequenceModalQuantityPicturesCreateRequired:
        "La cantidad de imágenes al crear es requerida",
      editCiltSequenceModalQuantityPicturesCloseLabel:
        "Cantidad de Imágenes al Cerrar",
      editCiltSequenceModalQuantityPicturesCloseRequired:
        "La cantidad de imágenes al cerrar es requerida",
      editCiltSequenceModalToolsRequiredLabel: "Herramientas Requeridas",
      // EditCiltSequenceModal strings
      editCiltSequenceModalTitle: "Editar Secuencia CILT",
      editCiltSequenceModalSuccess: "Éxito",
      editCiltSequenceModalSuccessDescription:
        "Secuencia CILT actualizada exitosamente",
      editCiltSequenceModalError: "Error",
      editCiltSequenceModalErrorDescription:
        "Error al actualizar la secuencia CILT",
      editCiltSequenceModalErrorLoadingTypes:
        "Error al cargar los tipos de CILT",
      editCiltSequenceModalPositionLabel: "Posición",
      editCiltSequenceModalPositionPlaceholder: "Seleccione posición",
      editCiltSequenceModalReferenceOplPlaceholder:
        "Seleccione OPL/SOP de referencia",
      editCiltSequenceModalRemediationOplPlaceholder:
        "Seleccione OPL/SOP de remediación",
      editCiltSequenceModalOrderLabel: "Orden",
      editCiltSequenceModalOrderRequired: "El orden es requerido",
      editCiltSequenceModalOrderPlaceholder: "Ingrese orden",
      editCiltSequenceModalColorPlaceholder: "Ingrese código de color",
      editCiltSequenceModalStandardTimePlaceholder: "Ingrese tiempo estándar",
      editCiltSequenceModalToolsRequiredPlaceholder:
        "Ingrese herramientas requeridas",
      editCiltSequenceModalStandardOkPlaceholder: "Ingrese estándar OK",

      // CiltCardList strings
      ciltCardListSequencesModalTitle: "Secuencias de {ciltName}",
      ciltCardListCloseButton: "Cerrar",
      ciltCardListCreateNewSequenceButton: "Crear Nueva Secuencia",
      ciltCardListSearchPlaceholder:
        "Buscar secuencias...",
      ciltCardListTotalSequences: "Total: {count} secuencias",
      ciltCardListNoSequencesAssociated: "No hay secuencias asociadas a este CILT",
      ciltCardListNoSequencesMatchingSearch: "No hay secuencias que coincidan con tu búsqueda",
      ciltCardListSequenceLabel: "Secuencia {order}",
      ciltCardListStandardTimeLabel: "Tiempo Estándar:",
      ciltCardListToolsLabel: "Herramientas Requeridas:",
      ciltCardListCreatedLabel: "Creado:",
      ciltCardListViewDetailsButton: "Ver Detalles",
      ciltCardListViewReferenceOplButton: "Ver OPL de Referencia",
      ciltCardListViewRemediationOplButton: "Ver OPL de Remediación",
      ciltCardListEditSequenceButton: "Editar Secuencia",
      ciltCardListSequenceDetailsModalTitle: "Detalles de la Secuencia",
      ciltCardListPositionLabel: "Posición:",
      ciltCardListCiltTypeLabel: "Tipo de CILT:",
      ciltCardListColorLabel: "Color:",
      ciltCardListRequiredToolsLabel: "Herramientas Requeridas:",
      ciltCardListStoppageReasonLabel: "Razón de Parada:",
      ciltCardListStandardOkLabel: "Estándar OK:",
      ciltCardListQuantityPicturesCreateLabel: "Imágenes para Creación:",
      ciltCardListQuantityPicturesCloseLabel: "Imágenes para Cierre:",
      ciltCardListRelatedOplsTitle: "OPLs Relacionados",
      ciltCardListReferenceOplLabel: "OPL de Referencia:",
      ciltCardListRemediationOplLabel: "OPL de Remediación:",
      ciltCardListViewReferenceOplLinkText: "Ver OPL de Referencia",
      ciltCardListViewRemediationOplLinkText: "Ver OPL de Remediación",
      ciltCardListCreationDateLabel: "Fecha de Creación:",
      ciltCardListLastUpdateLabel: "Última Actualización:",
      ciltCardListYesText: "Sí",
      ciltCardListNoText: "No",
      ciltCardListOplInfoMessage: "Información de OPL",
      ciltCardListNoSequencesMessage: "No hay secuencias asociadas con {ciltName}",
      ciltCardListNoOplAssociatedMessage: "No hay OPL asociado con esta secuencia",
      ciltCardListNoMultimediaMessage: "No hay archivos multimedia disponibles para el OPL: {oplTitle}",
      ciltCardListErrorLoadingSequences: "Error al cargar secuencias",
      ciltCardListErrorReloadingSequences: "Error al recargar secuencias",
      ciltCardListErrorLoadingOplDetails: "Error al cargar detalles del OPL",
      ciltCardListCreateSequence: "Crear Secuencia",
      ciltCardListViewSequences: "Ver Secuencias",
      ciltCardListObjectiveLabel: "Objetivo:",
      ciltCardListMultimediaFilesTitle: "Archivos Multimedia",
      ciltCardListImageLabel: "Imagen",
      ciltCardListVideoLabel: "Video",
      ciltCardListPlayVideoButton: "Reproducir Video",
      ciltCardListPdfLabel: "PDF",
      ciltCardListViewPdfButton: "Ver PDF",
      ciltCardListPdfPreviewModalTitle: "Vista previa de PDF",
      ciltCardListVideoPreviewModalTitle: "Vista previa de video",
      ciltCardListVideoNotSupported: "Su navegador no admite la etiqueta de video.",
      searchBarDefaultPlaceholder: "Buscar...",
      ciltLevelTreeModalCreateSequenceHere: "Crear Secuencia Aquí",
      ciltProceduresSearchPlaceholder: "Buscar...",
      informationDetail: "Información",

      oplSelectionModalTitle: "Seleccionar OPL / SOP",
      oplSelectionModalTitleColumn: "OPL / SOP Nombre",
      oplSelectionModalTypeColumn: "Tipo",
      oplSelectionModalActionsColumn: "Acciones",
      oplSelectionModalSelectButton: "Seleccionar OPL / SOP",
      oplSelectionModalMultimediaButton: "Ver multimedia",
      oplSelectionModalMultimediaTitle: "Multimedia",
      oplSelectionModalNoContent: "No hay contenido",
      oplSelectionModalCreateTitle: "Crear OPL / SOP",
      oplSelectionModalSuccessDetail: "OPL / SOP creado exitosamente",
      oplSelectionModalSuccessDescription: "OPL / SOP creado exitosamente",
      oplSelectionModalErrorDetail: "Error al crear OPL / SOP",
      oplSelectionModalImageTitle: "Imagen",
      oplSelectionModalImageAlt: "Imagen",
      oplSelectionModalSuccessOpl: "OPL / SOP creado exitosamente",
      oplSelectionModalErrorOpl: "Error al crear OPL / SOP",
      oplSearchBarPlaceholder: "Buscar OPL / SOP",
      
      // CILT Table strings
      createSequence: "Crear Secuencia",
      viewSequences: "Ver Secuencias",
      information: "Información",
      
      // CILT Sequences strings
      sequences: "Secuencias",
      sequence: "Secuencia",
      createNewSequence: "Crear Nueva Secuencia",
      searchByDescriptionOrderOrTime: "Buscar por descripción, orden o tiempo",
      noSequencesForCilt: "No hay secuencias asociadas a este CILT.",
      noSequencesMatchSearch: "No hay secuencias que coincidan con tu búsqueda.",
      thisGroup: "Este CILT",
      noSequencesYet: "no cuenta aún con secuencias. Puedes crear una nueva secuencia usando el botón \"Crear Nueva Secuencia\".",
      viewDetails: "Ver Detalles",
      detailsOf: "Detalles de",
      editSequence: "Editar Secuencia",

      // CILT Details and OPL strings
      ciltType: "Tipo de CILT",
      requiredTools: "Herramientas Requeridas",
      stoppageReason: "Razón de Parada",
      standardOk: "Estándar OK",
      quantityPicturesCreate: "Cantidad de Imágenes al Crear",
      quantityPicturesClose: "Cantidad de Imágenes al Cerrar",
      relatedOPLs: "OPLs Relacionados",
      referenceOPL: "OPL de Referencia",
      viewReferenceOPL: "Ver OPL de Referencia",
      remediationOPL: "OPL de Remediación",
      viewRemediationOPL: "Ver OPL de Remediación",
      tools: "Herramientas",
      created: "Creado",
      noOplAssociated: "Esta secuencia no cuenta aún con un OPL asociado.",
      thisOpl: "Este OPL",
      noMediaFiles: "no cuenta aún con archivos multimedia asociados.",
      browserNotSupportVideo: "Su navegador no admite la etiqueta de video.",
      viewReferenceOpl: "Ver OPL de Referencia",
      viewRemediationOpl: "Ver OPL de Remediación",
      cilt: "CILT",
      selectedUsersList: "Usuarios seleccionados:",
      ciltMstrLastUpdated: "Última actualización:",

      
      lastLoginWeb: "Ultimo login web",
      lastLoginApp: "Ultimo login app",
      imageLoadSuccess: "Imagen cargada exitosamente",
      imageLoadError: "Error al cargar imagen",
      warningImageUpload: "Advertencia: la imagen no se cargó correctamente",
      scheduleSequence: "Calendarizar",
      errorNoSiteId: "El id del site es obligatorio",
      clearFilters: "Limpiar filtros",
      confirmCloneCiltMstrMessage: "¿Estas seguro de que quieres clonar el procedimiento CILT?",
      confirmCloneSecuencesMessage: "Todas las secuencias también serán clonadas",
      draft: "Borrador",
      totalUsersCreated: "Total de usuarios creados",
      totalUsersProcessed: "Total de usuarios procesados",
      importUsersSummary: "Resumen de usuarios importados",
      reason: "Razón",
      registered: "Registrado",
      noProceduresFound: "No se encontraron procedimientos",

 
      dayValue: "dia",
      weekValue: "semana",
      monthValue: "mes",
      yearValue: "año",
      repeat: "Repetir",
      repeatEach: "Repetir cada",

      ciltDueDate: "Fecha de vencimiento del CILT",
      ciltDueDatePlaceholder: "Fecha de vencimiento del CILT",
      select: "Seleccionar",
      editUser:"Editar usuario",
      fastPassword: "Password rápido",
      manual: "Manual de usuario",
      downloadUsersTemplate: "Descargar plantilla de usuarios",

      //NEW UPDATE SPANISH
      start: "Iniciar",
      eachPlace: "Tiene lugar cada",
      until: "Hasta",
      quitDate: "Quitar fehca de finalización",
      freqMessage: "El código no puede exceder 3 caracteres",
      referencePoint: "Punto de referencia",
      selectableWithoutProgramming: "Seleccionable sin programación",
      createCiltSequenceModalErrorSelectFrequency: "Por favor selecciona al menos una frecuencia.",
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
