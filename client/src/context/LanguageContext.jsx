import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    shortLabel: 'EN',
    bcp47: 'en-IN',
    flag: '🇬🇧',
    regionTag: 'Default International / Pan-India'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    shortLabel: 'தமிழ்',
    bcp47: 'ta-IN',
    flag: '🇮🇳',
    regionTag: 'Tamil Nadu & Puducherry Coast'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    shortLabel: 'తెలుగు',
    bcp47: 'te-IN',
    flag: '🇮🇳',
    regionTag: 'Andhra Pradesh Coast'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    shortLabel: 'हिन्दी',
    bcp47: 'hi-IN',
    flag: '🇮🇳',
    regionTag: 'NDMA National Command'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    shortLabel: 'বাংলা',
    bcp47: 'bn-IN',
    flag: '🇮🇳',
    regionTag: 'West Bengal & Sundarbans Coast'
  }
];

export const TRANSLATIONS = {
  en: {
    // Landing Page
    landingSubBrand: 'Disaster Operations EOC',
    landingCitizenSosBtn: 'Citizen SOS',
    landingSignUpBtn: 'Sign Up',
    landingSignInBtn: 'Sign In',
    landingStatusPill: 'Active Command Telemetry • Bay of Bengal & Arabian Sea',
    landingHeroTitle: 'Centralized Cyclone Tracking, Impact Prediction & Relief Operations',
    landingHeroSubtitle:
      'A mission-critical Disaster Operations Command System connecting government authorities, tactical rescue forces, shelter managers, and vulnerable citizens in real time.',
    landingCtaCommand: 'Launch Command Center',
    landingCtaVolunteer: 'Sign Up as Volunteer / Responder',
    landingCtaCitizen: 'Public Citizen Emergency Portal',
    landingMetricWind: 'Sustained Wind Speed',
    landingMetricEvacuees: 'Coastal Evacuees',
    landingMetricShelters: 'Active Safe Shelters',
    landingMetricResponse: 'Avg Response Time',
    landingArchTag: 'End-to-End Operational Architecture',
    landingArchTitle: 'Disaster Intelligence Built for Emergency Operations',
    landingRoleTag: 'Role-Based Access Control Architecture',
    landingRoleTitle: '6 Specialized Stakeholder Roles',
    landingRoleSubtitle:
      'Each operational stakeholder is provisioned with tailored emergency workflows and strictly segmented telemetry.',
    // Login & Sign Up Page
    loginBackBtn: '← View Platform Overview & Animations',
    loginTitle: 'CycloneCommand EOC',
    loginSubtitle: 'National Disaster Operations Command & Multi-Agency Response Platform',
    loginTabSignIn: 'Sign In',
    loginTabSignUp: 'Sign Up / Register',
    loginEmailLabel: 'Email Identifier',
    loginPassphraseLabel: 'Passphrase',
    loginSubmitBtn: 'Access Command System',
    loginAuthenticating: 'Authenticating...',
    signupSelectRoleLabel: 'Select Operational Role',
    signupFullNameLabel: 'Full Name',
    signupPhoneLabel: 'Contact Phone',
    signupEmailLabel: 'Email Address',
    signupRealEmailTag: 'Real / Permanent Email Required',
    signupPasswordLabel: 'Password',
    signupConfirmPasswordLabel: 'Confirm Password',
    signupDistrictLabel: 'Assigned / Resident Coastal District',
    signupSkillsLabel: 'Specialized Skills & Capabilities',
    signupSubmitPrefix: 'Complete Registration as',
    signupAlreadyAccount: 'Already have an account?',
    signupSignInHere: 'Sign In here',
    // Header & Global Controls
    opsCenter: 'Cyclone Operations Center',
    liveDataConnected: 'LIVE DATA CONNECTED',
    reconnectGateway: 'RECONNECT GATEWAY',
    lastUpdated: 'Last Updated',
    refresh: 'REFRESH',
    syncing: 'SYNCING...',
    offline: 'OFFLINE',
    gridDown: 'GRID DOWN',
    hideBar: 'Hide Bar',
    voiceSirenBtn: 'Voice Warning',
    stopVoiceBtn: 'Stop Audio',
    // Sidebar Sections & Links
    secDisasterOps: 'DISASTER OPS',
    secResponseSafety: 'RESPONSE & SAFETY',
    secReliefLogistics: 'RELIEF & LOGISTICS',
    secCommunication: 'COMMUNICATION',
    secAnalytics: 'ANALYTICS',
    secAdministration: 'ADMINISTRATION',
    navCommandCenter: 'Command Center',
    navCycloneTracking: 'Cyclone Tracking',
    navImpactAssessment: 'Impact Assessment',
    navEvacuationPlanning: 'Evacuation Planning',
    navSheltersManagement: 'Shelters Management',
    navSafeRegistry: 'Safe Persons Registry',
    navVolunteerTasks: 'Volunteer Task Board',
    navIncidentTriage: 'Incident Triage',
    navResponseTeams: 'Response Teams',
    navReliefInventory: 'Relief & Inventory',
    navEmergencyAlerts: 'Emergency Alerts',
    navCitizenPortal: 'Citizen SOS Portal',
    navLiveTracking: 'Live Rescue Tracking',
    navAnalyticsForecast: 'Analytics & Forecast',
    navOperationalReports: 'Operational Reports',
    navPersonnelApprovals: 'Personnel & Approvals',
    // Citizen Portal & Voice Warning Panel
    portalBadge: '🚨 CITIZEN EMERGENCY PORTAL',
    portalTitle: 'Cyclone Emergency Assistance',
    portalSubtitle: 'Immediate life-safety rescue, real-time localized threat level, and verified shelter navigation.',
    localThreatLabel: 'Your Local Threat:',
    cycloneEyeLabel: 'Cyclone Eye:',
    voicePanelBadge: 'FISHERMEN & ELDERLY AUDIO ACCESSIBILITY',
    voicePanelTitle: 'Regional Multilingual Voice Siren & Evacuation Broadcast',
    voicePanelDesc: 'Automated text-to-speech sirens in local coastal languages that read out landfall timing, sea warnings, and evacuation instructions.',
    playVoiceWarning: '🔊 Play Audio Siren & Evacuation Warning',
    stopVoiceWarning: '⏹️ Stop Audio Broadcast',
    readShelterVoice: '🔊 Read Nearest Shelter & Route',
    sirenIncludeLabel: 'Include Emergency Siren Tone',
    liveVoiceScriptLabel: 'LIVE AUDIO BROADCAST TRANSCRIPT:',
    // Citizen Portal 6 Tabs
    tab1Sos: '1. SEND SOS',
    tab2LiveMap: '2. LIVE RESCUE MAP',
    tab3Shelter: '3. FIND SHELTER',
    tab4Risk: '4. MY RISK',
    tab5Alerts: '5. ALERTS',
    tab6Helplines: '6. HELPLINES',
    // SOS Form
    sosHeaderTitle: 'Emergency SOS Distress Broadcast',
    sosHeaderDesc: 'Directly alerts the central EOC, streams your exact live GPS, and dispatches the nearest Response Team & Volunteer.',
    gpsTrackingEnabled: 'EXACT LIVE GPS LOCATION TRACKING: ENABLED',
    gpsTrackingPaused: 'EXACT LIVE GPS LOCATION TRACKING: PAUSED',
    continuousLiveStream: 'Continuous Live Stream',
    coordinatesLabel: 'Coordinates:',
    fullNameLabel: 'Your Full Name',
    fullNamePlaceholder: 'e.g. Priya Sundaram',
    phoneLabel: 'Contact Phone Number',
    phonePlaceholder: 'e.g. +91 98401 23456',
    emergencyNatureLabel: 'Emergency Nature',
    optTrapped: 'Trapped Civilians (Rising Waters / Roof)',
    optMedical: 'Critical Medical Emergency',
    optFlooding: 'Rapid Ground Flooding',
    optCollapse: 'Building Damage / Wall Collapse',
    optMissing: 'Missing Person',
    optFoodWater: 'Infant Food / Drinking Water Crisis',
    peopleCountLabel: 'Number of People Trapped / Affected',
    locationLandmarkLabel: 'Current Physical Location / Landmark',
    locationPlaceholder: 'e.g. 2nd Street, Near Lighthouse, Marina Beach Lowlands',
    situationDescLabel: 'Situation Description',
    situationPlaceholder: 'Water level height, children/elderly present, roof access, landmarks...',
    submitSosBtn: '🚨 TRANSMIT IMMEDIATE SOS DISTRESS CALL',
    submittingSosBtn: 'TRANSMITTING DISTRESS SIGNAL...',
    // Shelters, Risk, Alerts, Helplines
    sheltersTitle: 'Closest Verified Emergency Shelters',
    sheltersSubtitle: 'Sorted by live geospatial distance from your detected GPS position.',
    navigateShelterBtn: 'Navigate to this Shelter',
    riskTitle: 'Personalized Risk Calculation',
    activeCycloneLabel: 'Active Cyclone:',
    distanceFromEyeLabel: 'Distance from Eye:',
    threatClassLabel: 'Threat Classification:',
    officialDirectiveLabel: 'Official Directive:',
    alertsTitle: 'Official Broadcast Alerts',
    alertsSubtitle: 'Authorized alerts issued by Disaster Operations Center.',
    helplinesTitle: 'Emergency 24/7 Helplines',
    helplinesSubtitle: 'Direct toll-free lines to central control rooms.',
    // Voice Broadcast Script
    voiceWarningNative:
      'Attention coastal residents and fishermen! Red Alert for Severe Cyclone Amara. Sustained wind speed is 175 kilometers per hour. Landfall is expected in 18 hours near North Chennai, Ennore, and the Coromandel coast. All fishermen are strictly advised not to venture into the Bay of Bengal. Residents in low-lying coastal areas must evacuate immediately along National Highway 48 and Highway 38 to the nearest safe cyclone shelter. For immediate life-saving rescue, press the red Send SOS button or call toll-free helpline 1 0 7 0.',
    voiceWarningPhonetic:
      'Attention coastal residents and fishermen! Red Alert for Severe Cyclone Amara. Sustained wind speed is 175 kilometers per hour. Landfall is expected in 18 hours near North Chennai, Ennore, and the Coromandel coast. All fishermen are strictly advised not to venture into the Bay of Bengal. Residents in low-lying coastal areas must evacuate immediately along National Highway 48 and Highway 38 to the nearest safe cyclone shelter. For immediate life-saving rescue, press the red Send SOS button or call toll-free helpline 1 0 7 0.'
  },

  ta: {
    // Landing Page
    landingSubBrand: 'பேரிடர் கட்டுப்பாட்டு மையம்',
    landingCitizenSosBtn: 'மக்கள் SOS',
    landingSignUpBtn: 'பதிவு செய்',
    landingSignInBtn: 'உள்நுழை',
    landingStatusPill: 'நேரடி புயல் கண்காணிப்பு • வங்காள விரிகுடா & அரபிக்கடல்',
    landingHeroTitle: 'மத்திய புயல் கண்காணிப்பு, பாதிப்பு முன்கணிப்பு & மீட்பு தளம்',
    landingHeroSubtitle:
      'அரசு அதிகாரிகள், தேசிய பேரிடர் மீட்புப் படை (NDRF), பாதுகாப்பு முகாம் நிர்வாகிகள் மற்றும் கடலோர மக்களை நிகழ்நேரத்தில் இணைக்கும் ஒருங்கிணைந்த கட்டுப்பாட்டு தளம்.',
    landingCtaCommand: 'கட்டுப்பாட்டு மையத்தைத் திற',
    landingCtaVolunteer: 'தன்னார்வலர் / மீட்புப் படையாக இணையுங்கள்',
    landingCtaCitizen: 'மக்கள் அவசர உதவி மையம் (SOS)',
    landingMetricWind: 'காற்றின் வேகம்',
    landingMetricEvacuees: 'மீட்கப்பட்ட மக்கள்',
    landingMetricShelters: 'பாதுகாப்பு முகாம்கள்',
    landingMetricResponse: 'சராசரி மீட்பு நேரம்',
    landingArchTag: 'முழுமையான பேரிடர் செயல்பாட்டு கட்டமைப்பு',
    landingArchTitle: 'அவசர கால மீட்புப் பணிகளுக்கான நவீன தொழில்நுட்பம்',
    landingRoleTag: 'பங்கு அடிப்படையிலான அணுகல் கட்டுப்பாடு',
    landingRoleTitle: '6 சிறப்பு செயல்பாட்டுப் பிரிவுகள்',
    landingRoleSubtitle:
      'ஒவ்வொரு பிரிவினருக்கும் பிரத்யேக அவசர கால பணித்தளங்கள் மற்றும் நேரடி தகவல் பலகைகள்.',
    // Login & Sign Up Page
    loginBackBtn: '← முகப்புப் பக்கத்திற்குத் திரும்பு',
    loginTitle: 'சைக்ளோன் கமாண்ட் (EOC)',
    loginSubtitle: 'தேசிய பேரிடர் கட்டுப்பாட்டு மற்றும் பன்முக மீட்பு தளம்',
    loginTabSignIn: 'உள்நுழை (Sign In)',
    loginTabSignUp: 'புதிய கணக்கு பதிவு (Register)',
    loginEmailLabel: 'மின்னஞ்சல் முகவரி (Email)',
    loginPassphraseLabel: 'கடவுச்சொல் (Password)',
    loginSubmitBtn: 'கட்டுப்பாட்டு தளத்தில் உள்நுழை',
    loginAuthenticating: 'சரிபார்க்கப்படுகிறது...',
    signupSelectRoleLabel: 'உங்கள் செயல்பாட்டுப் பங்கைத் தேர்ந்தெடுக்கவும்',
    signupFullNameLabel: 'முழு பெயர்',
    signupPhoneLabel: 'தொலைபேசி எண்',
    signupEmailLabel: 'மின்னஞ்சல் முகவரி',
    signupRealEmailTag: 'நிரந்தர மின்னஞ்சல் அவசியம்',
    signupPasswordLabel: 'கடவுச்சொல்',
    signupConfirmPasswordLabel: 'கடவுச்சொல் உறுதிப்படுத்தல்',
    signupDistrictLabel: 'கடலோர மாவட்டம்',
    signupSkillsLabel: 'சிறப்பு மீட்புத் திறன்கள்',
    signupSubmitPrefix: 'பதிவை நிறைவு செய்:',
    signupAlreadyAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    signupSignInHere: 'இங்கே உள்நுழையவும்',
    // Header & Global Controls
    opsCenter: 'புயல் கட்டுப்பாட்டு மையம்',
    liveDataConnected: 'நேரடி தகவல் இணைப்பு',
    reconnectGateway: 'மீண்டும் இணைக்கவும்',
    lastUpdated: 'கடைசி புதுப்பிப்பு',
    refresh: 'புதுப்பி',
    syncing: 'இணைக்கிறது...',
    offline: 'ஆஃப்லைன்',
    gridDown: 'நெட்வொர்க் இல்லை',
    hideBar: 'மறை',
    voiceSirenBtn: 'குரல் எச்சரிக்கை',
    stopVoiceBtn: 'நிறுத்து',
    // Sidebar Sections & Links
    secDisasterOps: 'பேரிடர் செயல்பாடுகள்',
    secResponseSafety: 'மீட்பு & பாதுகாப்பு',
    secReliefLogistics: 'நிவாரணம் & தளவாடங்கள்',
    secCommunication: 'தகவல் தொடர்பு',
    secAnalytics: 'பகுப்பாய்வு',
    secAdministration: 'நிர்வாகம்',
    navCommandCenter: 'கட்டுப்பாட்டு மையம்',
    navCycloneTracking: 'புயல் கண்காணிப்பு',
    navImpactAssessment: 'பாதிப்பு மதிப்பீடு',
    navEvacuationPlanning: 'வெளியேற்றத் திட்டமிடல்',
    navSheltersManagement: 'பாதுகாப்பு முகாம்கள்',
    navSafeRegistry: 'பாதுகாப்பானோர் பதிவேடு',
    navVolunteerTasks: 'தன்னார்வலர் பணிகள்',
    navIncidentTriage: 'அவசர சம்பவ வரிசை',
    navResponseTeams: 'மீட்புப் படைகள்',
    navReliefInventory: 'நிவாரணப் பொருட்கள்',
    navEmergencyAlerts: 'அவசர எச்சரிக்கைகள்',
    navCitizenPortal: 'மக்கள் அவசர உதவி (SOS)',
    navLiveTracking: 'நேரடி மீட்பு கண்காணிப்பு',
    navAnalyticsForecast: 'முன்கணிப்பு பகுப்பாய்வு',
    navOperationalReports: 'செயல்பாட்டு அறிக்கைகள்',
    navPersonnelApprovals: 'அதிகாரிகள் ஒப்புதல்',
    // Citizen Portal & Voice Warning Panel
    portalBadge: '🚨 மக்கள் அவசர புயல் உதவி மையம்',
    portalTitle: 'புயல் அவசர மீட்பு மற்றும் பாதுகாப்பு உதவி',
    portalSubtitle: 'உடனடி உயிர் காக்கும் மீட்பு, நேரடி புயல் அபாய நிலை மற்றும் அருகிலுள்ள பாதுகாப்பு முகாம் வழிகாட்டி.',
    localThreatLabel: 'உங்கள் பகுதி அபாய நிலை:',
    cycloneEyeLabel: 'புயல் மைய தூரம்:',
    voicePanelBadge: 'மீனவர்கள் மற்றும் முதியோருக்கான குரல் உதவி',
    voicePanelTitle: 'பன்மொழி குரல் சைரன் மற்றும் வெளியேற்ற அறிவிப்பு',
    voicePanelDesc: 'புயல் கரையை கடக்கும் நேரம், கடல் சீற்றம் மற்றும் பாதுகாப்பாக வெளியேறும் வழிமுறைகளை தமிழில் ஒலிக்கும் தானியங்கி குரல் எச்சரிக்கை.',
    playVoiceWarning: '🔊 குரல் சைரன் எச்சரிக்கையை ஒலிக்கச் செய் (தமிழ்)',
    stopVoiceWarning: '⏹️ குரல் அறிவிப்பை நிறுத்து',
    readShelterVoice: '🔊 அருகிலுள்ள முகாம் விவரத்தை வாசி',
    sirenIncludeLabel: 'அவசர சைரன் ஒலியுடன் இயக்கு',
    liveVoiceScriptLabel: 'நேரடி குரல் எச்சரிக்கை செய்தி (தமிழ்):',
    // Citizen Portal 6 Tabs
    tab1Sos: '1. அவசர உதவி (SOS)',
    tab2LiveMap: '2. நேரடி மீட்பு வரைபடம்',
    tab3Shelter: '3. பாதுகாப்பு முகாம்',
    tab4Risk: '4. எனது அபாய நிலை',
    tab5Alerts: '5. எச்சரிக்கைகள்',
    tab6Helplines: '6. உதவி எண்கள்',
    // SOS Form
    sosHeaderTitle: 'அவசர உயிர் காக்கும் உதவி அழைப்பு (SOS)',
    sosHeaderDesc: 'கட்டுப்பாட்டு மையத்திற்கு உங்கள் நேரடி ஜி.பி.எஸ் (GPS) இருப்பிடத்தை அனுப்பி உடனடியாக மீட்புப் படையை வரவழைக்கிறது.',
    gpsTrackingEnabled: 'நேரடி ஜி.பி.எஸ் (GPS) இருப்பிட கண்காணிப்பு: செயலில் உள்ளது',
    gpsTrackingPaused: 'நேரடி ஜி.பி.எஸ் (GPS) இருப்பிட கண்காணிப்பு: நிறுத்தப்பட்டுள்ளது',
    continuousLiveStream: 'தொடர் நேரடி இருப்பிட பகிர்வு',
    coordinatesLabel: 'இருப்பிட எண்:',
    fullNameLabel: 'உங்கள் முழு பெயர்',
    fullNamePlaceholder: 'எ.கா. பிரியா சுந்தரம்',
    phoneLabel: 'தொடர்பு தொலைபேசி எண்',
    phonePlaceholder: 'எ.கா. +91 98401 23456',
    emergencyNatureLabel: 'அவசர நிலையின் வகை',
    optTrapped: 'வெள்ளத்தில் சிக்கியவர்கள் (வீட்டு மாடி / வெள்ளம்)',
    optMedical: 'அவசர மருத்துவ உதவி',
    optFlooding: 'கடுமையான வெள்ளப்பெருக்கு',
    optCollapse: 'கட்டிடம் / சுவர் இடிபாடு அபாயம்',
    optMissing: 'காணாமல் போனவர்கள்',
    optFoodWater: 'குழந்தை உணவு / குடிநீர் தட்டுப்பாடு',
    peopleCountLabel: 'பாதிக்கப்பட்ட / சிக்கியுள்ள நபர்களின் எண்ணிக்கை',
    locationLandmarkLabel: 'தற்போதைய இடம் / அடையாளம்',
    locationPlaceholder: 'எ.கா. கலங்கரை விளக்கம் அருகில், மெரினா கடற்கரை',
    situationDescLabel: 'நிலைமை விவரம்',
    situationPlaceholder: 'நீர் மட்டம், முதியோர் / குழந்தைகள் விவரம், மாடி வழி...',
    submitSosBtn: '🚨 உடனடி அவசர மீட்பு அழைப்பை (SOS) அனுப்பு',
    submittingSosBtn: 'அவசர அழைப்பு அனுப்பப்படுகிறது...',
    // Shelters, Risk, Alerts, Helplines
    sheltersTitle: 'அருகிலுள்ள அரசு புயல் பாதுகாப்பு முகாம்கள்',
    sheltersSubtitle: 'உங்கள் ஜி.பி.எஸ் இருப்பிடத்திலிருந்து மிக அருகில் உள்ள முகாம்கள்.',
    navigateShelterBtn: 'இந்த முகாமிற்கு வழிகாட்டு',
    riskTitle: 'உங்கள் பகுதி புயல் அபாயக் கணக்கீடு',
    activeCycloneLabel: 'தற்போதைய புயல்:',
    distanceFromEyeLabel: 'புயல் கண்ணிலிருந்து தூரம்:',
    threatClassLabel: 'அபாய வகைப்பாடு:',
    officialDirectiveLabel: 'அரசு பாதுகாப்பு உத்தரவு:',
    alertsTitle: 'அதிகாரப்பூர்வ புயல் எச்சரிக்கைகள்',
    alertsSubtitle: 'பேரிடர் கட்டுப்பாட்டு மையம் வெளியிட்ட நேரடி அறிவிப்புகள்.',
    helplinesTitle: '24 மணி நேர அவசர உதவி எண்கள்',
    helplinesSubtitle: 'கட்டணமில்லா அவசர கட்டுப்பாட்டு அறை எண்கள்.',
    // Voice Broadcast Script
    voiceWarningNative:
      'கடலோர மக்களுக்கும் மீனவர்களுக்கும் முக்கிய அவசர எச்சரிக்கை! தீவிர அமாரா புயல் மணிக்கு 175 கிலோமீட்டர் வேகத்தில் நெருங்கி வருகிறது. அடுத்த 18 மணி நேரத்தில் வட சென்னை மற்றும் எண்ணூர் கடற்கரை அருகே புயல் கரையை கடக்கும். மீனவர்கள் யாரும் வங்கக்கடலுக்குள் மீன்பிடிக்கச் செல்ல வேண்டாம். தாழ்வான பகுதிகளில் வசிக்கும் மக்கள் உடனடியாக தேசிய நெடுஞ்சாலை 48 மற்றும் 38 வழியாக அருகிலுள்ள அரசு புயல் பாதுகாப்பு முகாம்களுக்குச் செல்லவும். அவசர மீட்பு உதவிக்கு சிவப்பு நிற எஸ்.ஓ.எஸ் பட்டனை அழுத்தவும் அல்லது 1 0 7 0 என்ற எண்ணை அழைக்கவும்.',
    voiceWarningPhonetic:
      'Kadalora makkalukkum meenavargalukkum mukkiya avasara echarikkai! Theevira Amara puyal manikku 175 kilometer vegathil nerungi varugirathu. Adutha 18 mani nerathil Vada Chennai matrum Ennore kadarkarai arugey puyal karaiyai kadakkum. Meenavargal yaarum kadalukkul sella vendaam. Thazhvana paguthigalil vasikkum makkal udanadiyaga arukilulla arasu puyalugappu mugamgalukku sellavum. Avasara udhavikku 1 0 7 0 enra ennai azhaikkavum.'
  },

  te: {
    // Landing Page
    landingSubBrand: 'విపత్తు కార్యకలాపాల కేంద్రం (EOC)',
    landingCitizenSosBtn: 'పౌర SOS',
    landingSignUpBtn: 'రిజిస్టర్',
    landingSignInBtn: 'సైన్ ఇన్',
    landingStatusPill: 'ప్రత్యక్ష తుఫాను టెలిమెట్రీ • బంగాళాఖాతం & అరేబియా సముద్రం',
    landingHeroTitle: 'కేంద్రీకృత తుఫాను ట్రాకింగ్, ప్రభావ అంచనా & సహాయ కార్యకలాపాలు',
    landingHeroSubtitle:
      'ప్రభుత్వ అధికారులు, NDRF రెస్క్యూ బలగాలు, పునరావాస కేంద్రాల నిర్వాహకులు మరియు తీరప్రాంత ప్రజలను రియల్-టైమ్‌లో అనుసంధానించే కమాండ్ సిస్టమ్.',
    landingCtaCommand: 'కమాండ్ సెంటర్ ప్రారంభించండి',
    landingCtaVolunteer: 'వాలంటీర్ / రెస్పాండర్‌గా చేరండి',
    landingCtaCitizen: 'పౌర అత్యవసర సహాయ పోర్టల్ (SOS)',
    landingMetricWind: 'గాలి వేగం',
    landingMetricEvacuees: 'తరలించిన ప్రజలు',
    landingMetricShelters: 'సురక్షిత షెల్టర్లు',
    landingMetricResponse: 'సగటు ప్రతిస్పందన సమయం',
    landingArchTag: 'సమగ్ర విపత్తు నిర్వహణ నిర్మాణం',
    landingArchTitle: 'అత్యవసర కార్యకలాపాల కోసం ఆధునిక విపత్తు మేధస్సు',
    landingRoleTag: 'రోల్-బేస్డ్ యాక్సెస్ కంట్రోల్',
    landingRoleTitle: '6 ప్రత్యేక భాగస్వామ్య పాత్రలు',
    landingRoleSubtitle:
      'ప్రతి విభాగానికి ప్రత్యేక అత్యవసర వర్క్‌ఫ్లోలు మరియు ప్రత్యక్ష సమాచార వ్యవస్థ.',
    // Login & Sign Up Page
    loginBackBtn: '← హోమ్ పేజీకి తిరిగి వెళ్ళండి',
    loginTitle: 'సైక్లోన్ కమాండ్ (EOC)',
    loginSubtitle: 'జాతీయ విపత్తు నిర్వహణ & బహుళ-ఏజెన్సీ రెస్క్యూ ప్లాట్‌ఫారమ్',
    loginTabSignIn: 'సైన్ ఇన్ (Sign In)',
    loginTabSignUp: 'సైన్ అప్ / రిజిస్టర్',
    loginEmailLabel: 'ఇమెయిల్ చిరునామా',
    loginPassphraseLabel: 'పాస్‌వర్డ్',
    loginSubmitBtn: 'కమాండ్ సిస్టమ్‌లోకి ప్రవేశించండి',
    loginAuthenticating: 'ధృవీకరించబడుతోంది...',
    signupSelectRoleLabel: 'మీ కార్యాచరణ పాత్రను ఎంచుకోండి',
    signupFullNameLabel: 'పూర్తి పేరు',
    signupPhoneLabel: 'ఫోన్ నంబర్',
    signupEmailLabel: 'ఇమెయిల్ చిరునామా',
    signupRealEmailTag: 'శాశ్వత ఇమెయిల్ అవసరం',
    signupPasswordLabel: 'పాస్‌వర్డ్',
    signupConfirmPasswordLabel: 'పాస్‌వర్డ్ నిర్ధారించండి',
    signupDistrictLabel: 'తీరప్రాంత జిల్లా',
    signupSkillsLabel: 'ప్రత్యేక రెస్క్యూ నైపుణ్యాలు',
    signupSubmitPrefix: 'రిజిస్ట్రేషన్ పూర్తి చేయండి:',
    signupAlreadyAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    signupSignInHere: 'ఇక్కడ సైన్ ఇన్ చేయండి',
    // Header & Global Controls
    opsCenter: 'తుఫాను కార్యకలాపాల కేంద్రం',
    liveDataConnected: 'లైవ్ డేటా కనెక్ట్ చేయబడింది',
    reconnectGateway: 'తిరిగి కనెక్ట్ చేయండి',
    lastUpdated: 'చివరిగా నవీకరించబడింది',
    refresh: 'రిఫ్రెష్',
    syncing: 'సింక్ అవుతోంది...',
    offline: 'ఆఫ్‌లైన్',
    gridDown: 'నెట్‌వర్క్ లేదు',
    hideBar: 'దాచు',
    voiceSirenBtn: 'వాయిస్ హెచ్చరిక',
    stopVoiceBtn: 'ఆపు',
    // Sidebar Sections & Links
    secDisasterOps: 'విపత్తు కార్యకలాపాలు',
    secResponseSafety: 'రక్షణ & భద్రత',
    secReliefLogistics: 'సహాయం & రవాణా',
    secCommunication: 'కమ్యూనికేషన్',
    secAnalytics: 'విశ్లేషణలు',
    secAdministration: 'పరిపాలన',
    navCommandCenter: 'కమాండ్ సెంటర్',
    navCycloneTracking: 'తుఫాను ట్రాకింగ్',
    navImpactAssessment: 'ప్రభావ అంచనా',
    navEvacuationPlanning: 'తరలింపు ప్రణాళిక',
    navSheltersManagement: 'పునరావాస కేంద్రాలు',
    navSafeRegistry: 'సురక్షిత వ్యక్తుల నమోదు',
    navVolunteerTasks: 'వాలంటీర్ కార్యాచరణ',
    navIncidentTriage: 'అత్యవసర సంఘటనలు',
    navResponseTeams: 'రెస్క్యూ బృందాలు',
    navReliefInventory: 'సహాయ సామగ్రి నిల్వలు',
    navEmergencyAlerts: 'అత్యవసర హెచ్చరికలు',
    navCitizenPortal: 'పౌర అత్యవసర పోర్టల్ (SOS)',
    navLiveTracking: 'లైవ్ రెస్క్యూ ట్రాకింగ్',
    navAnalyticsForecast: 'విశ్లేషణ & అంచనా',
    navOperationalReports: 'కార్యకలాప నివేదికలు',
    navPersonnelApprovals: 'సిబ్బంది ఆమోదాలు',
    // Citizen Portal & Voice Warning Panel
    portalBadge: '🚨 పౌర అత్యవసర తుఫాను సహాయ పోర్టల్',
    portalTitle: 'తుఫాను అత్యవసర రక్షణ సహాయం',
    portalSubtitle: 'తక్షణ ప్రాణ రక్షణ, ప్రత్యక్ష ప్రమాద స్థాయి మరియు సురక్షిత పునరావాస కేంద్రాల మార్గదర్శి.',
    localThreatLabel: 'మీ ప్రాంత ప్రమాద స్థాయి:',
    cycloneEyeLabel: 'తుఫాను కేంద్రం దూరం:',
    voicePanelBadge: 'మత్స్యకారులు & వృద్ధుల కోసం వాయిస్ సహాయం',
    voicePanelTitle: 'ప్రాంతీయ భాషా వాయిస్ సైరన్ & తరలింపు ప్రకటన',
    voicePanelDesc: 'తుఫాను తీరం దాటే సమయం, సముద్ర హెచ్చరికలు మరియు సురక్షిత తరలింపు సూచనలను తెలుగులో చదివి వినిపించే ఆటోమేటెడ్ వాయిస్ సైరన్.',
    playVoiceWarning: '🔊 వాయిస్ సైరన్ హెచ్చరికను ప్లే చేయండి (తెలుగు)',
    stopVoiceWarning: '⏹️ వాయిస్ ప్రసారాన్ని ఆపండి',
    readShelterVoice: '🔊 సమీప షెల్టర్ వివరాలను వినండి',
    sirenIncludeLabel: 'అత్యవసర సైరన్ ధ్వనితో ప్లే చేయండి',
    liveVoiceScriptLabel: 'ప్రత్యక్ష వాయిస్ హెచ్చరిక సందేశం (తెలుగు):',
    // Citizen Portal 6 Tabs
    tab1Sos: '1. SOS పంపండి',
    tab2LiveMap: '2. లైవ్ రెస్క్యూ మ్యాప్',
    tab3Shelter: '3. షెల్టర్ వెతకండి',
    tab4Risk: '4. నా ప్రమాద స్థాయి',
    tab5Alerts: '5. హెచ్చరికలు',
    tab6Helplines: '6. హెల్ప్‌లైన్లు',
    // SOS Form
    sosHeaderTitle: 'అత్యవసర SOS రక్షణ సహాయ ప్రసారం',
    sosHeaderDesc: 'ప్రధాన కంట్రోల్ రూమ్‌కు మీ ప్రత్యక్ష GPS లొకేషన్‌ను పంపి, తక్షణమే NDRF రెస్క్యూ బృందాన్ని పంపిస్తుంది.',
    gpsTrackingEnabled: 'ప్రత్యక్ష GPS లొకేషన్ ట్రాకింగ్: ఆన్‌లో ఉంది',
    gpsTrackingPaused: 'ప్రత్యక్ష GPS లొకేషన్ ట్రాకింగ్: నిలిపివేయబడింది',
    continuousLiveStream: 'నిరంతర లైవ్ GPS స్ట్రీమ్',
    coordinatesLabel: 'GPS కోఆర్డినేట్లు:',
    fullNameLabel: 'మీ పూర్తి పేరు',
    fullNamePlaceholder: 'ఉదా. ప్రియా సుందరం',
    phoneLabel: 'ఫోన్ నంబర్',
    phonePlaceholder: 'ఉదా. +91 98401 23456',
    emergencyNatureLabel: 'అత్యవసర పరిస్థితి రకం',
    optTrapped: 'వరదలో చిక్కుకున్న ప్రజలు (ఇంటి పైకప్పు / వరద)',
    optMedical: 'అత్యవసర వైద్య సహాయం',
    optFlooding: 'తీవ్రమైన వరద ముంపు',
    optCollapse: 'భవనం / గోడ కూలిపోయే ప్రమాదం',
    optMissing: 'గల్లంతైన వ్యక్తులు',
    optFoodWater: 'పిల్లల ఆహారం / తాగునీటి కొరత',
    peopleCountLabel: 'చిక్కుకున్న / ప్రభావిత వ్యక్తుల సంఖ్య',
    locationLandmarkLabel: 'ప్రస్తుత చిరునామా / ల్యాండ్‌మార్క్',
    locationPlaceholder: 'ఉదా. లైట్‌హౌస్ దగ్గర, మెరీనా బీచ్ లోతట్టు ప్రాంతం',
    situationDescLabel: 'పరిస్థితి వివరణ',
    situationPlaceholder: 'నీటి మట్టం, వృద్ధులు/పిల్లల వివరాలు, ఇంటి పైకప్పు మార్గం...',
    submitSosBtn: '🚨 తక్షణ SOS రక్షణ కాల్ పంపండి',
    submittingSosBtn: 'SOS సంకేతం పంపబడుతోంది...',
    // Shelters, Risk, Alerts, Helplines
    sheltersTitle: 'సమీప ధృవీకరించబడిన తుఫాను పునరావాస కేంద్రాలు',
    sheltersSubtitle: 'మీ GPS స్థానం నుండి దూరం ఆధారంగా వరుసక్రమంలో.',
    navigateShelterBtn: 'ఈ షెల్టర్‌కు నావిగేట్ చేయండి',
    riskTitle: 'వ్యక్తిగత ప్రమాద స్థాయి విశ్లేషణ',
    activeCycloneLabel: 'ప్రస్తుత తుఫాను:',
    distanceFromEyeLabel: 'తుఫాను కేంద్రం నుండి దూరం:',
    threatClassLabel: 'ప్రమాద వర్గీకరణ:',
    officialDirectiveLabel: 'అధికారిక భద్రతా ఆదేశం:',
    alertsTitle: 'అధికారిక అత్యవసర హెచ్చరికలు',
    alertsSubtitle: 'విపత్తు నిర్వహణ కేంద్రం జారీ చేసిన హెచ్చరికలు.',
    helplinesTitle: '24/7 అత్యవసర హెల్ప్‌లైన్ నంబర్లు',
    helplinesSubtitle: 'టోల్-ఫ్రీ కంట్రోల్ రూమ్ నంబర్లు.',
    // Voice Broadcast Script
    voiceWarningNative:
      'తీరప్రాంత ప్రజలకు మరియు మత్స్యకారులకు అత్యవసర హెచ్చరిక! తీవ్రమైన అమారా తుఫాను గంటకు 175 కిలోమీటర్ల వేగంతో తీరం వైపు దూసుకొస్తోంది. రాగల 18 గంటల్లో ఉత్తర చెన్నై మరియు ఎన్నోర్ తీరం వద్ద తుఫాను తీరం దాటనుంది. మత్స్యకారులు ఎవరూ బంగాళాఖాతంలో వేటకు వెళ్లరాదు. లోతట్టు తీరప్రాంత ప్రజలు తక్షణమే జాతీయ రహదారి 48 మరియు 38 ద్వారా సమీప సురక్షిత పునరావాస కేంద్రాలకు తరలి వెళ్లాలి. తక్షణ సహాయం కోసం ఎరుపు రంగు ఎస్.ఓ.ఎస్ బటన్ నొక్కండి లేదా 1 0 7 0 నంబర్‌కు కాల్ చేయండి.',
    voiceWarningPhonetic:
      'Teeraprantha prajalaku mariyu matsyakarulaku atyavasara hecharika! Teevramaina Amara tuphanu gantaku 175 kilometerla vegamtho teeram vaipu doosukostondi. Ragala 18 gantallo Uttara Chennai mariyu Ennore teeram vadda tuphanu teeram datanundi. Matsyakarulu evaru samudram loki vellaraadu. Lothattu prajalu takshaname sameepa surakshita punaravasa kendralaku vellali. Sahayam kosam 1 0 7 0 ku call cheyandi.'
  },

  hi: {
    // Landing Page
    landingSubBrand: 'आपदा संचालन केंद्र (EOC)',
    landingCitizenSosBtn: 'नागरिक SOS',
    landingSignUpBtn: 'पंजीकरण (Sign Up)',
    landingSignInBtn: 'लॉग इन (Sign In)',
    landingStatusPill: 'सक्रिय कमांड टेलीमेट्री • बंगाल की खाड़ी और अरब सागर',
    landingHeroTitle: 'केंद्रीकृत चक्रवात ट्रैकिंग, प्रभाव पूर्वानुमान और राहत संचालन',
    landingHeroSubtitle:
      'सरकारी अधिकारियों, एनडीआरएफ (NDRF) बचाव बलों, आश्रय प्रबंधकों और तटीय नागरिकों को वास्तविक समय में जोड़ने वाला आपदा कमांड सिस्टम।',
    landingCtaCommand: 'कमांड सेंटर खोलें',
    landingCtaVolunteer: 'स्वयंसेवक / बचावकर्मी के रूप में जुड़ें',
    landingCtaCitizen: 'नागरिक आपातकालीन सहायता पोर्टल',
    landingMetricWind: 'अधिकतम पवन गति',
    landingMetricEvacuees: 'सुरक्षित निकाले गए नागरिक',
    landingMetricShelters: 'सक्रिय सुरक्षित आश्रय गृह',
    landingMetricResponse: 'औसत बचाव प्रतिक्रिया समय',
    landingArchTag: 'संपूर्ण आपदा संचालन वास्तुकला',
    landingArchTitle: 'आपातकालीन अभियानों के लिए निर्मित आपदा बुद्धिमत्ता',
    landingRoleTag: 'भूमिका-आधारित पहुंच नियंत्रण (RBAC)',
    landingRoleTitle: '6 विशेष परिचालन भूमिकाएं',
    landingRoleSubtitle:
      'प्रत्येक हितधारक को समर्पित आपातकालीन वर्कफ़्लो और सुरक्षित टेलीमेट्री प्रदान की जाती है।',
    // Login & Sign Up Page
    loginBackBtn: '← मुख्य पृष्ठ पर वापस जाएं',
    loginTitle: 'साइक्लोन कमांड (EOC)',
    loginSubtitle: 'राष्ट्रीय आपदा संचालन कमांड और बहु-एजेंसी प्रतिक्रिया मंच',
    loginTabSignIn: 'लॉग इन (Sign In)',
    loginTabSignUp: 'पंजीकरण करें (Register)',
    loginEmailLabel: 'ईमेल आईडी',
    loginPassphraseLabel: 'पासवर्ड',
    loginSubmitBtn: 'कमांड सिस्टम में प्रवेश करें',
    loginAuthenticating: 'सत्यापित किया जा रहा है...',
    signupSelectRoleLabel: 'अपनी परिचालन भूमिका चुनें',
    signupFullNameLabel: 'पूरा नाम',
    signupPhoneLabel: 'संपर्क फ़ोन नंबर',
    signupEmailLabel: 'ईमेल पता',
    signupRealEmailTag: 'स्थायी ईमेल आवश्यक',
    signupPasswordLabel: 'पासवर्ड',
    signupConfirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
    signupDistrictLabel: 'तटीय जिला',
    signupSkillsLabel: 'विशेष बचाव कौशल और क्षमताएं',
    signupSubmitPrefix: 'पंजीकरण पूरा करें:',
    signupAlreadyAccount: 'क्या आपका पहले से खाता है?',
    signupSignInHere: 'यहाँ लॉग इन करें',
    // Header & Global Controls
    opsCenter: 'चक्रवात संचालन केंद्र',
    liveDataConnected: 'लाइव डेटा कनेक्टेड',
    reconnectGateway: 'पुनः कनेक्ट करें',
    lastUpdated: 'अंतिम अपडेट',
    refresh: 'रिफ्रेश',
    syncing: 'सिंक हो रहा है...',
    offline: 'ऑफ़लाइन',
    gridDown: 'नेटवर्क बंद',
    hideBar: 'छुपाएं',
    voiceSirenBtn: 'वॉइस चेतावनी',
    stopVoiceBtn: 'रोकें',
    // Sidebar Sections & Links
    secDisasterOps: 'आपदा संचालन',
    secResponseSafety: 'बचाव और सुरक्षा',
    secReliefLogistics: 'राहत और रसद',
    secCommunication: 'संचार एवं अलर्ट',
    secAnalytics: 'विश्लेषण',
    secAdministration: 'प्रशासन',
    navCommandCenter: 'कमांड सेंटर',
    navCycloneTracking: 'चक्रवात ट्रैकिंग',
    navImpactAssessment: 'प्रभाव मूल्यांकन',
    navEvacuationPlanning: 'निकासी योजना',
    navSheltersManagement: 'आश्रय गृह प्रबंधन',
    navSafeRegistry: 'सुरक्षित व्यक्ति रजिस्ट्री',
    navVolunteerTasks: 'स्वयंसेवक कार्य बोर्ड',
    navIncidentTriage: 'आपदा घटना प्राथमिकता',
    navResponseTeams: 'बचाव दल (NDRF)',
    navReliefInventory: 'राहत सामग्री भंडार',
    navEmergencyAlerts: 'आपातकालीन अलर्ट',
    navCitizenPortal: 'नागरिक एसओएस (SOS) पोर्टल',
    navLiveTracking: 'लाइव बचाव ट्रैकिंग',
    navAnalyticsForecast: 'विश्लेषण और पूर्वानुमान',
    navOperationalReports: 'संचालन रिपोर्ट',
    navPersonnelApprovals: 'कार्मिक और अनुमोदन',
    // Citizen Portal & Voice Warning Panel
    portalBadge: '🚨 नागरिक आपातकालीन सहायता पोर्टल',
    portalTitle: 'चक्रवात आपातकालीन बचाव सहायता',
    portalSubtitle: 'तत्काल जीवन-रक्षा बचाव, लाइव क्षेत्रीय खतरे का स्तर और सुरक्षित आश्रय गृह नेविगेशन।',
    localThreatLabel: 'आपका क्षेत्रीय खतरा:',
    cycloneEyeLabel: 'चक्रवात केंद्र से दूरी:',
    voicePanelBadge: 'मछुआरों और बुजुर्ग नागरिकों के लिए ऑडियो सुविधा',
    voicePanelTitle: 'बहुभाषी वॉइस सायरन और निकासी चेतावनी प्रसारण',
    voicePanelDesc: 'चक्रवात के तट से टकराने का समय, समुद्री चेतावनी और सुरक्षित निकासी निर्देशों को स्थानीय भाषा में सुनाने वाला स्वचालित ऑडियो सायरन।',
    playVoiceWarning: '🔊 वॉइस सायरन और निकासी चेतावनी सुनें (हिन्दी)',
    stopVoiceWarning: '⏹️ ऑडियो प्रसारण रोकें',
    readShelterVoice: '🔊 निकटतम आश्रय गृह की जानकारी सुनें',
    sirenIncludeLabel: 'आपातकालीन सायरन ध्वनि शामिल करें',
    liveVoiceScriptLabel: 'लाइव ऑडियो चेतावनी संदेश (हिन्दी):',
    // Citizen Portal 6 Tabs
    tab1Sos: '1. एसओएस (SOS) भेजें',
    tab2LiveMap: '2. लाइव बचाव मानचित्र',
    tab3Shelter: '3. आश्रय गृह खोजें',
    tab4Risk: '4. मेरा जोखिम स्तर',
    tab5Alerts: '5. सरकारी अलर्ट',
    tab6Helplines: '6. हेल्पलाइन नंबर',
    // SOS Form
    sosHeaderTitle: 'आपातकालीन एसओएस (SOS) संकट प्रसारण',
    sosHeaderDesc: 'केंद्रीय नियंत्रण कक्ष को आपकी सटीक लाइव जीपीएस लोकेशन भेजता है और तुरंत एनडीआरएफ बचाव दल को रवाना करता है।',
    gpsTrackingEnabled: 'सटीक लाइव जीपीएस (GPS) लोकेशन ट्रैकिंग: चालू है',
    gpsTrackingPaused: 'सटीक लाइव जीपीएस (GPS) लोकेशन ट्रैकिंग: रुकी हुई है',
    continuousLiveStream: 'लगातार लाइव स्ट्रीम',
    coordinatesLabel: 'जीपीएस निर्देशांक:',
    fullNameLabel: 'आपका पूरा नाम',
    fullNamePlaceholder: 'उदा. प्रिया सुंदरम',
    phoneLabel: 'संपर्क फ़ोन नंबर',
    phonePlaceholder: 'उदा. +91 98401 23456',
    emergencyNatureLabel: 'आपातकालीन स्थिति का प्रकार',
    optTrapped: 'बाढ़ में फंसे नागरिक (छत / बढ़ता पानी)',
    optMedical: 'गंभीर चिकित्सा आपातकाल',
    optFlooding: 'तेज़ ज़मीनी जलभराव',
    optCollapse: 'इमारत / दीवार गिरने का खतरा',
    optMissing: 'लापता व्यक्ति',
    optFoodWater: 'शिशु आहार / पेयजल संकट',
    peopleCountLabel: 'फंसे / प्रभावित लोगों की संख्या',
    locationLandmarkLabel: 'वर्तमान स्थान / लैंडमार्क',
    locationPlaceholder: 'उदा. लाइटहाउस के पास, मरीना बीच निचला क्षेत्र',
    situationDescLabel: 'स्थिति का विवरण',
    situationPlaceholder: 'पानी की ऊंचाई, बुजुर्ग/बच्चे, छत का रास्ता, पहचान चिन्ह...',
    submitSosBtn: '🚨 तत्काल एसओएस (SOS) बचाव कॉल भेजें',
    submittingSosBtn: 'आपातकालीन सिग्नल भेजा जा रहा है...',
    // Shelters, Risk, Alerts, Helplines
    sheltersTitle: 'निकटतम सत्यापित आपातकालीन आश्रय गृह',
    sheltersSubtitle: 'आपकी जीपीएस लोकेशन से दूरी के अनुसार क्रमबद्ध।',
    navigateShelterBtn: 'इस आश्रय गृह का रास्ता देखें',
    riskTitle: 'व्यक्तिगत जोखिम मूल्यांकन',
    activeCycloneLabel: 'सक्रिय चक्रवात:',
    distanceFromEyeLabel: 'केंद्र से दूरी:',
    threatClassLabel: 'खतरे की श्रेणी:',
    officialDirectiveLabel: 'आधिकारिक सुरक्षा निर्देश:',
    alertsTitle: 'आधिकारिक प्रसारण अलर्ट',
    alertsSubtitle: 'आपदा संचालन केंद्र द्वारा जारी अधिकृत चेतावनियां।',
    helplinesTitle: '24/7 आपातकालीन हेल्पलाइन',
    helplinesSubtitle: 'केंद्रीय नियंत्रण कक्ष के टोल-फ्री नंबर।',
    // Voice Broadcast Script
    voiceWarningNative:
      'तटीय निवासियों और मछुआरों के लिए अत्यंत महत्वपूर्ण चेतावनी! भीषण चक्रवात अमारा 175 किलोमीटर प्रति घंटे की रफ़्तार से तट की ओर बढ़ रहा है। अगले 18 घंटों में उत्तरी चेन्नई और एन्नोर तट के पास चक्रवात के टकराने की संभावना है। सभी मछुआरों को सख्त सलाह दी जाती है कि वे बंगाल की खाड़ी में न जाएं। निचले तटीय इलाकों के निवासी तुरंत राष्ट्रीय राजमार्ग 48 और 38 से होकर निकटतम सुरक्षित चक्रवात आश्रय गृह में पहुंचें। तत्काल बचाव के लिए लाल एसओएस बटन दबाएं या टोल-फ्री नंबर 1 0 7 0 पर कॉल करें।',
    voiceWarningPhonetic:
      'Tatiya nivasiyon aur machhuaron ke liye mahatvapurna chetavani! Bheeshan chakravat Amara 175 kilometer prati ghante ki raftaar se tat ki or badh raha hai. Agle 18 ghanton mein Uttari Chennai aur Ennore tat ke paas chakravat takrayega. Sabhi machhuare samudra mein na jayein. Nichle ilakon ke log turant surakshit aashray grih mein pahunchein. Tatkal bachav ke liye 1 0 7 0 par call karein.'
  },

  bn: {
    // Landing Page
    landingSubBrand: 'দুর্যোগ পরিচালনা কেন্দ্র (EOC)',
    landingCitizenSosBtn: 'নাগরিক SOS',
    landingSignUpBtn: 'রেজিস্টার (Sign Up)',
    landingSignInBtn: 'সাইন ইন (Sign In)',
    landingStatusPill: 'সক্রিয় কমান্ড টেলিমেট্রি • বঙ্গোপসাগর ও আরব সাগর',
    landingHeroTitle: 'কেন্দ্রীয় ঘূর্ণিঝড় ট্র্যাকিং, প্রভাব পূর্বাভাস ও ত্রাণ পরিচালনা',
    landingHeroSubtitle:
      'সরকারি কর্তৃপক্ষ, এনডিআরএফ (NDRF) উদ্ধারকারী বাহিনী, আশ্রয়কেন্দ্র ব্যবস্থাপক এবং উপকূলীয় নাগরিকদের রিয়েল-টাইমে সংযুক্ত করার কমান্ড সিস্টেম।',
    landingCtaCommand: 'কমান্ড সেন্টার খুলুন',
    landingCtaVolunteer: 'স্বেচ্ছাসেবক / উদ্ধারকারী হিসেবে যোগ দিন',
    landingCtaCitizen: 'নাগরিক জরুরি সহায়তা পোর্টাল (SOS)',
    landingMetricWind: 'বাতাসের গতিবেগ',
    landingMetricEvacuees: 'উদ্ধারকৃত উপকূলীয় মানুষ',
    landingMetricShelters: 'সক্রিয় নিরাপদ আশ্রয়কেন্দ্র',
    landingMetricResponse: 'গড় উদ্ধার সময়',
    landingArchTag: 'সম্পূর্ণ দুর্যোগ পরিচালনা কাঠামো',
    landingArchTitle: 'জরুরি অভিযানের জন্য নির্মিত দুর্যোগ বুদ্ধিমত্তা',
    landingRoleTag: 'ভূমিকা-ভিত্তিক অ্যাক্সেস কন্ট্রোল (RBAC)',
    landingRoleTitle: '৬টি বিশেষায়িত কার্যকরী ভূমিকা',
    landingRoleSubtitle:
      'প্রতিটি অংশীজনের জন্য নির্ধারিত জরুরি কর্মপ্রবাহ এবং রিয়েল-টাইম টেলিমেট্রি।',
    // Login & Sign Up Page
    loginBackBtn: '← মূল পৃষ্ঠায় ফিরে যান',
    loginTitle: 'সাইক্লোন কমান্ড (EOC)',
    loginSubtitle: 'জাতীয় দুর্যোগ পরিচালনা কমান্ড ও মাল্টি-এজেন্সি রেসপন্স প্ল্যাটফর্ম',
    loginTabSignIn: 'সাইন ইন (Sign In)',
    loginTabSignUp: 'নিবন্ধন করুন (Register)',
    loginEmailLabel: 'ইমেল আইডি',
    loginPassphraseLabel: 'পাসওয়ার্ড',
    loginSubmitBtn: 'কমান্ড সিস্টেমে প্রবেশ করুন',
    loginAuthenticating: 'যাচাই করা হচ্ছে...',
    signupSelectRoleLabel: 'আপনার কার্যকরী ভূমিকা নির্বাচন করুন',
    signupFullNameLabel: 'সম্পূর্ণ নাম',
    signupPhoneLabel: 'ফোন নম্বর',
    signupEmailLabel: 'ইমেল ঠিকানা',
    signupRealEmailTag: 'স্থায়ী ইমেল আবশ্যক',
    signupPasswordLabel: 'পাসওয়ার্ড',
    signupConfirmPasswordLabel: 'পাসওয়ার্ড নিশ্চিত করুন',
    signupDistrictLabel: 'উপকূলীয় জেলা',
    signupSkillsLabel: 'বিশেষ উদ্ধার দক্ষতা ও সক্ষমতা',
    signupSubmitPrefix: 'নিবন্ধন সম্পূর্ণ করুন:',
    signupAlreadyAccount: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
    signupSignInHere: 'এখানে সাইন ইন করুন',
    // Header & Global Controls
    opsCenter: 'ঘূর্ণিঝড় পরিচালনা কেন্দ্র',
    liveDataConnected: 'লাইভ ডেটা সংযুক্ত',
    reconnectGateway: 'পুনরায় সংযোগ করুন',
    lastUpdated: 'সর্বশেষ আপডেট',
    refresh: 'রিফ্রেশ',
    syncing: 'সিঙ্ক হচ্ছে...',
    offline: 'অফলাইন',
    gridDown: 'নেটওয়ার্ক নেই',
    hideBar: 'লুকান',
    voiceSirenBtn: 'ভয়েস সতর্কবার্তা',
    stopVoiceBtn: 'থামান',
    // Sidebar Sections & Links
    secDisasterOps: 'দুর্যোগ পরিচালনা',
    secResponseSafety: 'উদ্ধার ও নিরাপত্তা',
    secReliefLogistics: 'ত্রাণ ও রসদ',
    secCommunication: 'যোগাযোগ ও সতর্কতা',
    secAnalytics: 'বিশ্লেষণ',
    secAdministration: 'প্রশাসন',
    navCommandCenter: 'কমান্ড সেন্টার',
    navCycloneTracking: 'ঘূর্ণিঝড় ট্র্যাকিং',
    navImpactAssessment: 'ক্ষয়ক্ষতি মূল্যায়ন',
    navEvacuationPlanning: 'স্থানান্তর পরিকল্পনা',
    navSheltersManagement: 'আশ্রয়কেন্দ্র ব্যবস্থাপনা',
    navSafeRegistry: 'নিরাপদ ব্যক্তি নিবন্ধন',
    navVolunteerTasks: 'স্বেচ্ছাসেবক কার্যতালিকা',
    navIncidentTriage: 'জরুরি ঘটনা অগ্রাধিকার',
    navResponseTeams: 'উদ্ধারকারী দল (NDRF)',
    navReliefInventory: 'ত্রাণ ভাণ্ডার ও সরবরাহ',
    navEmergencyAlerts: 'জরুরি সতর্কবার্তা',
    navCitizenPortal: 'নাগরিক জরুরি পোর্টাল (SOS)',
    navLiveTracking: 'লাইভ রেসকিউ ট্র্যাকিং',
    navAnalyticsForecast: 'বিশ্লেষণ ও পূর্বাভাস',
    navOperationalReports: 'কার্যক্রম প্রতিবেদন',
    navPersonnelApprovals: 'কর্মী ও অনুমোদন',
    // Citizen Portal & Voice Warning Panel
    portalBadge: '🚨 নাগরিক জরুরি ঘূর্ণিঝড় সহায়তা পোর্টাল',
    portalTitle: 'ঘূর্ণিঝড় জরুরি উদ্ধার ও সহায়তা',
    portalSubtitle: 'তাৎক্ষণিক জীবনরক্ষাকারী উদ্ধার, লাইভ ঝুঁকির মাত্রা এবং নিরাপদ আশ্রয়কেন্দ্রের দিকনির্দেশনা।',
    localThreatLabel: 'আপনার এলাকার ঝুঁকি:',
    cycloneEyeLabel: 'ঘূর্ণিঝড় কেন্দ্রের দূরত্ব:',
    voicePanelBadge: 'মৎস্যজীবী ও প্রবীণ নাগরিকদের জন্য অডিও সুবিধা',
    voicePanelTitle: 'বহুভাষিক ভয়েস সাইরেন এবং নিরাপদ স্থানান্তর ঘোষণা',
    voicePanelDesc: 'ঘূর্ণিঝড় আঘাত হানার সময়, সমুদ্র সতর্কতা এবং নিরাপদ আশ্রয়ে যাওয়ার নির্দেশাবলী বাংলায় পড়ে শোনানোর স্বয়ংক্রিয় অডিও সাইরেন।',
    playVoiceWarning: '🔊 ভয়েস সাইরেন ও সতর্কবার্তা শুনুন (বাংলা)',
    stopVoiceWarning: '⏹️ অডিও প্রচার বন্ধ করুন',
    readShelterVoice: '🔊 নিকটতম আশ্রয়কেন্দ্রের তথ্য শুনুন',
    sirenIncludeLabel: 'জরুরি সাইরেন শব্দ যুক্ত করুন',
    liveVoiceScriptLabel: 'লাইভ অডিও সতর্কবার্তা (বাংলা):',
    // Citizen Portal 6 Tabs
    tab1Sos: '১. SOS পাঠান',
    tab2LiveMap: '২. লাইভ রেসকিউ ম্যাপ',
    tab3Shelter: '৩. আশ্রয়কেন্দ্র খুঁজুন',
    tab4Risk: '৪. আমার ঝুঁকির মাত্রা',
    tab5Alerts: '৫. জরুরি সতর্কতা',
    tab6Helplines: '৬. হেল্পলাইন নম্বর',
    // SOS Form
    sosHeaderTitle: 'জরুরি এসওএস (SOS) বিপদ সংকেত প্রেরণ',
    sosHeaderDesc: 'কেন্দ্রীয় কন্ট্রোল রুমে আপনার সঠিক লাইভ জিপিএস অবস্থান পাঠায় এবং দ্রুত এনডিআরএফ উদ্ধারকারী দল পাঠায়।',
    gpsTrackingEnabled: 'সঠিক লাইভ জিপিএস (GPS) অবস্থান ট্র্যাকিং: চালু আছে',
    gpsTrackingPaused: 'সঠিক লাইভ জিপিএস (GPS) অবস্থান ট্র্যাকিং: বন্ধ আছে',
    continuousLiveStream: 'নিরবচ্ছিন্ন লাইভ স্ট্রিম',
    coordinatesLabel: 'জিপিএস স্থানাঙ্ক:',
    fullNameLabel: 'আপনার সম্পূর্ণ নাম',
    fullNamePlaceholder: 'যেমন: প্রিয়া সুন্দরম',
    phoneLabel: 'যোগাযোগের ফোন নম্বর',
    phonePlaceholder: 'যেমন: +91 98401 23456',
    emergencyNatureLabel: 'জরুরি অবস্থার ধরন',
    optTrapped: 'বন্যায় আটকে পড়া মানুষ (ছাদ / বাড়তে থাকা জল)',
    optMedical: 'জরুরি চিকিৎসা সহায়তা',
    optFlooding: 'তীব্র জলাবদ্ধতা ও প্লাবন',
    optCollapse: 'ভবন বা দেওয়াল ধসের ঝুঁকি',
    optMissing: 'নিখোঁজ ব্যক্তি',
    optFoodWater: 'শিশু খাদ্য / পানীয় জলের সংকট',
    peopleCountLabel: 'আটকে পড়া / ক্ষতিগ্রস্ত মানুষের সংখ্যা',
    locationLandmarkLabel: 'বর্তমান অবস্থান / ল্যান্ডমার্ক',
    locationPlaceholder: 'যেমন: লাইটহাউসের কাছে, মেরিনা বিচ নিচু এলাকা',
    situationDescLabel: 'পরিস্থিতির বিবরণ',
    situationPlaceholder: 'জলের উচ্চতা, শিশু/বৃদ্ধের উপস্থিতি, ছাদের পথ...',
    submitSosBtn: '🚨 অবিলম্বে জরুরি SOS উদ্ধার কল পাঠান',
    submittingSosBtn: 'বিপদ সংকেত পাঠানো হচ্ছে...',
    // Shelters, Risk, Alerts, Helplines
    sheltersTitle: 'নিকটতম অনুমোদিত জরুরি ঘূর্ণিঝড় আশ্রয়কেন্দ্র',
    sheltersSubtitle: 'আপনার জিপিএস অবস্থান থেকে দূরত্বের ভিত্তিতে সাজানো।',
    navigateShelterBtn: 'এই আশ্রয়কেন্দ্রে যাওয়ার পথ দেখুন',
    riskTitle: 'ব্যক্তিগত ঝুঁকি মূল্যায়ন',
    activeCycloneLabel: 'সক্রিয় ঘূর্ণিঝড়:',
    distanceFromEyeLabel: 'কেন্দ্র থেকে দূরত্ব:',
    threatClassLabel: 'ঝুঁকির শ্রেণীবিভাগ:',
    officialDirectiveLabel: 'সরকারি নিরাপত্তা নির্দেশিকা:',
    alertsTitle: 'সরকারি জরুরি সতর্কবার্তা',
    alertsSubtitle: 'দুর্যোগ পরিচালনা কেন্দ্র থেকে জারি করা সতর্কতা।',
    helplinesTitle: '২৪/৭ জরুরি হেল্পলাইন নম্বর',
    helplinesSubtitle: 'কেন্দ্রীয় কন্ট্রোল রুমের টোল-ফ্রি নম্বর।',
    // Voice Broadcast Script
    voiceWarningNative:
      'উপকূলীয় বাসিন্দা এবং মৎস্যজীবীদের জন্য জরুরি সতর্কবার্তা! তীব্র ঘূর্ণিঝড় আমারা ঘণ্টায় ১৭৫ কিলোমিটার বেগে উপকূলের দিকে ধেয়ে আসছে। আগামী ১৮ ঘণ্টার মধ্যে উত্তর চেন্নাই এবং এন্নোর উপকূলে ঘূর্ণিঝড়টি আঘাত হানবে। সকল মৎস্যজীবীকে বঙ্গোপসাগরে মাছ ধরতে না যাওয়ার জন্য কঠোরভাবে নির্দেশ দেওয়া হচ্ছে। নিচু উপকূলীয় অঞ্চলের বাসিন্দারা অবিলম্বে জাতীয় সড়ক ৪৮ এবং ৩৮ ধরে নিকটতম নিরাপদ ঘূর্ণিঝড় আশ্রয়কেন্দ্রে চলে যান। জরুরি উদ্ধারের জন্য লাল এসওএস বোতাম টিপুন অথবা ১০৭০ নম্বরে কল করুন।',
    voiceWarningPhonetic:
      'Upakuliyo basinda ebong matsyajibider jonyo joruri satarkabarta! Tibro ghurnijhor Amara ghontay 175 kilometer bege upakuler dike dheye asche. Agami 18 ghontar modhye Uttar Chennai ebong Ennore upakule ghurnijhorti aghat hanbe. Sakal matsyajibike samudre na jawar nirdesh dewa hocche. Nichu elakar basindara abilambe nikatatama nirapad ashraykendre chole jan. Joruri uddharer jonyo 1 0 7 0 nombore call korun.'
  }
};

// Page-level phrase dictionary for automatic DOM translation across all 15 dashboard pages
const PAGE_PHRASE_TRANSLATIONS = {
  'Disaster Operations Command Center': {
    ta: 'பேரிடர் செயல்பாட்டுக் கட்டுப்பாட்டு மையம்',
    te: 'విపత్తు కార్యకలాపాల కమాండ్ సెంటర్',
    hi: 'आपदा संचालन कमांड सेंटर',
    bn: 'দুর্যোগ পরিচালনা কমান্ড সেন্টার'
  },
  'Real-time cyclone tracking, impact prediction, evacuation planning, and relief coordination': {
    ta: 'நேரடி புயல் கண்காணிப்பு, பாதிப்பு முன்கணிப்பு, வெளியேற்றத் திட்டமிடல் மற்றும் நிவாரண ஒருங்கிணைப்பு',
    te: 'రియల్-టైమ్ తుఫాను ట్రాకింగ్, ప్రభావ అంచనా, తరలింపు ప్రణాళిక మరియు సహాయ సమన్వయం',
    hi: 'रीयल-टाइम चक्रवात ट्रैकिंग, प्रभाव पूर्वानुमान, निकासी योजना और राहत समन्वय',
    bn: 'রিয়েল-টাইম ঘূর্ণিঝড় ট্র্যাকিং, প্রভাব পূর্বাভাস, স্থানান্তর পরিকল্পনা ও ত্রাণ সমন্বয়'
  },
  'Live Global Tropical Cyclone Tracking': {
    ta: 'உலகளாவிய நேரடி புயல் கண்காணிப்பு தளம்',
    te: 'ప్రత్యక్ష ప్రపంచ తుఫాను ట్రాకింగ్',
    hi: 'लाइव ग्लोबल चक्रवात ट्रैकिंग',
    bn: 'লাইভ গ্লোবাল ঘূর্ণিঝড় ট্র্যাকিং'
  },
  'Evacuation Planning': {
    ta: 'வெளியேற்றத் திட்டமிடல்',
    te: 'తరలింపు ప్రణాళిక',
    hi: 'निकासी योजना',
    bn: 'স্থানান্তর পরিকল্পনা'
  },
  'Manage evacuation routes and shelter capacity': {
    ta: 'வெளியேற்ற வழித்தடங்கள் மற்றும் பாதுகாப்பு முகாம் கொள்ளளவை நிர்வகிக்கவும்',
    te: 'తరలింపు మార్గాలు మరియు షెల్టర్ సామర్థ్యాన్ని నిర్వహించండి',
    hi: 'निकासी मार्गों और आश्रय क्षमता का प्रबंधन करें',
    bn: 'স্থানান্তর রুট এবং আশ্রয়কেন্দ্রের ধারণক্ষমতা পরিচালনা করুন'
  },
  'Evacuation Routes': {
    ta: 'வெளியேற்ற வழித்தடங்கள்',
    te: 'తరలింపు మార్గాలు',
    hi: 'निकासी मार्ग',
    bn: 'স্থানান্তর রুট'
  },
  'Safe Shelters': {
    ta: 'பாதுகாப்பு முகாம்கள்',
    te: 'సురక్షిత షెల్టర్లు',
    hi: 'सुरक्षित आश्रय गृह',
    bn: 'নিরাপদ আশ্রয়কেন্দ্র'
  },
  'Transport Resources': {
    ta: 'போக்குவரத்து வாகனங்கள்',
    te: 'రవాణా వనరులు',
    hi: 'परिवहन संसाधन',
    bn: 'পরিবহন সংস্থান'
  },
  'Full Corridor': {
    ta: 'முழு வழித்தடம்',
    te: 'పూర్తి కారిడార్',
    hi: 'संपूर्ण कॉरिडोर',
    bn: 'সম্পূর্ণ করিডোর'
  },
  'Add Route Corridor': {
    ta: 'புதிய வழித்தடம் சேர்',
    te: 'కొత్త మార్గం జోడించు',
    hi: 'नया मार्ग जोड़ें',
    bn: 'নতুন রুট যোগ করুন'
  },
  'Turn-by-Turn Navigation': {
    ta: 'திருப்பம் வாரியான வழிகாட்டி',
    te: 'టర్న్-బై-టర్న్ నావిగేషన్',
    hi: 'मोड़-दर-मोड़ नेविगेशन',
    bn: 'টার্ন-বাই-টার্ন নেভিগেশন'
  },
  'Emergency Shelters Management & Real-Time Capacity': {
    ta: 'அவசர பாதுகாப்பு முகாம்கள் மற்றும் நேரடி கொள்ளளவு மேலாண்மை',
    te: 'అత్యవసర పునరావాస కేంద్రాలు & రియల్-టైమ్ సామర్థ్య నిర్వహణ',
    hi: 'आपातकालीन आश्रय गृह प्रबंधन और लाइव क्षमता',
    bn: 'জরুরি আশ্রয়কেন্দ্র ব্যবস্থাপনা ও রিয়েল-টাইম ধারণক্ষমতা'
  },
  'Emergency Incident Management & Tactical Triage': {
    ta: 'அவசர சம்பவ மேலாண்மை மற்றும் மீட்பு முன்னுரிமை',
    te: 'అత్యవసర సంఘటనల నిర్వహణ & రెస్క్యూ ప్రాధాన్యత',
    hi: 'आपातकालीन घटना प्रबंधन और सामरिक प्राथमिकता',
    bn: 'জরুরি ঘটনা ব্যবস্থাপনা ও উদ্ধার অগ্রাধিকার'
  },
  'Volunteer Micro-Tasking Engine': {
    ta: 'தன்னார்வலர் களப்பணி ஒருங்கிணைப்பு தளம்',
    te: 'వాలంటీర్ మైక్రో-టాస్కింగ్ ఇంజిన్',
    hi: 'स्वयंसेवक माइक्रो-टास्किंग इंजन',
    bn: 'স্বেচ্ছাসেবক মাইক্রো-টাস্কিং ইঞ্জিন'
  },
  'Relief Inventory, Warehouse Depots & Distribution Optimization': {
    ta: 'நிவாரணப் பொருட்கள் கிடங்கு மற்றும் விநியோக மேலாண்மை',
    te: 'సహాయ సామగ్రి నిల్వలు, గిడ్డంగులు & పంపిణీ ఆప్టిమైజేషన్',
    hi: 'राहत सामग्री भंडार, गोदाम डिपो और वितरण अनुकूलन',
    bn: 'ত্রাণ ভাণ্ডার, গুদাম ডিপো ও বিতরণ অপ্টিমাইজেশন'
  }
};

export const LanguageProvider = ({ children }) => {
  // Default is ALWAYS English ('en')
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('cycloneOpsLanguage');
    return saved && TRANSLATIONS[saved] ? saved : 'en';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [includeSiren, setIncludeSiren] = useState(true);
  const audioCtxRef = useRef(null);
  const sirenTimerRef = useRef(null);
  const originalTextMapRef = useRef(new WeakMap());

  const setLanguage = useCallback((langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      localStorage.setItem('cycloneOpsLanguage', langCode);
    }
  }, []);

  const t = useCallback(
    (key) => {
      const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
      return currentDict[key] || TRANSLATIONS.en[key] || key;
    },
    [language]
  );

  // Reversible DOM phrase localization across all dashboard pages
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const applyDomTranslations = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        const parentTag = node.parentElement?.tagName;
        if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'OPTION') continue;

        if (!originalTextMapRef.current.has(node)) {
          const trimmed = node.nodeValue?.trim();
          if (trimmed && PAGE_PHRASE_TRANSLATIONS[trimmed]) {
            originalTextMapRef.current.set(node, node.nodeValue);
          }
        }

        const orig = originalTextMapRef.current.get(node);
        if (orig) {
          const trimmedOrig = orig.trim();
          const entry = PAGE_PHRASE_TRANSLATIONS[trimmedOrig];
          if (entry) {
            if (language === 'en') {
              if (node.nodeValue !== orig) node.nodeValue = orig;
            } else if (entry[language]) {
              if (node.nodeValue !== entry[language]) node.nodeValue = entry[language];
            }
          }
        }
      }
    };

    applyDomTranslations();
    const timer = setTimeout(applyDomTranslations, 250);
    return () => clearTimeout(timer);
  }, [language]);

  // Synthesize a realistic 1.4-second Civil Defense Dual-Tone Emergency Siren via Web Audio API
  const playSirenTone = useCallback(() => {
    return new Promise((resolve) => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
          resolve();
          return;
        }
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        const now = ctx.currentTime;
        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.linearRampToValueAtTime(880, now + 0.65);
        osc1.frequency.linearRampToValueAtTime(520, now + 1.3);

        osc2.frequency.setValueAtTime(446, now);
        osc2.frequency.linearRampToValueAtTime(886, now + 0.65);
        osc2.frequency.linearRampToValueAtTime(526, now + 1.3);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
        gain.gain.setValueAtTime(0.18, now + 1.05);
        gain.gain.linearRampToValueAtTime(0.001, now + 1.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.35);
        osc2.stop(now + 1.35);

        sirenTimerRef.current = setTimeout(() => {
          try {
            ctx.close();
          } catch (_) {}
          resolve();
        }, 1400);
      } catch (_) {
        resolve();
      }
    });
  }, []);

  const stopVoiceBroadcast = useCallback(() => {
    if (sirenTimerRef.current) {
      clearTimeout(sirenTimerRef.current);
      sirenTimerRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakEmergencyWarning = useCallback(
    async ({ customText, langOverride, withSiren = includeSiren } = {}) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      stopVoiceBroadcast();
      setIsSpeaking(true);

      const targetLang = langOverride || language;
      const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[0];
      const dict = TRANSLATIONS[targetLang] || TRANSLATIONS.en;

      if (withSiren) {
        await playSirenTone();
      }

      const voices = window.speechSynthesis.getVoices() || [];
      const langPrefix = langMeta.bcp47.split('-')[0].toLowerCase();

      const matchedVoice =
        voices.find((v) => v.lang && v.lang.toLowerCase() === langMeta.bcp47.toLowerCase()) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix));

      const indianFallbackVoice =
        voices.find((v) => v.lang && v.lang.toLowerCase().includes('in')) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) ||
        voices[0];

      const textToSpeak =
        customText ||
        (matchedVoice
          ? dict.voiceWarningNative
          : `${dict.voiceWarningPhonetic} ... ${TRANSLATIONS.en.voiceWarningNative}`);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else if (indianFallbackVoice) {
        utterance.voice = indianFallbackVoice;
        utterance.lang = indianFallbackVoice.lang;
      } else {
        utterance.lang = langMeta.bcp47;
      }

      utterance.rate = 0.94;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [includeSiren, language, playSirenTone, stopVoiceBroadcast]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener?.('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  const currentLanguageMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageMeta,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        isSpeaking,
        includeSiren,
        setIncludeSiren,
        speakEmergencyWarning,
        stopVoiceBroadcast
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
