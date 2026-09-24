/**
 * DOM Translator for Clinical Screening Report
 * --------------------------------------------
 * Dynamically translates static strings on the clinical report page
 * without mutating the underlying component source code.
 * 
 * Supports complete localized rendering in:
 *   - English (Original)
 *   - हिन्दी (Hindi)
 *   - ગુજરાતી (Gujarati)
 * 
 * Invariant: Preserves core medicine names and scientific acronyms in English.
 */

import { SupportedLanguage } from './reportTranslations';

export const COMPREHENSIVE_TRANSLATION_MAP: Record<string, { hi: string; gu: string }> = {
  // 1. Header & Letterhead
  "Clinical Retinal Tele-Screening": {
    hi: "क्लिनिकल रेटिना टेली-स्क्रीनिंग",
    gu: "ક્લિનિકલ રેટિના ટેલિ-સ્ક્રીનિંગ"
  },
  "Diagnostic Deep Learning Assessment Report": {
    hi: "डायग्नोस्टिक डीप लर्निंग मूल्यांकन रिपोर्ट",
    gu: "ડાયગ્નોસ્ટિક ડીપ લર્નિંગ મૂલ્યાંકન અહેવાલ"
  },
  "Report Date:": {
    hi: "रिपोर्ट दिनांक:",
    gu: "અહેવાલ તારીખ:"
  },
  "Verification Reference:": {
    hi: "सत्यापन संदर्भ:",
    gu: "ચકાસણી સંદર્ભ:"
  },
  "Clinical Center:": {
    hi: "क्लिनिकल सेंटर:",
    gu: "ક્લિનિકલ કેન્દ્ર:"
  },

  // 2. Patient Demographics & Profile
  "Patient Name": {
    hi: "मरीज़ का नाम",
    gu: "દર્દીનું નામ"
  },
  "ID / Age / Sex": {
    hi: "आईडी / उम्र / लिंग",
    gu: "આઈડી / ઉંમર / લિંગ"
  },
  "Contact": {
    hi: "संपर्क नंबर",
    gu: "સંપર્ક નંબર"
  },
  "Screening Ref": {
    hi: "स्क्रीनिंग संदर्भ",
    gu: "સ્ક્રીનિંગ સંદર્ભ"
  },
  "Diabetes Profile": {
    hi: "डायबिटीज प्रोफाइल",
    gu: "ડાયાબિટીસ પ્રોફાઇલ"
  },
  "Current Regimen": {
    hi: "वर्तमान उपचार",
    gu: "હાલની સારવાર"
  },
  "Glycemic Status": {
    hi: "ग्लूकोज स्थिति",
    gu: "શુગર સ્થિતિ"
  },
  "Visual Acuity": {
    hi: "दृष्टि तीक्ष्णता (Visual Acuity)",
    gu: "દ્રષ્ટિ ક્ષમતા (Visual Acuity)"
  },
  "Oral Medication": {
    hi: "मौखिक दवा (Oral)",
    gu: "મોં વાટે લેવાતી દવા (Oral)"
  },
  "Insulin": {
    hi: "इंसुलिन (Insulin)",
    gu: "ઇન્સ્યુલિન (Insulin)"
  },
  "Type 2 Diabetes": {
    hi: "टाइप 2 डायबिटीज (T2D)",
    gu: "ટાઇપ 2 ડાયાબિટીસ (T2D)"
  },
  "Type 1 Diabetes": {
    hi: "टाइप 1 डायबिटीज (T1D)",
    gu: "ટાઇપ 1 ડાયાબિટીસ (T1D)"
  },
  "Fast:": {
    hi: "उपवास (Fasting):",
    gu: "ભૂખ્યા પેટે (Fasting):"
  },
  "PP:": {
    hi: "भोजन उपरांत (PP):",
    gu: "જમ્યા પછી (PP):"
  },
  "OD (Right):": {
    hi: "दाहिनी आंख (OD):",
    gu: "જમણી આંખ (OD):"
  },
  "OS (Left):": {
    hi: "बाईं आंख (OS):",
    gu: "ડાબી આંખ (OS):"
  },
  "Patient Visits:": {
    hi: "मरीज़ विज़िट्स:",
    gu: "દર્દી મુલાકાતો:"
  },

  // 3. Primary Diagnostic Grade Alert
  "Current Screening Diagnostic Grading": {
    hi: "वर्तमान स्क्रीनिंग डायग्नोस्टिक ग्रेडिंग",
    gu: "હાલનું સ્ક્રીનિંગ ડાયગ્નોસ્ટિક ગ્રેડિંગ"
  },
  "CONFIDENCE:": {
    hi: "विश्वास स्तर:",
    gu: "વિશ્વાસ સ્તર:"
  },
  "ENGINE:": {
    hi: "एआई इंजन:",
    gu: "એઆઈ એન્જિન:"
  },
  "Grade 0: Normal / No DR": {
    hi: "ग्रेड 0: सामान्य / कोई रेटिनोपैथी नहीं",
    gu: "ગ્રેડ 0: સામાન્ય / કોઈ રેટિનોપેથી નથી"
  },
  "Grade 1: Mild NPDR": {
    hi: "ग्रेड 1: हल्की रेटिनोपैथी",
    gu: "ગ્રેડ 1: હળવી રેટિનોપેથી"
  },
  "Grade 2: Moderate NPDR": {
    hi: "ग्रेड 2: मध्यम रेटिनोपैथी",
    gu: "ગ્રેડ 2: મધ્યમ રેટિનોપેથી"
  },
  "Grade 3: Severe NPDR": {
    hi: "ग्रेड 3: गंभीर रेटिनोपैथी",
    gu: "ગ્રેડ 3: ગંભીર રેટિનોપેથી"
  },
  "Grade 4: Proliferative DR": {
    hi: "ग्रेड 4: अत्यधिक गंभीर प्रोलिफेरेटिव रेटिनोपैथी",
    gu: "ગ્રેડ 4: અત્યંત ગંભીર પ્રોલિફેરેટિવ રેટિનોપેથી"
  },
  "NON-REFERABLE (Observe)": {
    hi: "नॉन-रेफ़रेबल (निगरानी रखें)",
    gu: "બિન-રેફરેબલ (દેખરેખ રાખો)"
  },
  "REFERABLE (Referral Required)": {
    hi: "रेफ़रेबल (विशेषज्ञ परामर्श आवश्यक)",
    gu: "રેફરેબલ (નિષ્ણાત સારવાર જરૂરી)"
  },
  "CLINICAL ACTION TRIGGERED:": {
    hi: "सक्रिय क्लिनिकल निर्देश:",
    gu: "સક્રિય ક્લિનિકલ નિર્દેશ:"
  },
  "IMMEDIATE VITREORETINAL CONSULTATION MANDATORY": {
    hi: "तत्काल रेटिना विशेषज्ञ परामर्श अनिवार्य",
    gu: "તાત્કાલિક રેટિના નિષ્ણાત તપાસ અનિવાર્ય"
  },

  // 4. Clinical Imaging & AI Diagnostic Findings
  "Primary Retinal Biomarker & Heatmap Visualization": {
    hi: "प्राथमिक रेटिना बायोमार्कर एवं हीटमैप विज़ुअलाइज़ेशन",
    gu: "પ્રાથમિક રેટિના બાયોમાર્કર અને હીટમેપ ચિત્રણ"
  },
  "Deep Learning Attention Map (Grad-CAM)": {
    hi: "डीप लर्निंग अटेंशन मैप (Grad-CAM)",
    gu: "ડીપ લર્નિંગ અટેન્શન મેપ (Grad-CAM)"
  },
  "Fundus Angiography Simulation / Green Channel": {
    hi: "फंडस एंजियोग्राफी सिमुलेशन / ग्रीन चैनल",
    gu: "ફંડસ એન્જિયોગ્રાફી સિમ્યુલેશન / ગ્રીન ચેનલ"
  },
  "Bilateral Comparison & Longitudinal Progression": {
    hi: "तुलनात्मक विश्लेषण एवं अनुदैर्ध्य प्रगति",
    gu: "તુલનાત્મક વિશ્લેષણ અને સમય આધારિત પ્રગતિ"
  },
  "Baseline Fundus (Reference)": {
    hi: "बेसलाइन फंडस (प्रारंभिक संदर्भ)",
    gu: "બેઝલાઇન ફંડસ (પ્રારંભિક સંદર્ભ)"
  },
  "Current Scan (Follow-Up)": {
    hi: "वर्तमान स्कैन (अनुवर्ती जाँच)",
    gu: "હાલનું સ્કેન (ફોલો-અપ તપાસ)"
  },
  "Progression Analysis:": {
    hi: "प्रगति विश्लेषण:",
    gu: "પ્રગતિ વિશ્લેષણ:"
  },
  "No significant microvascular degradation detected compared to baseline.": {
    hi: "बेसलाइन की तुलना में कोई महत्वपूर्ण सूक्ष्म संवहनी गिरावट नहीं पाई गई।",
    gu: "બેઝલાઇનની સરખામણીમાં કોઈ નોંધપાત્ર સૂક્ષ્મ રક્તવાહિની બગાડ જોવા મળ્યો નથી."
  },
  "Vascular Changes:": {
    hi: "रक्तवाहिका परिवर्तन:",
    gu: "રક્તવાહિની ફેરફાર:"
  },
  "Stable caliber and arcade branch distribution.": {
    hi: "स्थिर व्यास और शाखा वितरण।",
    gu: "સ્થિર વ્યાસ અને નળીઓનું યોગ્ય વિતરણ."
  },
  "Microaneurysm Turnover:": {
    hi: "माइक्रोएन्यूरिज्म टर्नओवर:",
    gu: "માઇક્રોએન્યુરિઝમ ટર્નઓવર:"
  },
  "Turnover Rate:": {
    hi: "टर्नओवर दर:",
    gu: "ટર્નઓવર દર:"
  },
  "Hemorrhage Count:": {
    hi: "रक्तस्राव गणना:",
    gu: "હેમરેજ ગણતરી:"
  },
  "Exudate Burden:": {
    hi: "एक्सयूडेट भार:",
    gu: "એક્સ્યુડેટ જથ્થો:"
  },

  // 5. Macular Health & Clinical Findings Table
  "Biomarker / Finding": {
    hi: "बायोमार्कर / नैदानिक निष्कर्ष",
    gu: "બાયોમાર્કર / ક્લિનિકલ તારણો"
  },
  "Observed Status": {
    hi: "परीक्षित स्थिति",
    gu: "તપાસાયેલ સ્થિતિ"
  },
  "Clinical Significance": {
    hi: "नैदानिक महत्व",
    gu: "ક્લિનિકલ મહત્વ"
  },
  "Optic Disc & Cup-to-Disc Ratio": {
    hi: "ऑप्टिक डिस्क एवं कप-टू-डिस्क अनुपात (CDR)",
    gu: "ઓપ્ટિક ડિસ્ક અને કપ-ટુ-ડિસ્ક રેશિયો (CDR)"
  },
  "Optic Cup-to-Disc Ratio (CDR)": {
    hi: "ऑप्टिक कप-टू-डिस्क अनुपात (CDR)",
    gu: "ઓપ્ટિક કપ-ટુ-ડિસ્ક રેશિયો (CDR)"
  },
  "Normal Physiologic Margins": {
    hi: "सामान्य शारीरिक सीमा",
    gu: "સામાન્ય શારીરિક મર્યાદા"
  },
  "Neuroretinal rim intact; no glaucomatous excavation": {
    hi: "न्यूरोरेटिनल रिम सुरक्षित; ग्लूकोमा संकेत अनुपस्थित",
    gu: "ન્યુરોરેટિનલ રિમ અકબંધ; ગ્લુકોમાના લક્ષણ નથી"
  },
  "Macular Integrity & Foveal Reflex": {
    hi: "मैकुलर अखंडता एवं फोवियल रिफ्लेक्स",
    gu: "મેક્યુલર અખંડિતતા અને ફોવિયલ પ્રતિબિંબ"
  },
  "Intact Foveal Avascular Zone": {
    hi: "सुरक्षित फोवियल एवास्कुलर ज़ोन (FAZ)",
    gu: "સુરક્ષિત ફોવિયલ એવાસ્ક્યુલર ઝોન (FAZ)"
  },
  "No clinically evident exudation or cystic elevation in center": {
    hi: "केंद्र में कोई स्पष्ट एक्सयूडेशन या सिस्टिक सूजन नहीं",
    gu: "કેન્દ્રમાં કોઈ સોજો કે પ્રવાહી જમાવટ નથી"
  },
  "Macular Edema Risk Assessment": {
    hi: "मैकुलर एडिमा जोखिम मूल्यांकन",
    gu: "મેક્યુલર એડીમા જોખમ આકલન"
  },
  "Vessel Arborization": {
    hi: "रक्तवाहिका संरचना",
    gu: "રક્તવાહિની સંરચના"
  },
  "Arcades & Caliber Checked": {
    hi: "धमनी एवं शिरा कैलिबर परीक्षण",
    gu: "ધમની અને શિરા વ્યાસ તપાસ"
  },
  "Optic disc & foveal centration": {
    hi: "ऑप्टिक डिस्क एवं फोविया संरेखण",
    gu: "ઓપ્ટિક ડિસ્ક અને ફોવિયા કેન્દ્રીકરણ"
  },
  "Normal arborization without focal arteriolar narrowing": {
    hi: "सामान्य संरचना, कोई संकुचन नहीं",
    gu: "સામાન્ય સંરચના, કોઈ સંકોચન નથી"
  },
  "Hard Exudates": {
    hi: "हार्ड एक्सयूडेट्स (Hard Exudates)",
    gu: "હાર્ડ એક્સ્યુડેટ્સ (Hard Exudates)"
  },
  "Microaneurysms": {
    hi: "माइक्रोएन्यूरिज्म (Microaneurysms)",
    gu: "માઇક્રોએન્યુરિઝમ (Microaneurysms)"
  },
  "Hemorrhages": {
    hi: "रेटिनल रक्तस्राव (Hemorrhages)",
    gu: "રેટિનલ રક્તસ્રાવ (Hemorrhages)"
  },
  "Cotton Wool Spots": {
    hi: "कॉटन वूल स्पॉट्स (Cotton Wool Spots)",
    gu: "કોટન વૂલ સ્પોટ્સ (Cotton Wool Spots)"
  },
  "Neovascularization": {
    hi: "नियोवैस्कुलराइजेशन (Neovascularization)",
    gu: "નિયોવેસ્ક્યુલરાઇઝેશન (Neovascularization)"
  },

  // 6. Evidence-Based Health & Lifestyle Measures
  "Evidence-Based Health & Supportive Lifestyle Measures": {
    hi: "साक्ष्य-आधारित स्वास्थ्य एवं जीवनशैली उपाय",
    gu: "પુરાવા-આધારિત આરોગ્ય અને જીવનશૈલી પગલાં"
  },
  "Physical Activity & Exercise": {
    hi: "शारीरिक गतिविधि एवं व्यायाम",
    gu: "શારીરિક પ્રવૃત્તિ અને કસરત"
  },
  "Dietary & Glycemic Management": {
    hi: "आहार एवं रक्त शर्करा प्रबंधन",
    gu: "આહાર અને બ્લડ શુગર નિયંત્રણ"
  },
  "Monitoring & Surveillance": {
    hi: "निगरानी एवं अनुवर्ती जाँच (Monitoring)",
    gu: "નિયમિત દેખરેખ અને તપાસ (Monitoring)"
  },
  "Systemic Risk Factor Targets": {
    hi: "प्रणालीगत जोखिम कारक लक्ष्य (BP/Lipids)",
    gu: "પ્રણાલીગત જોખમ પરિબળ લક્ષ્યાંકો (BP/Lipids)"
  },
  "Glycemic Tip:": {
    hi: "शर्करा प्रबंधन सलाह:",
    gu: "બ્લડ શુગર ટિપ:"
  },
  "Schedule:": {
    hi: "समय सारणी:",
    gu: "સમયપત્રક:"
  },
  "Blood Pressure:": {
    hi: "रक्तचाप (Blood Pressure):",
    gu: "બ્લડ પ્રેશર (BP):"
  },
  "Lipid Target:": {
    hi: "लिपिड/कोलेस्ट्रॉल लक्ष्य:",
    gu: "લિપિડ/કોલેસ્ટ્રોલ લક્ષ્યાંક:"
  },
  "Focus:": {
    hi: "रोग फोकस:",
    gu: "રોગ ફોકસ:"
  },

  // 7. Relevant Clinical Medications & Pharmacotherapy
  "Relevant Clinical Medications & Pharmacotherapy": {
    hi: "संबंधित चिकित्सीय दवाइयां एवं फार्माकोथेरेपी",
    gu: "સંબંધિત ક્લિનિકલ દવાઓ અને ફાર્માકોથેરાપી"
  },
  "Official Medical Books Reference": {
    hi: "आधिकारिक मेडिकल पाठ्यपुस्तक संदर्भ",
    gu: "સત્તાવાર મેડિકલ પુસ્તક સંદર્ભ"
  },
  "Stage Pharmacological Target:": {
    hi: "रोग अवस्था औषधीय लक्ष्य:",
    gu: "રોગ તબક્કા ઔષધીય લક્ષ્યાંક:"
  },
  "Targeted Ophthalmic Biologics & Intravitreal Pharmacotherapy:": {
    hi: "लक्षित नेत्र बायोलॉजिक्स एवं इंट्राविट्रियल दवाइयां:",
    gu: "લક્ષિત નેત્ર બાયોલોજિક્સ અને ઇન્ટ્રાવિટ્રીયલ દવાઓ:"
  },
  "Systemic Microvascular & Endothelial Protective Pharmacotherapy:": {
    hi: "प्रणालीगत सूक्ष्म संवहनी एवं एंडोथेलियल सुरक्षा दवाइयां:",
    gu: "પ્રણાલીગત સૂક્ષ્મ રક્તવાહિની રક્ષણાત્મક દવાઓ:"
  },
  "Class:": {
    hi: "औषधि वर्ग (Class):",
    gu: "દવા વર્ગ (Class):"
  },
  "Dosing & Route:": {
    hi: "खुराक एवं मार्ग (Dosing & Route):",
    gu: "ડોઝ અને રીત (Dosing & Route):"
  },
  "Dosing & Regimen:": {
    hi: "खुराक एवं नियम (Dosing & Regimen):",
    gu: "ડોઝ અને સમયપત્રક (Dosing & Regimen):"
  },
  "Biological Mechanism:": {
    hi: "जैविक क्रियाविधि (Mechanism):",
    gu: "જૈવિક કાર્યપદ્ધતિ (Mechanism):"
  },
  "Target Mechanism:": {
    hi: "लक्षित क्रियाविधि (Target Mechanism):",
    gu: "લક્ષિત કાર્યપદ્ધતિ (Target Mechanism):"
  },
  "Official Medical Textbook Citation:": {
    hi: "आधिकारिक मेडिकल पाठ्यपुस्तक उद्धरण:",
    gu: "સત્તાવાર મેડિકલ પાઠ્યપુસ્તક સંદર્ભ:"
  },
  "Trial Evidence:": {
    hi: "क्लिनिकल ट्रायल साक्ष्य:",
    gu: "ક્લિનિકલ ટ્રાયલ પુરાવા:"
  },
  "Validation:": {
    hi: "क्लिनिकल सत्यापन:",
    gu: "ક્લિનિકલ ચકાસણી:"
  },
  "OFFICIAL PHARMACOTHERAPY DISCLAIMER:": {
    hi: "आधिकारिक फार्माकोथेरेपी अस्वीकरण:",
    gu: "સત્તાવાર ફાર્માકોથેરાપી ડિસ્ક્લેમર:"
  },

  // 8. Clinical Observations & Directives
  "Clinical Observations & Directives": {
    hi: "चिकित्सीय टिप्पणियाँ एवं निर्देश (Directives)",
    gu: "તબીબી અવલોકનો અને નિર્દેશો (Directives)"
  },
  "Actionable Recommendation": {
    hi: "कार्रवाई योग्य चिकित्सीय सिफारिश",
    gu: "અમલ કરવા યોગ્ય તબીબી ભલામણ"
  },
  "Follow-up Interval": {
    hi: "अनुवर्ती जाँच अंतराल (Follow-up)",
    gu: "ફોલો-અપ તપાસ સમયગાળો"
  },
  "Refer to Ophthalmologist / Vitreoretinal Specialist for detailed macular evaluation.": {
    hi: "विस्तृत मैकुलर परीक्षण हेतु रेटिना विशेषज्ञ से तुरंत परामर्श करें।",
    gu: "વિસ્તૃત મેક્યુલર તપાસ માટે રેટિના નિષ્ણાત ડૉક્ટર પાસે તાત્કાલિક તપાસ કરાવો."
  },
  "Immediate": {
    hi: "तत्काल (Immediate)",
    gu: "તાત્કાલિક (Immediate)"
  },
  "Digitally Verified By": {
    hi: "डिजिटल रूप से सत्यापित",
    gu: "ડિજિટલ રીતે પ્રમાણિત"
  },
  "Signed and verified by licensed specialist": {
    hi: "लाइसेंस प्राप्त विशेषज्ञ द्वारा हस्ताक्षरित एवं सत्यापित",
    gu: "પ્રમાણિત નિષ્ણાત દ્વારા હસ્તાક્ષરિત અને ચકાસાયેલ"
  },
  "Save & Sign": {
    hi: "सहेजें एवं हस्ताक्षर करें",
    gu: "સાચવો અને સહી કરો"
  },
  "Signed & Logged": {
    hi: "सत्यापित एवं दर्ज किया गया",
    gu: "પ્રમાણિત અને સાચવેલ"
  },
  "Audit Trail": {
    hi: "ऑडिट ट्रेल",
    gu: "ઓડિટ ટ્રેઇલ"
  },
  "Print / PDF": {
    hi: "प्रिंट / पीडीएफ",
    gu: "પ્રિન્ટ / પીડીએફ"
  },
  "Retake Retinal Scan": {
    hi: "पुनः स्कैन लें",
    gu: "ફરીથી સ્કેન કરો"
  },
  "Back to Directory": {
    hi: "वापस सूची में जाएं",
    gu: "પાછા ડિરેક્ટરી પર જાઓ"
  },
  "Enter clinical examination notes, pathology remarks...": {
    hi: "क्लिनिकल परीक्षण नोट्स, पैथोलॉजी टिप्पणियां दर्ज करें...",
    gu: "ક્લિનિકલ તપાસ નોંધો, પેથોલોજી વિગતો દાખલ કરો..."
  }
};

const originalTextMap = new WeakMap<Node, string>();

export function applyLanguageToDOM(container: HTMLElement, targetLang: SupportedLanguage) {
  if (!container) return;

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const rawText = node.nodeValue;
    if (!rawText) continue;
    const text = rawText.trim();
    if (!text) continue;

    const parentEl = node.parentElement;
    if (!parentEl) continue;

    // Do not translate code blocks, script tags, style, or the language switcher itself
    if (
      parentEl.closest('.language-switcher-ignore') || 
      parentEl.tagName === 'SCRIPT' || 
      parentEl.tagName === 'STYLE' ||
      parentEl.tagName === 'TEXTAREA' ||
      parentEl.tagName === 'INPUT'
    ) {
      continue;
    }

    let orig = originalTextMap.get(node);
    if (!orig) {
      orig = rawText;
      originalTextMap.set(node, orig);
    }

    if (targetLang === 'en') {
      node.nodeValue = orig;
    } else {
      const trimmedOrig = orig.trim();
      
      // 1. Direct exact dictionary match
      if (COMPREHENSIVE_TRANSLATION_MAP[trimmedOrig]) {
        const translated = COMPREHENSIVE_TRANSLATION_MAP[trimmedOrig][targetLang];
        if (translated) {
          node.nodeValue = orig.replace(trimmedOrig, translated);
          continue;
        }
      }

      // 2. Exact match against known dictionary keys
      for (const [key, val] of Object.entries(COMPREHENSIVE_TRANSLATION_MAP)) {
        if (trimmedOrig === key) {
          node.nodeValue = orig.replace(trimmedOrig, val[targetLang]);
          break;
        }
      }
    }
  }
}
