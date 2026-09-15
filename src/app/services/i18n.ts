import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type LanguageCode = 'hi' | 'en';

export interface Translations {
  // Navigation & General
  dashboard: string;
  customers: string;
  customerList: string;
  customerListHeading: string;
  customerListSub: string;
  dukaan: string;
  profile: string;
  today: string;
  yesterday: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  close: string;
  search: string;
  all: string;
  active: string;
  offline: string;
  connected: string;
  notConnected: string;
  synced: string;
  syncing: string;
  print: string;
  download: string;
  update: string;
  sheetConnected: string;
  sheetNotConnected: string;
  lastSynced: string;
  change: string;
  remove: string;
  reset: string;
  calendar: string;
  date: string;

  // Header
  todayDate: string;
  sheetSyncedTooltip: string;
  sheetUnsyncedTooltip: string;

  // Dashboard
  todayFocus: string;
  namaste: string;
  vyapari: string;
  marketDue: string;
  dueCustomersCount: string;
  recoveryRate: string;
  jamaVsUdhar: string;
  quickAddCust: string;
  openAccount: string;
  quickSheet: string;
  cloudBackup: string;
  quickPaymentQr: string;
  upiStandee: string;
  quickStatement: string;
  pdfReport: string;
  youWillGet: string;
  youWillGive: string;
  totalReceived: string;
  totalGave: string;
  dueList: string;
  advanceList: string;
  cashUpiCollection: string;
  creditSalesVolume: string;
  topDueHeading: string;
  seeAll: string;
  sendReminder: string;
  scheduleAndRecent: string;
  organizeDay: string;
  allCustomersBtn: string;
  businessStreak: string;
  liveHealth: string;
  recoveryCol: string;
  totalJamaCol: string;
  grahakCol: string;
  udharDiya: string;
  jamaHua: string;

  // Customer List
  customerLedgerTitle: string;
  customerLedgerSub: string;
  searchPlaceholder: string;
  calendarBtn: string;
  filterByDate: string;
  addCustomerBtn: string;
  selectedDateBanner: string;
  selectedDateLabel: string;
  changeDateBtn: string;
  removeFilterBtn: string;
  customersWithTx: string;
  filterAll: string;
  filterDue: string;
  filterAdvance: string;
  filterSettled: string;
  sortDueHighLow: string;
  sortHighBalance: string;
  sortRecent: string;
  sortName: string;
  noCustomerTitle: string;
  noCustomerDesc: string;
  noCustomerFound: string;
  noRecordOnDate: string;
  noRecordInCategory: string;
  resetDateFilter: string;
  connectSheetPromptTitle: string;
  connectSheetPromptDesc: string;
  connectSheetPrompt: string;
  connectSheetDesc: string;
  connectSheetActionBtn: string;
  emptyResetDate: string;
  totalCustomersLabel: string;
  duePill: string;
  advancePill: string;
  settledPill: string;

  // Customer Detail
  backToList: string;
  backToListBtn: string;
  sendWaReminderBtn: string;
  takazaBtn: string;
  statementBtn: string;
  editCustBtn: string;
  deleteCustBtn: string;
  totalDueBanner: string;
  advanceBanner: string;
  settledBanner: string;
  totalGaveSummary: string;
  totalReceivedSummary: string;
  totalGaveAllTimeLabel: string;
  totalReceivedAllTimeLabel: string;
  txFilterAll: string;
  txFilterGave: string;
  txFilterReceived: string;
  iGaveFilter: string;
  iGotFilter: string;
  txHistoryLabel: string;
  lenDenHistory: string;
  noTxTitle: string;
  noTxDesc: string;
  noTransactionsYet: string;
  noTransactionsPrompt: string;
  balanceRemaining: string;
  balanceLabel: string;
  btnMaineDiye: string;
  btnMaineLiye: string;
  maineDiyeBtn: string;
  maineLiyeBtn: string;
  deleteCustomerConfirm: string;
  deleteTxConfirm: string;

  // Transaction Modal
  txModalTitleEdit: string;
  txModalTitleGave: string;
  txModalTitleReceived: string;
  editTxTitle: string;
  addGaveTxTitle: string;
  addReceivedTxTitle: string;
  txToggleGave: string;
  txToggleReceived: string;
  amountLabel: string;
  noteLabel: string;
  notePlaceholder: string;
  dateLabel: string;
  saveTxBtn: string;
  updateTxBtn: string;
  saveEntryBtn: string;
  updateEntryBtn: string;

  // Customer Modal
  custModalTitleAdd: string;
  custModalTitleEdit: string;
  addCustomerTitle: string;
  editCustomerTitle: string;
  custModalSub: string;
  addCustomerSub: string;
  custNameLabel: string;
  customerNameLabel: string;
  custNamePlaceholder: string;
  customerNamePlaceholder: string;
  custNameRequired: string;
  nameReqError: string;
  custPhoneLabel: string;
  phoneLabel: string;
  custPhoneRequired: string;
  custPhoneHelp: string;
  phoneHelpText: string;
  custAddressLabel: string;
  addressLabel: string;
  custAddressPlaceholder: string;
  addressPlaceholder: string;
  saveCustBtn: string;
  updateCustBtn: string;
  addCustomerModalBtn: string;
  updateCustomerBtn: string;

  // Dukaan / Profile
  dukaanOwner: string;
  secBusinessTitle: string;
  secBusinessSub: string;
  secBusinessBadge: string;
  secPaymentTitle: string;
  secPaymentSub: string;
  secPaymentBadge: string;
  secSheetTitle: string;
  secSheetSub: string;
  secSheetBadge: string;
  secBackupTitle: string;
  secBackupSub: string;
  secBackupBadge: string;
  secLanguageTitle: string;
  secLanguageSub: string;
  secLanguageBadge: string;
  showDetails: string;
  hideDetails: string;
  fieldShopName: string;
  fieldOwnerName: string;
  fieldPhone: string;
  fieldCategory: string;
  fieldAddress: string;
  billInfoNotice: string;
  editDetailsBtn: string;
  editShopHeader: string;
  cancelEditBtn: string;
  saveProfileBtn: string;
  upiIdLabel: string;
  changeUpiBtn: string;
  upiActiveBadge: string;
  saveUpiBtn: string;
  acceptedAppsLabel: string;
  printStandeeActionBtn: string;
  bharatUpiQrTitle: string;
  zeroExtraChargeNotice: string;
  uploadCustomQrTitle: string;
  uploadCustomQrSub: string;
  dragDropQrText: string;
  customQrActiveBadge: string;
  autoGenQrBadge: string;
  removeCustomQrBtn: string;
  useAutoQrBtn: string;
  useUploadedQrBtn: string;
  qrUploadNotice: string;
  toggleLanguagePrompt: string;
  connectedGoogleSheet: string;
  manualSyncBtn: string;
  settingsBtn: string;
  sheetBullet1Title: string;
  sheetBullet1Desc: string;
  sheetBullet2Title: string;
  sheetBullet2Desc: string;
  sheetBullet3Title: string;
  sheetBullet3Desc: string;
  disconnectSheetBtn: string;
  disconnectSheetConfirm: string;
  exportCsvBtnTitle: string;
  exportCsvBtnSub: string;
  downloadJsonBtnTitle: string;
  downloadJsonBtnSub: string;
  restoreBackupTitle: string;
  restoreBackupSub: string;
  uploadBackupFileBtn: string;
  appFootnote1: string;
  appFootnote2: string;
  langSelectLabel: string;
  langHindiOption: string;
  langEnglishOption: string;
  langNotice: string;

  // Calendar Picker Modal
  calendarModalTitle: string;
  calendarModalSub: string;
  clearFilterBtn: string;
  quickFilterToday: string;
  quickFilterYesterday: string;
  quickFilterThisMonth: string;
  quickFilterAll: string;
  legendHasTx: string;
  legendSelected: string;
  dateSummaryLabel: string;
  noTxOnDate: string;

  // Statement Modal
  statementModalTitle: string;
  statementModalSub: string;
  customerStatementFor: string;
  billPeriod: string;
  printInvoiceBtn: string;
  shareWhatsAppBtn: string;
  netBalanceSummary: string;
  closingBalance: string;

  // Sheet Modal
  sheetModalTitle: string;
  sheetModalSub: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  scriptUrlPlaceholder: string;
  connectSheetBtn: string;
  testConnectionBtn: string;
}

const HINDI_TRANSLATIONS: Translations = {
  // Navigation & General
  dashboard: 'डैशबोर्ड',
  customers: 'ग्राहक',
  customerList: 'ग्राहक सूची',
  customerListHeading: 'ग्राहक बही खाता',
  customerListSub: 'लेन-देन की पूरी सूची और खाता बुक',
  dukaan: 'दुकान',
  profile: 'प्रोफाइल',
  today: 'आज',
  yesterday: 'कल',
  save: 'सेव करें',
  cancel: 'रद्द करें',
  edit: 'बदलें',
  delete: 'हटाएं',
  close: 'बंद करें',
  search: 'खोजें...',
  all: 'सभी',
  active: 'सक्रिय',
  offline: 'ऑफलाइन',
  connected: 'कनेक्टेड',
  notConnected: 'कनेक्ट नहीं है',
  synced: 'सिंक हुआ',
  syncing: 'सिंक हो रहा है...',
  print: 'प्रिंट करें',
  download: 'डाउनलोड',
  update: 'अपडेट करें',
  sheetConnected: 'शीट कनेक्टेड',
  sheetNotConnected: 'शीट कनेक्ट नहीं',
  lastSynced: 'अंतिम सिंक:',
  change: 'बदलें',
  remove: 'हटाएं',
  reset: 'रीसेट',
  calendar: 'कैलेंडर',
  date: 'तारीख',

  // Header
  todayDate: 'आज की तारीख',
  sheetSyncedTooltip: 'गूगल शीट सिंक है: सेटिंग्स देखने के लिए टैप करें',
  sheetUnsyncedTooltip: 'क्लाउड बैकअप के लिए गूगल शीट लिंक करें',

  // Dashboard
  todayFocus: 'आज की स्थिति',
  namaste: 'नमस्ते',
  vyapari: 'व्यापारी',
  marketDue: 'कुल मार्केट उधार (आपको लेना है)',
  dueCustomersCount: 'बाकी ग्राहक',
  recoveryRate: 'रिकवरी दर',
  jamaVsUdhar: 'जमा बनाम उधार',
  quickAddCust: 'नया ग्राहक',
  openAccount: 'खाता खोलें',
  quickSheet: 'गूगल शीट',
  cloudBackup: 'क्लाउड बैकअप',
  quickPaymentQr: 'पेमेंट QR',
  upiStandee: 'UPI स्टेंडी',
  quickStatement: 'बही खाता',
  pdfReport: 'PDF रिपोर्ट',
  youWillGet: 'आपको लेना है',
  youWillGive: 'आपको देना है',
  totalReceived: 'कुल जमा लिया',
  totalGave: 'कुल उधार दिया',
  dueList: 'बाकी सूची',
  advanceList: 'एडवांस सूची',
  cashUpiCollection: 'कैश / UPI कलेक्शन',
  creditSalesVolume: 'उधार बिक्री वॉल्यूम',
  topDueHeading: 'मुख्य बाकी ग्राहक (तकाजा / रिमाइंडर)',
  seeAll: 'सभी देखें',
  sendReminder: 'तकाजा',
  scheduleAndRecent: 'हालिया लेन-देन गतिविधि',
  organizeDay: 'दैनिक हिसाब • हालिया रिकॉर्ड',
  allCustomersBtn: 'सभी ग्राहक',
  businessStreak: 'व्यापार प्रदर्शन एवं आंकड़े',
  liveHealth: 'लाइव स्थिति',
  recoveryCol: 'रिकवरी',
  totalJamaCol: 'कुल जमा',
  grahakCol: 'ग्राहक',
  udharDiya: 'उधार दिया',
  jamaHua: 'जमा हुआ',

  // Customer List
  customerLedgerTitle: 'ग्राहक बही खाता',
  customerLedgerSub: 'लेन-देन की पूरी सूची और खाता बुक',
  searchPlaceholder: 'नाम या मोबाइल नंबर खोजें...',
  calendarBtn: 'कैलेंडर',
  filterByDate: 'तारीख के अनुसार फ़िल्टर करें',
  addCustomerBtn: '+ नया ग्राहक',
  selectedDateBanner: 'चुनी गई तारीख:',
  selectedDateLabel: 'तारीख',
  changeDateBtn: 'तारीख बदलें',
  removeFilterBtn: 'फ़िल्टर हटाएं',
  customersWithTx: 'ग्राहकों में लेन-देन',
  filterAll: 'सभी',
  filterDue: 'लेना है',
  filterAdvance: 'देना है',
  filterSettled: 'बराबर',
  sortDueHighLow: 'ज्यादा बाकी (अधिक से कम)',
  sortHighBalance: 'ज्यादा बाकी (अधिक से कम)',
  sortRecent: 'हालिया लेन-देन (नया पहले)',
  sortName: 'नाम (A से Z)',
  noCustomerTitle: 'कोई ग्राहक नहीं मिला',
  noCustomerDesc: 'इस श्रेणी में अभी कोई रिकॉर्ड नहीं है।',
  noCustomerFound: 'कोई रिकॉर्ड नहीं मिला',
  noRecordOnDate: 'इस तारीख को कोई लेन-देन नहीं मिला:',
  noRecordInCategory: 'इस श्रेणी में कोई ग्राहक नहीं है।',
  resetDateFilter: 'सभी तारीख देखें (रीसेट)',
  connectSheetPromptTitle: 'गूगल शीट कनेक्ट करें',
  connectSheetPromptDesc: 'बही-खाता सीधे गूगल शीट में सुरक्षित सिंक होगा। शुरू करने के लिए पहले अपनी शीट जोड़ें।',
  connectSheetPrompt: 'गूगल शीट कनेक्ट करें',
  connectSheetDesc: 'बही-खाता सीधे गूगल शीट में सुरक्षित सिंक होगा। शुरू करने के लिए पहले अपनी शीट जोड़ें।',
  connectSheetActionBtn: 'शीट कनेक्ट करें',
  emptyResetDate: 'सभी तारीख देखें (रीसेट)',
  totalCustomersLabel: 'कुल ग्राहक:',
  duePill: 'लेना है',
  advancePill: 'देना है',
  settledPill: 'बराबर',

  // Customer Detail
  backToList: 'ग्राहक सूची पर वापस जाएं',
  backToListBtn: 'ग्राहक सूची पर वापस जाएं',
  sendWaReminderBtn: 'व्हाट्सएप तकाजा भेजें',
  takazaBtn: 'तकाजा',
  statementBtn: 'स्टेटमेंट / प्रिंट बही खाता',
  editCustBtn: 'ग्राहक की जानकारी बदलें',
  deleteCustBtn: 'ग्राहक को हटाएं',
  totalDueBanner: 'आपको लेना है (बाकी रकम)',
  advanceBanner: 'आपको देना है (एडवांस)',
  settledBanner: 'हिसाब बराबर (शून्य बाकी)',
  totalGaveSummary: 'कुल दिया',
  totalReceivedSummary: 'कुल लिया',
  totalGaveAllTimeLabel: 'कुल दिया',
  totalReceivedAllTimeLabel: 'कुल लिया',
  txFilterAll: 'सभी',
  txFilterGave: 'मैंने दिए',
  txFilterReceived: 'मैंने लिए',
  iGaveFilter: 'मैंने दिए',
  iGotFilter: 'मैंने लिए',
  txHistoryLabel: 'लेन-देन इतिहास',
  lenDenHistory: 'लेन-देन इतिहास',
  noTxTitle: 'कोई लेन-देन रिकॉर्ड नहीं है',
  noTxDesc: 'नीचे दिए गए बटनों से "मैंने दिए" या "मैंने लिए" दर्ज करें।',
  noTransactionsYet: 'कोई लेन-देन रिकॉर्ड नहीं है',
  noTransactionsPrompt: 'नीचे दिए गए बटनों से "मैंने दिए" या "मैंने लिए" रिकॉर्ड करें।',
  balanceRemaining: 'बाकी:',
  balanceLabel: 'बाकी',
  btnMaineDiye: 'मैंने दिए ₹',
  btnMaineLiye: 'मैंने लिए ₹',
  maineDiyeBtn: 'मैंने दिए ₹',
  maineLiyeBtn: 'मैंने लिए ₹',
  deleteCustomerConfirm: 'क्या आप वाकई इस ग्राहक को हटाना चाहते हैं?',
  deleteTxConfirm: 'क्या आप इस लेन-देन को हटाना चाहते हैं?',

  // Transaction Modal
  txModalTitleEdit: 'लेन-देन सुधारें',
  txModalTitleGave: 'मैंने दिए (उधार दिया)',
  txModalTitleReceived: 'मैंने लिए (जमा लिया)',
  editTxTitle: 'एंट्री सुधारें',
  addGaveTxTitle: 'मैंने दिए (उधार दिया)',
  addReceivedTxTitle: 'मैंने लिए (पेमेंट जमा)',
  txToggleGave: 'मैंने दिए (-)',
  txToggleReceived: 'मैंने लिए (+)',
  amountLabel: 'राशि (रुपये में) *',
  noteLabel: 'विवरण / बिल नंबर (वैकल्पिक)',
  notePlaceholder: 'जैसे: 5 किलो आटा, राशन बिल #41, नकद...',
  dateLabel: 'तारीख',
  saveTxBtn: 'सेव करें',
  updateTxBtn: 'अपडेट करें',
  saveEntryBtn: 'सेव करें',
  updateEntryBtn: 'एंट्री अपडेट करें',

  // Customer Modal
  custModalTitleAdd: 'नया ग्राहक जोड़ें',
  custModalTitleEdit: 'ग्राहक की जानकारी बदलें',
  addCustomerTitle: 'नया ग्राहक जोड़ें',
  editCustomerTitle: 'ग्राहक की जानकारी बदलें',
  custModalSub: 'खाता और लेन-देन रिकॉर्ड के लिए',
  addCustomerSub: 'खाता और लेन-देन रिकॉर्ड के लिए',
  custNameLabel: 'ग्राहक का नाम *',
  customerNameLabel: 'ग्राहक का नाम *',
  custNamePlaceholder: 'जैसे: रमेश कुमार, सुनीता देवी...',
  customerNamePlaceholder: 'जैसे: रमेश कुमार, सुनीता देवी...',
  custNameRequired: 'कृपया ग्राहक का नाम दर्ज करें।',
  nameReqError: 'कृपया ग्राहक का नाम दर्ज करें।',
  custPhoneLabel: 'मोबाइल नंबर *',
  phoneLabel: 'मोबाइल नंबर (Phone) *',
  custPhoneRequired: '10 अंकों का मोबाइल नंबर डालें',
  custPhoneHelp: 'व्हाट्सएप तकाजा और कॉल के लिए आवश्यक',
  phoneHelpText: 'व्हाट्सएप तकाजा और कॉल के लिए जरूरी है',
  custAddressLabel: 'पता या दुकान का नाम (वैकल्पिक)',
  addressLabel: 'पता या दुकान (वैकल्पिक)',
  custAddressPlaceholder: 'जैसे: दुकान नं. 12 मेन मार्केट, कॉलोनी...',
  addressPlaceholder: 'जैसे: दुकान नं. 12 मेन मार्केट, कॉलोनी...',
  saveCustBtn: 'ग्राहक जोड़ें',
  updateCustBtn: 'अपडेट करें',
  addCustomerModalBtn: 'ग्राहक जोड़ें',
  updateCustomerBtn: 'अपडेट करें',

  // Dukaan / Profile
  dukaanOwner: 'मालिक:',
  secBusinessTitle: 'दुकान और व्यापारी की जानकारी',
  secBusinessSub: 'नाम, मोबाइल, पता और व्यापार श्रेणी',
  secBusinessBadge: 'प्रोफाइल',
  secPaymentTitle: 'पेमेंट QR और भारत UPI स्टेंडी',
  secPaymentSub: 'दुकान का UPI QR कोड एवं स्टैंडी',
  secPaymentBadge: 'UPI',
  secSheetTitle: 'गूगल शीट क्लाउड सिंक हब',
  secSheetSub: 'गूगल ड्राइव ऑटो-बैकअप एवं मल्टी-डिवाइस',
  secSheetBadge: 'क्लाउड',
  secBackupTitle: 'डेटा बैकअप एवं एक्सेल एक्सपोर्ट',
  secBackupSub: 'Excel CSV डाउनलोड • ऑफलाइन JSON बैकअप',
  secBackupBadge: 'एक्सपोर्ट',
  secLanguageTitle: 'भाषा सेटिंग / Language Settings',
  secLanguageSub: 'ऐप की भाषा हिंदी या अंग्रेजी में बदलें',
  secLanguageBadge: 'भाषा',
  showDetails: 'देखें',
  hideDetails: 'छुपाएं',
  fieldShopName: 'दुकान / फर्म का नाम',
  fieldOwnerName: 'व्यापारी / मालिक का नाम',
  fieldPhone: 'मोबाइल नंबर',
  fieldCategory: 'व्यापार श्रेणी',
  fieldAddress: 'दुकान का पता',
  billInfoNotice: 'बही खाता बिलों और पर्चियों पर यही जानकारी आती है',
  editDetailsBtn: 'जानकारी बदलें (Edit)',
  editShopHeader: 'दुकान डिटेल्स एडिट करें',
  cancelEditBtn: 'कैंसिल करें',
  saveProfileBtn: 'सेव एवं अपडेट करें',
  upiIdLabel: 'व्यापारी UPI ID',
  changeUpiBtn: 'बदलें',
  upiActiveBadge: 'सक्रिय',
  saveUpiBtn: 'सेव',
  acceptedAppsLabel: 'स्वीकृत भुगतान ऐप्स (Accepted Apps):',
  printStandeeActionBtn: 'दुकान के लिए स्टेंडी प्रिंट करें',
  bharatUpiQrTitle: 'BHARAT UPI QR',
  zeroExtraChargeNotice: 'शून्य अतिरिक्त चार्ज • डायरेक्ट बैंक खाता',
  uploadCustomQrTitle: 'अपना QR कोड अपलोड करें',
  uploadCustomQrSub: 'PhonePe, Paytm, GPay या बैंक QR की फोटो अपलोड करें',
  dragDropQrText: 'QR फोटो चुनें या यहां ड्रैग करें (PNG/JPG)',
  customQrActiveBadge: 'कस्टम QR सक्रिय',
  autoGenQrBadge: 'ऑटो UPI QR सक्रिय',
  removeCustomQrBtn: 'कस्टम QR हटाएं',
  useAutoQrBtn: 'ऑटो UPI QR पर स्विच करें',
  useUploadedQrBtn: 'अपलोड किए गए QR पर स्विच करें',
  qrUploadNotice: 'यह QR कोड गूगल शीट के Settings टैब में ऑटोमैटिक सुरक्षित रहेगा।',
  toggleLanguagePrompt: 'भाषा बदलें (Switch Language)',
  connectedGoogleSheet: 'कनेक्टेड गूगल शीट:',
  manualSyncBtn: 'सिंक अभी करें',
  settingsBtn: 'सेटिंग्स',
  sheetBullet1Title: '100% डेटा सुरक्षा',
  sheetBullet1Desc: 'आपका बही खाता गूगल ड्राइव में सुरक्षित रहता है।',
  sheetBullet2Title: 'मल्टी-डिवाइस एक्सेस',
  sheetBullet2Desc: 'कंप्यूटर या दूसरे मोबाइल से भी शीट देखें।',
  sheetBullet3Title: 'ऑटोमैटिक बैकअप',
  sheetBullet3Desc: 'हर नए लेन-देन पर शीट अपने आप सिंक होती है।',
  disconnectSheetBtn: 'गूगल शीट डिस्कनेक्ट करें',
  disconnectSheetConfirm: 'क्या आप सच में गूगल शीट डिस्कनेक्ट करना चाहते हैं?',
  exportCsvBtnTitle: 'Export to Excel / CSV',
  exportCsvBtnSub: 'स्प्रेडशीट में लेजर डाउनलोड करें',
  downloadJsonBtnTitle: 'Download Full JSON Backup',
  downloadJsonBtnSub: 'कंप्लीट ऑफलाइन बैकअप फाइल',
  restoreBackupTitle: 'बैकअप रीस्टोर करें:',
  restoreBackupSub: 'पहले से डाउनलोड की गई बैकअप फाइल से हिसाब वापस लाएं।',
  uploadBackupFileBtn: 'बैकअप फाइल अपलोड करें',
  appFootnote1: 'डिजिटल उधार बही खाता • क्लाउड एडिशन',
  appFootnote2: '100% फ्री, सुरक्षित और भरोसेमंद • डायरेक्ट गूगल शीट सिंक',
  langSelectLabel: 'पसंदीदा भाषा चुनें (Select App Language):',
  langHindiOption: 'हिंदी (Hindi)',
  langEnglishOption: 'English (अंग्रेजी)',
  langNotice: 'वर्तमान भाषा: हिंदी। ऐप के सभी स्क्रीन, बटन और रसीदें हिंदी में प्रदर्शित हैं।',

  // Calendar Picker Modal
  calendarModalTitle: 'तारीख चुनें',
  calendarModalSub: 'उस दिन का हिसाब और लेन-देन देखें',
  clearFilterBtn: 'फ़िल्टर हटाएं',
  quickFilterToday: 'आज',
  quickFilterYesterday: 'कल',
  quickFilterThisMonth: 'इस महीने',
  quickFilterAll: 'सभी दिन',
  legendHasTx: 'लेन-देन दर्ज है',
  legendSelected: 'चुनी गई तारीख',
  dateSummaryLabel: 'तारीख का हिसाब',
  noTxOnDate: 'इस तारीख को कोई लेन-देन नहीं हुआ',

  // Statement Modal
  statementModalTitle: 'बही खाता स्टेटमेंट',
  statementModalSub: 'ग्राहक हिसाब पर्ची और खाता विवरणी',
  customerStatementFor: 'ग्राहक विवरण:',
  billPeriod: 'अवधि:',
  printInvoiceBtn: 'प्रिंट स्टेटमेंट',
  shareWhatsAppBtn: 'व्हाट्सएप पर भेजें',
  netBalanceSummary: 'कुल बाकी हिसाब:',
  closingBalance: 'अंतिम शेष:',

  // Sheet Modal
  sheetModalTitle: 'गूगल शीट ऑटो-सिंक सेटअप',
  sheetModalSub: 'अपने गूगल ड्राइव से सीधा सुरक्षित बैकअप',
  step1Title: 'चरण 1: गूगल शीट कॉपी करें',
  step2Title: 'चरण 2: Apps Script वेब ऐप डिप्लॉय करें',
  step3Title: 'चरण 3: वेब ऐप URL यहां पेस्ट करें',
  scriptUrlPlaceholder: 'https://script.google.com/macros/s/.../exec',
  connectSheetBtn: 'शीट कनेक्ट करें',
  testConnectionBtn: 'टेस्ट एवं सेव करें'
};

const ENGLISH_TRANSLATIONS: Translations = {
  // Navigation & General
  dashboard: 'Dashboard',
  customers: 'Customers',
  customerList: 'Customer List',
  customerListHeading: 'Customer Ledger Book',
  customerListSub: 'Complete transaction history and credit tracker',
  dukaan: 'Shop',
  profile: 'Profile',
  today: 'Today',
  yesterday: 'Yesterday',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  close: 'Close',
  search: 'Search...',
  all: 'All',
  active: 'Active',
  offline: 'Offline',
  connected: 'Connected',
  notConnected: 'Not Connected',
  synced: 'Synced',
  syncing: 'Syncing...',
  print: 'Print',
  download: 'Download',
  update: 'Update',
  sheetConnected: 'Sheet Connected',
  sheetNotConnected: 'Sheet Not Connected',
  lastSynced: 'Last Synced:',
  change: 'Change',
  remove: 'Remove',
  reset: 'Reset',
  calendar: 'Calendar',
  date: 'Date',

  // Header
  todayDate: 'Today',
  sheetSyncedTooltip: 'Google Sheet Synced: Tap to configure',
  sheetUnsyncedTooltip: 'Link Google Sheet for Cloud Backup',

  // Dashboard
  todayFocus: 'Today focus',
  namaste: 'Welcome',
  vyapari: 'Merchant',
  marketDue: 'Total Market Due (You will receive)',
  dueCustomersCount: 'Due Customers',
  recoveryRate: 'Recovery Rate',
  jamaVsUdhar: 'Received vs Credit',
  quickAddCust: 'Add Customer',
  openAccount: 'Open Account',
  quickSheet: 'Google Sheet',
  cloudBackup: 'Cloud Backup',
  quickPaymentQr: 'Payment QR',
  upiStandee: 'UPI Standee',
  quickStatement: 'Ledger Book',
  pdfReport: 'PDF Report',
  youWillGet: 'You Will Get',
  youWillGive: 'You Will Give',
  totalReceived: 'Total Received',
  totalGave: 'Total Given',
  dueList: 'Due List',
  advanceList: 'Advance List',
  cashUpiCollection: 'Cash / UPI collection',
  creditSalesVolume: 'Credit sales volume',
  topDueHeading: 'Top Due Customers (Send Reminder)',
  seeAll: 'View All',
  sendReminder: 'Reminder',
  scheduleAndRecent: 'Today schedule & Recent Activity',
  organizeDay: 'Organize your day • Recent activity',
  allCustomersBtn: 'All Customers',
  businessStreak: 'Business Streak & Insights',
  liveHealth: 'Live Health',
  recoveryCol: 'Recovery',
  totalJamaCol: 'Total Received',
  grahakCol: 'Customers',
  udharDiya: 'Credit Given',
  jamaHua: 'Payment Received',

  // Customer List
  customerLedgerTitle: 'Customer Ledger Book',
  customerLedgerSub: 'Complete transaction history and credit tracker',
  searchPlaceholder: 'Search by name or phone number...',
  calendarBtn: 'Calendar',
  filterByDate: 'Filter by date',
  addCustomerBtn: '+ Add Customer',
  selectedDateBanner: 'Selected Date:',
  selectedDateLabel: 'Date',
  changeDateBtn: 'Change Date',
  removeFilterBtn: 'Clear Filter',
  customersWithTx: 'customers with transactions',
  filterAll: 'All',
  filterDue: 'You Will Get',
  filterAdvance: 'You Will Give',
  filterSettled: 'Settled',
  sortDueHighLow: 'Highest Due (High to Low)',
  sortHighBalance: 'Highest Due (High to Low)',
  sortRecent: 'Recent Activity',
  sortName: 'Name (A to Z)',
  noCustomerTitle: 'No customers found',
  noCustomerDesc: 'No records found matching this category.',
  noCustomerFound: 'No records found',
  noRecordOnDate: 'No transactions found on:',
  noRecordInCategory: 'No customers found in this category.',
  resetDateFilter: 'View All Dates (Reset)',
  connectSheetPromptTitle: 'Connect Google Sheet',
  connectSheetPromptDesc: 'Your ledger automatically syncs directly with Google Sheets. Connect your sheet to get started.',
  connectSheetPrompt: 'Connect Google Sheet',
  connectSheetDesc: 'Your ledger automatically syncs directly with Google Sheets. Connect your sheet to get started.',
  connectSheetActionBtn: 'Connect Sheet',
  emptyResetDate: 'View All Dates (Reset)',
  totalCustomersLabel: 'Total Customers:',
  duePill: 'You Will Get',
  advancePill: 'You Will Give',
  settledPill: 'Settled',

  // Customer Detail
  backToList: 'Back to Customer List',
  backToListBtn: 'Back to Customer List',
  sendWaReminderBtn: 'Send WhatsApp Reminder',
  takazaBtn: 'Reminder',
  statementBtn: 'Statement / Print Ledger',
  editCustBtn: 'Edit Customer Details',
  deleteCustBtn: 'Delete Customer',
  totalDueBanner: 'You Will Get (Total Due)',
  advanceBanner: 'You Will Give (Advance Balance)',
  settledBanner: 'Settled (Zero Balance)',
  totalGaveSummary: 'Total Given',
  totalReceivedSummary: 'Total Received',
  totalGaveAllTimeLabel: 'Total Given',
  totalReceivedAllTimeLabel: 'Total Received',
  txFilterAll: 'All Transactions',
  txFilterGave: 'You Gave',
  txFilterReceived: 'You Received',
  iGaveFilter: 'You Gave',
  iGotFilter: 'You Received',
  txHistoryLabel: 'Transaction History',
  lenDenHistory: 'Transaction History',
  noTxTitle: 'No transactions recorded yet',
  noTxDesc: 'Record entries using "You Gave" or "You Received" buttons below.',
  noTransactionsYet: 'No transactions recorded yet',
  noTransactionsPrompt: 'Record entries using "You Gave" or "You Received" buttons below.',
  balanceRemaining: 'Balance:',
  balanceLabel: 'Balance',
  btnMaineDiye: 'YOU GAVE ₹',
  btnMaineLiye: 'YOU RECEIVED ₹',
  maineDiyeBtn: 'YOU GAVE ₹',
  maineLiyeBtn: 'YOU RECEIVED ₹',
  deleteCustomerConfirm: 'Are you sure you want to delete this customer?',
  deleteTxConfirm: 'Are you sure you want to delete this transaction?',

  // Transaction Modal
  txModalTitleEdit: 'Edit Transaction Entry',
  txModalTitleGave: 'You Gave (Credit)',
  txModalTitleReceived: 'You Received (Payment)',
  editTxTitle: 'Edit Entry',
  addGaveTxTitle: 'You Gave (Credit Given)',
  addReceivedTxTitle: 'You Received (Payment Received)',
  txToggleGave: 'You Gave (-)',
  txToggleReceived: 'You Received (+)',
  amountLabel: 'Amount (in ₹) *',
  noteLabel: 'Note / Bill Details (Optional)',
  notePlaceholder: 'e.g., Rice 5kg, Bill #41, cash payment...',
  dateLabel: 'Date',
  saveTxBtn: 'Save Entry',
  updateTxBtn: 'Update Entry',
  saveEntryBtn: 'Save Entry',
  updateEntryBtn: 'Update Entry',

  // Customer Modal
  custModalTitleAdd: 'Add New Customer',
  custModalTitleEdit: 'Edit Customer Information',
  addCustomerTitle: 'Add New Customer',
  editCustomerTitle: 'Edit Customer Information',
  custModalSub: 'For account tracking and ledger records',
  addCustomerSub: 'For account tracking and ledger records',
  custNameLabel: 'Customer Name *',
  customerNameLabel: 'Customer Name *',
  custNamePlaceholder: 'e.g. Ramesh Kumar, Sunita Devi...',
  customerNamePlaceholder: 'e.g. Ramesh Kumar, Sunita Devi...',
  custNameRequired: 'Please enter customer name.',
  nameReqError: 'Please enter customer name.',
  custPhoneLabel: 'Mobile Number (Phone) *',
  phoneLabel: 'Mobile Number (Phone) *',
  custPhoneRequired: '10-digit mobile number',
  custPhoneHelp: 'Required for WhatsApp reminders & direct calls',
  phoneHelpText: 'Required for WhatsApp reminders & direct calls',
  custAddressLabel: 'Address or Shop Location (Optional)',
  addressLabel: 'Address or Shop Location (Optional)',
  custAddressPlaceholder: 'e.g. Shop #12 Main Market, Colony...',
  addressPlaceholder: 'e.g. Shop #12 Main Market, Colony...',
  saveCustBtn: 'Add Customer',
  updateCustBtn: 'Update Customer',
  addCustomerModalBtn: 'Add Customer',
  updateCustomerBtn: 'Update Customer',

  // Dukaan / Profile
  dukaanOwner: 'Owner:',
  secBusinessTitle: 'Shop & Merchant Profile',
  secBusinessSub: 'Business name, owner contact, address and category',
  secBusinessBadge: 'Profile',
  secPaymentTitle: 'Payment QR & Bharat UPI Standee',
  secPaymentSub: 'Merchant UPI QR code and printable standee',
  secPaymentBadge: 'UPI',
  secSheetTitle: 'Google Sheet Cloud Sync Hub',
  secSheetSub: 'Google Drive auto-backup & multi-device access',
  secSheetBadge: 'Cloud',
  secBackupTitle: 'Data Backup & Excel Export Tools',
  secBackupSub: 'Excel CSV download • Offline JSON backup restore',
  secBackupBadge: 'Export',
  secLanguageTitle: 'Language Settings / भाषा सेटिंग',
  secLanguageSub: 'Choose app language in Hindi or English',
  secLanguageBadge: 'Language',
  showDetails: 'View',
  hideDetails: 'Hide',
  fieldShopName: 'Shop / Business Name',
  fieldOwnerName: 'Merchant / Owner Name',
  fieldPhone: 'Mobile Number',
  fieldCategory: 'Business Category',
  fieldAddress: 'Shop Address',
  billInfoNotice: 'This information appears on customer statements and bills',
  editDetailsBtn: 'Edit Details',
  editShopHeader: 'Edit Shop Information',
  cancelEditBtn: 'Cancel',
  saveProfileBtn: 'Save & Update',
  upiIdLabel: 'Merchant UPI ID',
  changeUpiBtn: 'Change',
  upiActiveBadge: 'Active',
  saveUpiBtn: 'Save',
  acceptedAppsLabel: 'Accepted Payment Apps:',
  printStandeeActionBtn: 'Print Standee for Shop',
  bharatUpiQrTitle: 'BHARAT UPI QR',
  zeroExtraChargeNotice: 'Zero Extra Charge • Direct Bank Settlement',
  uploadCustomQrTitle: 'Upload Your Custom QR Code',
  uploadCustomQrSub: 'Upload photo of your PhonePe, Paytm, GPay or Bank QR standee',
  dragDropQrText: 'Choose QR image or drag & drop here (PNG/JPG)',
  customQrActiveBadge: 'Custom QR Active',
  autoGenQrBadge: 'Auto UPI QR Active',
  removeCustomQrBtn: 'Remove Custom QR',
  useAutoQrBtn: 'Switch to Auto UPI QR',
  useUploadedQrBtn: 'Switch to Uploaded QR',
  qrUploadNotice: 'This QR code is automatically backed up in the Settings tab of your Google Sheet.',
  toggleLanguagePrompt: 'Switch Language',
  connectedGoogleSheet: 'Connected Google Sheet:',
  manualSyncBtn: 'Sync Now',
  settingsBtn: 'Settings',
  sheetBullet1Title: '100% Data Security',
  sheetBullet1Desc: 'Your ledger is safely stored in your Google Drive.',
  sheetBullet2Title: 'Multi-Device Access',
  sheetBullet2Desc: 'Access your accounts anytime from mobile or PC.',
  sheetBullet3Title: 'Automatic Backup',
  sheetBullet3Desc: 'Auto-syncs on every new transaction entry.',
  disconnectSheetBtn: 'Disconnect Google Sheet',
  disconnectSheetConfirm: 'Are you sure you want to disconnect Google Sheet?',
  exportCsvBtnTitle: 'Export to Excel / CSV',
  exportCsvBtnSub: 'Download entire ledger in spreadsheet format',
  downloadJsonBtnTitle: 'Download Full JSON Backup',
  downloadJsonBtnSub: 'Complete offline backup file',
  restoreBackupTitle: 'Restore Backup:',
  restoreBackupSub: 'Restore your accounts from a previously downloaded backup file.',
  uploadBackupFileBtn: 'Upload Backup File',
  appFootnote1: 'Digital Udhar Bahi Khata • Cloud Edition',
  appFootnote2: '100% Free, Safe & Secure Ledger • Direct Google Sheet Sync',
  langSelectLabel: 'Select Application Language:',
  langHindiOption: 'हिंदी (Hindi)',
  langEnglishOption: 'English',
  langNotice: 'Current Language: English. All screens, buttons and statements are displayed in English.',

  // Calendar Picker Modal
  calendarModalTitle: 'Select Date',
  calendarModalSub: 'View ledger summary and transactions for a specific date',
  clearFilterBtn: 'Clear Filter',
  quickFilterToday: 'Today',
  quickFilterYesterday: 'Yesterday',
  quickFilterThisMonth: 'This Month',
  quickFilterAll: 'All Days',
  legendHasTx: 'Has Transactions',
  legendSelected: 'Selected Date',
  dateSummaryLabel: 'Date Summary',
  noTxOnDate: 'No transactions recorded on this date',

  // Statement Modal
  statementModalTitle: 'Customer Ledger Statement',
  statementModalSub: 'Official statement and bill breakdown',
  customerStatementFor: 'Customer Details:',
  billPeriod: 'Period:',
  printInvoiceBtn: 'Print Statement',
  shareWhatsAppBtn: 'Share on WhatsApp',
  netBalanceSummary: 'Net Balance Due:',
  closingBalance: 'Closing Balance:',

  // Sheet Modal
  sheetModalTitle: 'Google Sheet Auto-Sync Setup',
  sheetModalSub: 'Direct cloud backup to your personal Google Drive',
  step1Title: 'Step 1: Make a copy of Google Sheet',
  step2Title: 'Step 2: Deploy Apps Script Web App',
  step3Title: 'Step 3: Paste Web App URL here',
  scriptUrlPlaceholder: 'https://script.google.com/macros/s/.../exec',
  connectSheetBtn: 'Connect Sheet',
  testConnectionBtn: 'Test & Save'
};

const STORAGE_KEY = 'okcredit_app_lang';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Active language signal ('hi' by default, or 'en')
  readonly currentLanguage = signal<LanguageCode>('hi');

  // Computed translations dictionary
  readonly t = computed<Translations>(() => {
    return this.currentLanguage() === 'hi' ? HINDI_TRANSLATIONS : ENGLISH_TRANSLATIONS;
  });

  constructor() {
    if (this.isBrowser) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode;
        if (saved === 'hi' || saved === 'en') {
          this.currentLanguage.set(saved);
        }
      } catch {
        // fallback
      }
    }
  }

  setLanguage(lang: LanguageCode): void {
    this.currentLanguage.set(lang);
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // fallback
      }
    }
  }

  toggleLanguage(): void {
    const nextLang = this.currentLanguage() === 'hi' ? 'en' : 'hi';
    this.setLanguage(nextLang);
  }
}
