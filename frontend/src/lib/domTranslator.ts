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
  "Intravitreal Injection": {
    hi: "इंट्राविट्रियल इंजेक्शन",
    gu: "ઇન્ટ્રાવિટ્રીયલ ઇન્જેક્શન"
  },
  "Oral Administration": {
    hi: "मौखिक सेवन (Oral)",
    gu: "મૌખિક સેવન (Oral)"
  },
  "Intravitreal Implant": {
    hi: "इंट्राविट्रियल इम्प्लांट",
    gu: "ઇન્ટ્રાવિટ્રીયલ ઇમ્પ્લાન્ટ"
  },
  "Topical Ophthalmic": {
    hi: "टॉपिकल ऑप्थेलमिक",
    gu: "ટોપિકલ ઓપ્થેલ્મિક"
  },
  "Prescription Rx": {
    hi: "प्रिस्क्रिप्शन दवा",
    gu: "પ્રિસ્ક્રિપ્શન દવા"
  },
  "Clinical Rx": {
    hi: "क्लिनिकल दवा",
    gu: "ક્લિનિકલ દવા"
  },
  "Normal retinal fundus without diabetic microvascular lesions. Primary clinical objective is primary prevention: maintaining tight glycemic, blood pressure, and lipid parameters to prevent the initiation of retinal capillary basement membrane thickening and pericyte apoptosis.": {
    hi: "डायबिटिक माइक्रोवैस्कुलर घावों के बिना सामान्य रेटिना फंडस। प्राथमिक नैदानिक उद्देश्य प्राथमिक रोकथाम है: रेटिना केशिका बेसमेंट मेम्ब्रेन के मोटे होने और पेरिसाइट अपोप्टोसिस को रोकने के लिए सख्त ग्लाइसेमिक, रक्तचाप और लिपिड मापदंडों को बनाए रखना।",
    gu: "ડાયાબિટીક સૂક્ષ્મ રક્તવાહિની ઇજા વિના સામાન્ય રેટિના ફંડસ. પ્રાથમિક ક્લિનિકલ ઉદ્દેશ્ય પ્રાથમિક નિવારણ છે: રેટિના રક્તવાહિની બેઝમેન્ટ મેમ્બ્રેન જાડી થતી અટકાવવા અને પેરીસાઇટ કોષોના રક્ષણ માટે કડક બ્લડ શુગર, બ્લડ પ્રેશર અને લિપિડ નિયંત્રણ જાળવવું."
  },
  "Characterized by the appearance of isolated microaneurysms without hard exudates, cotton-wool spots, or macular thickening. Intravitreal ophthalmic pharmacotherapy is NOT indicated. Focus is on intensive systemic microvascular stabilization to halt disease progression.": {
    hi: "कठोर एक्सयूडेट्स, कॉटन-वूल स्पॉट्स या मैकुलर सूजन के बिना केवल छिटपुट माइक्रोएन्यूरिज्म की उपस्थिति। इंट्राविट्रियल नेत्र फार्माकोथेरेपी की आवश्यकता नहीं है। रोग की प्रगति रोकने हेतु प्राथमिक ध्यान गहन प्रणालीगत सूक्ष्म संवहनी स्थिरीकरण पर है।",
    gu: "હાર્ડ એક્સ્યુડેટ્સ, કોટન-વૂલ સ્પોટ્સ અથવા મેક્યુલર સોજા વિના માત્ર છૂટાછવાયા માઇક્રોએન્યુરિઝમ્સની હાજરી. ઇન્ટ્રાવિટ્રીયલ નેત્ર દવાની જરૂર નથી. રોગની પ્રગતિ અટકાવવા માટે પ્રાથમિક ધ્યાન સઘન પ્રણાલીગત સૂક્ષ્મ રક્તવાહિની સ્થિરતા પર છે."
  },
  "Manifest by multiple microaneurysms, blot/dot retinal hemorrhages, hard lipid exudates, and early cotton-wool spots. Primary goal is stabilizing retinal capillary endothelium, preventing progression to severe ischemic stages, and identifying any early subclinical macular edema via OCT.": {
    hi: "एकाधिक Microaneurysms, Blot/Dot रेटिनल रक्तस्राव, हार्ड लिपिड एक्सयूडेट्स और शुरुआती Cotton-Wool स्पॉट्स द्वारा प्रकट। प्राथमिक लक्ष्य रेटिना केशिका एंडोथेलियम को स्थिर करना, गंभीर इस्केमिक अवस्थाओं में प्रगति रोकना, और OCT द्वारा प्रारंभिक सबक्लिनिकल Macular Edema की पहचान करना है।",
    gu: "અસંખ્ય Microaneurysms, Blot/Dot રેટિનલ હેમરેજ, હાર્ડ લિપિડ એક્સ્યુડેટ્સ અને પ્રારંભિક Cotton-Wool સ્પોટ્સ દ્વારા પ્રગટ. મુખ્ય ધ્યેય રેટિના રક્તવાહિની એન્ડોથેલિયમને સ્થિર રાખવું, ગંભીર ઇસ્કેમિક તબક્કામાં આગળ વધતું અટકાવવું અને OCT દ્વારા પ્રારંભિક સબક્લિનિકલ Macular Edema ની ઓળખ કરવી છે."
  },
  "Extensive retinal microvascular non-perfusion fulfilling the 4:2:1 international clinical rule (>20 intraretinal hemorrhages in 4 quadrants, venous beading in 2+ quadrants, or IRMA in 1+ quadrant). Approximately 50% probability of progressing to Proliferative DR within 12 months without therapeutic intervention.": {
    hi: "व्यापक रेटिना माइक्रोवैस्कुलर गैर-परफ्यूजन जो 4:2:1 अंतरराष्ट्रीय नैदानिक नियम को पूरा करता है (4 चतुर्थांशों में >20 इंट्रा-रेटिनल रक्तस्राव, 2+ में वेनस बीडिंग, या 1+ में IRMA)। चिकित्सकीय हस्तक्षेप के बिना 12 महीनों के भीतर Proliferative DR में बदलने की लगभग 50% संभावना।",
    gu: "વ્યાપક રેટિનલ માઇક્રોવેસ્ક્યુલર નોન-પરફ્યુઝન જે 4:2:1 આંતરરાષ્ટ્રીય ક્લિનિકલ નિયમનું પાલન કરે છે (4 ચતુર્થાંશમાં >20 ઇન્ટ્રારેટિનલ હેમરેજ, 2+ માં વેનસ બીડિંગ, અથવા 1+ માં IRMA). તબીબી સારવાર વગર 12 મહિનામાં Proliferative DR માં પરિવર્તિત થવાની લગભગ 50% સંભાવના."
  },
  "Marked retinal ischemia inducing severe intraocular VEGF upregulation, pre-retinal and/or disc neovascularization (NVD/NVE), and high risk of vitreous hemorrhage or tractional retinal detachment. Urgent intravitreal biologic anti-VEGF therapy is indicated.": {
    hi: "अत्यधिक रेटिना इस्किमिया के कारण Intraocular VEGF में भारी वृद्धि, प्री-रेटिना या डिस्क पर असामान्य नई रक्तवाहिकाएं (NVD/NVE), तथा Vitreous Hemorrhage या Tractional Retinal Detachment का उच्च जोखिम। तत्काल Intravitreal Biologic Anti-VEGF थेरेपी अनुशंसित है।",
    gu: "તીવ્ર રેટિનલ ઇસ્કેમિયાને કારણે Intraocular VEGF માં મોટો વધારો, પ્રી-રેટિનલ અથવા ડિસ્ક પર નવી અસામાન્ય રક્તવાહિનીઓ (NVD/NVE), અને Vitreous Hemorrhage કે રેટિના અલગ પડવાનું ઉચ્ચ જોખમ. તાત્કાલિક Intravitreal Biologic Anti-VEGF સારવાર સૂચવવામાં આવે છે."
  },
  "Soluble Decoy Receptor Fusion Protein (VEGFR-1 & VEGFR-2 fused to human IgG1 Fc)": {
    hi: "घुलनशील डिकॉय रिसेप्टर फ्यूजन प्रोटीन (VEGFR-1 एवं VEGFR-2 फ्यूज्ड टू ह्यूमन IgG1 Fc)",
    gu: "દ્રાવ્ય ડિકોય રીસેપ્ટર ફ્યુઝન પ્રોટીન (VEGFR-1 અને VEGFR-2 ફ્યુઝ્ડ ટુ હ્યુમન IgG1 Fc)"
  },
  "Recombinant Humanized Monoclonal Antibody Fab Fragment": {
    hi: "पुनः संयोजक मानवीकृत मोनोक्लोनल एंटीबॉडी Fab फ्रैगमेंट",
    gu: "રિકોમ્બિનન્ટ હ્યુમનાઇઝ્ડ મોનોક્લોનલ એન્ટિબોડી Fab ફ્રેગમેન્ટ"
  },
  "Renin-Angiotensin-Aldosterone System (RAAS) Antagonist": {
    hi: "Renin-Angiotensin-Aldosterone System (RAAS) एंटागोनिस्ट",
    gu: "Renin-Angiotensin-Aldosterone System (RAAS) એન્ટાગોનિસ્ટ"
  },
  "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) Agonist": {
    hi: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) एगोनिस्ट",
    gu: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) એગોનિસ્ટ"
  },
  "Intravitreal Injection: 2.0 mg (0.05 mL) every 4 weeks for the first 5 doses, then 2.0 mg every 8 weeks (with treat-and-extend flexibility).": {
    hi: "Intravitreal Injection: 2.0 mg (0.05 mL) प्रथम 5 खुराकों के लिए प्रत्येक 4 सप्ताह में, तत्पश्चात प्रत्येक 8 सप्ताह में (Treat-and-extend लचीलेपन के साथ)।",
    gu: "Intravitreal Injection: પ્રથમ 5 ડોઝ માટે દર 4 અઠવાડિયે 2.0 mg (0.05 mL), ત્યારબાદ દર 8 અઠવાડિયે 2.0 mg (Treat-and-extend અનુકૂળતા સાથે)."
  },
  "Intravitreal Injection: 0.5 mg (0.05 mL) for PDR or 0.3 mg (0.05 mL) for DME administered monthly.": {
    hi: "Intravitreal Injection: PDR हेतु 0.5 mg (0.05 mL) या DME हेतु 0.3 mg (0.05 mL) मासिक रूप से।",
    gu: "Intravitreal Injection: PDR માટે 0.5 mg (0.05 mL) અથવા DME માટે 0.3 mg (0.05 mL) દર મહિને."
  },
  "Oral: Lisinopril 10–40 mg PO once daily or Telmisartan 40–80 mg PO once daily.": {
    hi: "Oral: Lisinopril 10–40 mg PO दिन में एक बार या Telmisartan 40–80 mg PO दिन में एक बार।",
    gu: "Oral: Lisinopril 10–40 mg PO દિવસમાં એક વાર અથવા Telmisartan 40–80 mg PO દિવસમાં એક વાર."
  },
  "Oral: Lisinopril 10-40 mg PO once daily or Telmisartan 40-80 mg PO once daily.": {
    hi: "Oral: Lisinopril 10–40 mg PO दिन में एक बार या Telmisartan 40–80 mg PO दिन में एक बार।",
    gu: "Oral: Lisinopril 10–40 mg PO દિવસમાં એક વાર અથવા Telmisartan 40–80 mg PO દિવસમાં એક વાર."
  },
  "Oral: 145 mg to 200 mg PO once daily with meals.": {
    hi: "Oral: भोजन के साथ दिन में एक बार 145 mg से 200 mg PO।",
    gu: "Oral: જમવાની સાથે દિવસમાં એક વાર 145 mg થી 200 mg PO."
  },
  "Acts as an all-isoform decoy receptor binding VEGF-A, VEGF-B, and Placental Growth Factor (PlGF) with picomolar affinity (Kd ~0.5 pM), completely preventing endothelial VEGFR activation, inhibiting abnormal neovascularization, and sealing hyperpermeable capillaries.": {
    hi: "सभी आइसोफॉर्म डिकॉय रिसेप्टर के रूप में कार्य करता है जो पिकोमोलर आत्मीयता (Kd ~0.5 pM) के साथ VEGF-A, VEGF-B और Placental Growth Factor (PlGF) को बांधता है, जिससे एंडोथेलियल VEGFR सक्रियण पूरी तरह रुक जाता है, असामान्य नियोवैस्कुलराइजेशन अवरुद्ध होता है और रिसने वाली केशिकाएं सील होती हैं।",
    gu: "બધા આઇસોફોર્મ ડિકોય રીસેપ્ટર તરીકે કાર્ય કરે છે જે પિકોમોલર એફિનિટી (Kd ~0.5 pM) સાથે VEGF-A, VEGF-B અને Placental Growth Factor (PlGF) ને બાંધે છે, જેનાથી એન્ડોથેલિયલ VEGFR સક્રિયકરણ સંપૂર્ણપણે અટકે છે, અસામાન્ય નવી રક્તવાહિનીઓ બનતી અટકે છે અને લિક થતી નળીઓ સીલ થાય છે."
  },
  "Affinity-matured humanized Fab fragment lacking Fc domain (lowering systemic retention) that selectively binds and neutralizes all biologically active isoforms of VEGF-A (including cleaved VEGF110), arresting endothelial proliferation and reducing vascular leakage.": {
    hi: "Fc डोमेन रहित उच्च आत्मीयता मानवीकृत Fab फ्रैगमेंट जो VEGF-A के सभी जैविक रूप से सक्रिय आइसोफॉर्म (क्लीव्ड VEGF110 सहित) को चयनात्मक रूप से बांधकर निष्क्रिय करता है, एंडोथेलियल प्रसार को रोकता है और संवहनी रिसाव को कम करता है।",
    gu: "Fc ડોમેન વગરનું હાઇ-એફિનિટી માનવીય Fab ફ્રેગમેન્ટ જે VEGF-A ના તમામ જૈવિક સક્રિય આઇસોફોર્મને બાંધીને નિષ્ક્રિય કરે છે, રક્તવાહિની કોષોનો અનિયંત્રિત ફેલાવો રોકે છે અને રક્તવાહિની લિકેજ ઘટાડે છે."
  },
  "Blocks Angiotensin II-mediated vasoconstriction, attenuating excessive intraglomerular and retinal capillary hydraulic pressure; suppresses local retinal capillary cell apoptosis and downregulates retinal VEGF expression.": {
    hi: "Angiotensin II-प्रेरित वाहिकासंकीर्णन को अवरुद्ध करता है, जिससे रेटिना केशिकाओं पर अत्यधिक दबाव कम होता है; रेटिना केशिका कोशिकाओं के अपोप्टोसिस को दबाता है और रेटिना VEGF अभिव्यक्ति को घटाता है।",
    gu: "Angiotensin II-પ્રેરિત નળીઓના સંકોચનને રોકે છે, જેથી રેટિનાની સૂક્ષ્મ નળીઓ પરનું દબાણ ઘટે છે; રેટિના કોષોના નાશને અટકાવે છે અને રેટિનલ VEGF નું ઉત્પાદન ઘટાડે છે."
  },
  "Stimulates nuclear receptor PPAR-alpha, enhancing fatty acid beta-oxidation, downregulating intraretinal inflammation, protecting pericytes from apoptotic demise, and preserving inner blood-retinal barrier integrity independent of baseline serum triglyceride concentrations.": {
    hi: "परमाणु रिसेप्टर PPAR-alpha को उत्तेजित करता है, फैटी एसिड बीटा-ऑक्सीकरण को बढ़ाता है, इंट्रा-रेटिनल सूजन को कम करता है, पेरिसाइट्स को नष्ट होने से बचाता है, और बेसलाइन ट्राइग्लिसराइड्स से स्वतंत्र होकर आंतरिक रक्त-रेटिना बाधा को संरक्षित करता है।",
    gu: "ન્યુક્લિયર રીસેપ્ટર PPAR-alpha ને ઉત્તેજિત કરે છે, ફેટી એસિડ બીટા-ઓક્સિડેશન વધારે છે, રેટિનાના અંદરના સોજાને ઘટાડે છે, પેરીસાઇટ્સને સુરક્ષિત રાખે છે, અને બ્લડ-રેટિનલ બેરિયરની અખંડિતતા જાળવી રાખે છે."
  },
  "OFFICIAL PHARMACOTHERAPY REFERENCE FOR CLINICIANS: All listed medications, therapeutic classes, biological mechanisms, and dosing guidelines are grounded in recognized medical pharmacology textbooks (Goodman & Gilman's The Pharmacological Basis of Therapeutics 14th Ed.; Katzung's Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP). This document is strictly an evidence-based clinical aid for licensed ophthalmologists and physicians. It DOES NOT constitute an autonomous prescription or automated drug dispensing order. Individual patient pharmacotherapy must be tailored following comprehensive systemic and vitreoretinal examination.": {
    hi: "चिकित्सकों हेतु आधिकारिक फार्माकोथेरेपी संदर्भ: सभी सूचीबद्ध दवाइयां, चिकित्सीय वर्ग, जैविक तंत्र और खुराक दिशा-निर्देश मान्यता प्राप्त मेडिकल फार्माकोलॉजी पाठ्यपुस्तकों (Goodman & Gilman's The Pharmacological Basis of Therapeutics 14th Ed.; Katzung's Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP) पर आधारित हैं। यह दस्तावेज लाइसेंस प्राप्त नेत्र विशेषज्ञों और डॉक्टरों के लिए विशुद्ध रूप से एक साक्ष्य-आधारित नैदानिक सहायता है। यह कोई स्वचालित नुस्खा या दवा वितरण आदेश नहीं है। संपूर्ण शारीरिक एवं रेटिना परीक्षण के उपरांत ही प्रत्येक रोगी के लिए व्यक्तिगत चिकित्सा तय की जानी चाहिए।",
    gu: "તબીબો માટે સત્તાવાર ફાર્માકોથેરાપી સંદર્ભ: તમામ સૂચિબદ્ધ દવાઓ, ઉપચારાત્મક વર્ગો, જૈવિક પદ્ધતિઓ અને ડોઝિંગ માર્ગદર્શિકા માન્યતા પ્રાપ્ત મેડિકલ ફાર્માકોલોજી પાઠ્યપુસ્તકો (Goodman & Gilman's The Pharmacological Basis of Therapeutics 14th Ed.; Katzung's Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP) પર આધારિત છે. આ દસ્તાવેજ પ્રમાણિત નેત્ર નિષ્ણાતો અને ડૉક્ટરો માટે સંપૂર્ણપણે પુરાવા-આધારિત ક્લિનિકલ સહાય છે. આ કોઈ ઓટોમેટેડ પ્રિસ્ક્રિપ્શન કે દવા આપવાનો આદેશ નથી. વ્યક્તિગત દર્દીની ફાર્માકોથેરાપી સંપૂર્ણ આંખ અને શારીરિક તપાસ પછી જ નક્કી કરવી જોઈએ."
  },
  "OFFICIAL PHARMACOTHERAPY REFERENCE FOR CLINICIANS: All listed medications, therapeutic classes, biological mechanisms, and dosing guidelines are grounded in recognized medical pharmacology textbooks (Goodman & Gilman’s The Pharmacological Basis of Therapeutics 14th Ed.; Katzung’s Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP). This document is strictly an evidence-based clinical aid for licensed ophthalmologists and physicians. It DOES NOT constitute an autonomous prescription or automated drug dispensing order. Individual patient pharmacotherapy must be tailored following comprehensive systemic and vitreoretinal examination.": {
    hi: "चिकित्सकों हेतु आधिकारिक फार्माकोथेरेपी संदर्भ: सभी सूचीबद्ध दवाइयां, चिकित्सीय वर्ग, जैविक तंत्र और खुराक दिशा-निर्देश मान्यता प्राप्त मेडिकल फार्माकोलॉजी पाठ्यपुस्तकों (Goodman & Gilman's The Pharmacological Basis of Therapeutics 14th Ed.; Katzung's Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP) पर आधारित हैं। यह दस्तावेज लाइसेंस प्राप्त नेत्र विशेषज्ञों और डॉक्टरों के लिए विशुद्ध रूप से एक साक्ष्य-आधारित नैदानिक सहायता है। यह कोई स्वचालित नुस्खा या दवा वितरण आदेश नहीं है। संपूर्ण शारीरिक एवं रेटिना परीक्षण के उपरांत ही प्रत्येक रोगी के लिए व्यक्तिगत चिकित्सा तय की जानी चाहिए।",
    gu: "તબીબો માટે સત્તાવાર ફાર્માકોથેરાપી સંદર્ભ: તમામ સૂચિબદ્ધ દવાઓ, ઉપચારાત્મક વર્ગો, જૈવિક પદ્ધતિઓ અને ડોઝિંગ માર્ગદર્શિકા માન્યતા પ્રાપ્ત મેડિકલ ફાર્માકોલોજી પાઠ્યપુસ્તકો (Goodman & Gilman's The Pharmacological Basis of Therapeutics 14th Ed.; Katzung's Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP) પર આધારિત છે. આ દસ્તાવેજ પ્રમાણિત નેત્ર નિષ્ણાતો અને ડૉક્ટરો માટે સંપૂર્ણપણે પુરાવા-આધારિત ક્લિનિકલ સહાય છે. આ કોઈ ઓટોમેટેડ પ્રિસ્ક્રિપ્શન કે દવા આપવાનો આદેશ નથી. વ્યક્તિગત દર્દીની ફાર્માકોથેરાપી સંપૂર્ણ આંખ અને શારીરિક તપાસ પછી જ નક્કી કરવી જોઈએ."
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
  },

  // 9. Matrix Headings & Subheadings (Comparative Viewer)
  "1. Raw Fundus Capture": {
    hi: "1. कच्चा फंडस कैप्चर (Raw)",
    gu: "1. રો ફંડસ કેપ્ચર (Raw)"
  },
  "1. RAW FUNDUS CAPTURE": {
    hi: "1. कच्चा फंडस कैप्चर (RAW)",
    gu: "1. રો ફંડસ કેપ્ચર (RAW)"
  },
  "2. CLAHE Contrast": {
    hi: "2. CLAHE कंट्रास्ट",
    gu: "2. CLAHE કોન્ટ્રાસ્ટ"
  },
  "2. CLAHE CONTRAST": {
    hi: "2. CLAHE कंट्रास्ट",
    gu: "2. CLAHE કોન્ટ્રાસ્ટ"
  },
  "3. U-Net Lesion Mask": {
    hi: "3. U-Net घाव विभाजन",
    gu: "3. U-Net જખમ માસ્ક"
  },
  "3. U-NET LESION MASK": {
    hi: "3. U-Net घाव विभाजन",
    gu: "3. U-Net જખમ માસ્ક"
  },
  "4. Grad-CAM Activation": {
    hi: "4. Grad-CAM एक्टिवेशन",
    gu: "4. Grad-CAM એક્ટિવેશન"
  },
  "4. GRAD-CAM ACTIVATION": {
    hi: "4. Grad-CAM एक्टिवेशन",
    gu: "4. Grad-CAM એક્ટિવેશન"
  },
  "Unmodified 45° macular retinal field.": {
    hi: "अपरिवर्तित 45° मैकुलर रेटिना क्षेत्र।",
    gu: "અપરિવર્તિત 45° મેક્યુલર રેટિના ક્ષેત્ર."
  },
  "Green-channel microvascular boost.": {
    hi: "ग्रीन-चैनल सूक्ष्म संवहनी संवर्धन।",
    gu: "ગ્રીન-ચેનલ સૂક્ષ્મ રક્તવાહિની સંવર્ધન."
  },
  "Microaneurysms, hemorrhages & exudates.": {
    hi: "माइक्रोएन्यूरिज्म, रक्तस्राव एवं एक्सयूडेट्स।",
    gu: "માઇક્રોએન્યુરિઝમ, રક્તસ્રાવ અને એક્સ્યુડેટ્સ."
  },
  "Attentive feature grading saliency.": {
    hi: "मॉडल ध्यान एवं ग्रेडिंग प्रमुखता।",
    gu: "મોડલ ધ્યાન અને ગ્રેડિંગ મુખ્યતા."
  },
  "Comparative Fundus Diagnostic Matrix": {
    hi: "तुलनात्मक फंडस डायग्नोस्टिक मैट्रिक्स",
    gu: "તુલનાત્મક ફંડસ ડાયગ્નોસ્ટિક મેટ્રિક્સ"
  },
  "COMPARATIVE FUNDUS DIAGNOSTIC MATRIX": {
    hi: "तुलनात्मक फंडस डायग्नोस्टिक मैट्रिक्स",
    gu: "તુલનાત્મક ફંડસ ડાયગ્નોસ્ટિક મેટ્રિક્સ"
  },
  "Synchronized clinical side-by-side inspection": {
    hi: "समानांतर क्लिनिकल प्रत्यक्ष निरीक्षण",
    gu: "સમાંતર ક્લિનિકલ સીધું નિરીક્ષણ"
  },
  "4-Panel Matrix": {
    hi: "4-पैनल मैट्रिक्स",
    gu: "4-પેનલ મેટ્રિક્સ"
  },
  "Interactive Overlay Blend": {
    hi: "इंटरएक्टिव ओवरले ब्लेंड",
    gu: "ઇન્ટરેક્ટિવ ઓવરલે બ્લેન્ડ"
  },
  "Segmentation Bypassed": {
    hi: "विभाजन बाईपास किया गया",
    gu: "વિભાજન બાયપાસ કરેલ"
  },
  "Lesion segmentation disabled.": {
    hi: "घाव विभाजन निष्क्रिय।",
    gu: "જખમ વિભાજન નિષ્ક્રિય."
  },

  // 10. Quantitative Lesions Distribution Bar
  "Quantitative Lesion Distribution & Optical Assessment": {
    hi: "मात्रात्मक घाव वितरण एवं ऑप्टिकल मूल्यांकन",
    gu: "માત્રાત્મક જખમ વિતરણ અને ઓપ્ટિકલ મૂલ્યાંકન"
  },
  "QUANTITATIVE LESION DISTRIBUTION & OPTICAL ASSESSMENT": {
    hi: "मात्रात्मक घाव वितरण एवं ऑप्टिकल मूल्यांकन",
    gu: "માત્રાત્મક જખમ વિતરણ અને ઓપ્ટિકલ મૂલ્યાંકન"
  },
  "Field of View: 45° • Depth: 24-bit sRGB • Optics Quality: High": {
    hi: "दृश्य क्षेत्र: 45° • गहराई: 24-बिट sRGB • ऑप्टिक्स गुणवत्ता: उच्च",
    gu: "દ્રષ્ટિ ક્ષેત્ર: 45° • ઊંડાણ: 24-બીટ sRGB • ઓપ્ટિક્સ ગુણવત્તા: ઉચ્ચ"
  },
  "Microaneurysms (MA)": {
    hi: "माइक्रोएन्यूरिज्म (MA)",
    gu: "માઇક્રોએન્યુરિઝમ (MA)"
  },
  "MICROANEURYSMS (MA)": {
    hi: "माइक्रोएन्यूरिज्म (MA)",
    gu: "માઇક્રોએન્યુરિઝમ (MA)"
  },
  "Focal Vascular Dilations": {
    hi: "फोकल वैस्कुलर फैलाव",
    gu: "ફોકલ વેસ્ક્યુલર વિસ્તરણ"
  },
  "Isolated capillary outpouchings": {
    hi: "अलग सूक्ष्म केशिका फैलाव",
    gu: "અલગ કેશિકા વિસ્તરણ"
  },
  "Hemorrhages (HEM)": {
    hi: "रेटिनल रक्तस्राव (HEM)",
    gu: "રેટિનલ રક્તસ્રાવ (HEM)"
  },
  "HEMORRHAGES (HEM)": {
    hi: "रेटिनल रक्तस्राव (HEM)",
    gu: "રેટિનલ રક્તસ્રાવ (HEM)"
  },
  "Intra-Retinal Micro-Bleeds": {
    hi: "इंट्रा-रेटिनल सूक्ष्म रक्तस्राव",
    gu: "ઇન્ટ્રા-રેટિનલ સૂક્ષ્મ રક્તસ્રાવ"
  },
  "Blot, dot & flame patterns": {
    hi: "ब्लॉट, डॉट एवं फ्लेम पैटर्न",
    gu: "બ્લોટ, ડોટ અને ફ્લેમ પેટર્ન"
  },
  "Hard Exudates (EX)": {
    hi: "हार्ड एक्सयूडेट्स (EX)",
    gu: "હાર્ડ એક્સ્યુડેટ્સ (EX)"
  },
  "HARD EXUDATES (EX)": {
    hi: "हार्ड एक्सयूडेट्स (EX)",
    gu: "હાર્ડ એક્સ્યુડેટ્સ (EX)"
  },
  "Lipoprotein Deposition": {
    hi: "लिपोप्रोटीन जमाव",
    gu: "લિપોપ્રોટીન જમાવટ"
  },
  "Macular edema risk assessment": {
    hi: "मैकुलर एडिमा जोखिम मूल्यांकन",
    gu: "મેક્યુલર એડીમા જોખમ આકલન"
  },
  "VESSEL ARBORIZATION": {
    hi: "रक्तवाहिका संरचना",
    gu: "રક્તવાહિની સંરચના"
  },

  // 11. Longitudinal Progress & Comparison Report
  "Longitudinal Progress & Comparison Report": {
    hi: "अनुदैर्ध्य प्रगति एवं तुलनात्मक रिपोर्ट",
    gu: "સમય આધારિત પ્રગતિ અને તુલનાત્મક અહેવાલ"
  },
  "LONGITUDINAL PROGRESS & COMPARISON REPORT": {
    hi: "अनुदैर्ध्य प्रगति एवं तुलनात्मक रिपोर्ट",
    gu: "સમય આધારિત પ્રગતિ અને તુલનાત્મક અહેવાલ"
  },
  "Improved Finding": {
    hi: "सुधार के संकेत",
    gu: "સુધારાના સંકેત"
  },
  "IMPROVED FINDING": {
    hi: "सुधार के संकेत",
    gu: "સુધારાના સંકેત"
  },
  "Disease Advancement": {
    hi: "रोग में वृद्धि",
    gu: "રોગમાં વધારો"
  },
  "DISEASE ADVANCEMENT": {
    hi: "रोग में वृद्धि",
    gu: "રોગમાં વધારો"
  },
  "Stable Condition": {
    hi: "स्थिर स्थिति",
    gu: "સ્થિર સ્થિતિ"
  },
  "STABLE CONDITION": {
    hi: "स्थिर स्थिति",
    gu: "સ્થિર સ્થિતિ"
  },
  "Severity Grading Trajectory": {
    hi: "गंभीरता ग्रेडिंग प्रक्षेपवक्र",
    gu: "ગંભીરતા ગ્રેડિંગ પ્રગતિ"
  },
  "SEVERITY GRADING TRAJECTORY": {
    hi: "गंभीरता ग्रेडिंग प्रक्षेपवक्र",
    gu: "ગંભીરતા ગ્રેડિંગ પ્રગતિ"
  },
  "Visual Acuity Shift": {
    hi: "दृष्टि तीक्ष्णता परिवर्तन",
    gu: "દ્રષ્ટિ ક્ષમતા ફેરફાર"
  },
  "VISUAL ACUITY SHIFT": {
    hi: "दृष्टि तीक्ष्णता परिवर्तन",
    gu: "દ્રષ્ટિ ક્ષમતા ફેરફાર"
  },
  "Intraocular Pressure (IOP)": {
    hi: "आंतरिक नेत्र दबाव (IOP)",
    gu: "આંતરિક આંખ દબાણ (IOP)"
  },
  "INTRAOCULAR PRESSURE (IOP)": {
    hi: "आंतरिक नेत्र दबाव (IOP)",
    gu: "આંતરિક આંખ દબાણ (IOP)"
  },
  "Detailed Comparative Pathology Analysis": {
    hi: "विस्तृत तुलनात्मक पैथोलॉजी विश्लेषण",
    gu: "વિગતવાર તુલનાત્મક પેથોલોજી વિશ્લેષણ"
  },
  "DETAILED COMPARATIVE PATHOLOGY ANALYSIS": {
    hi: "विस्तृत तुलनात्मक पैथोलॉजी विश्लेषण",
    gu: "વિગતવાર તુલનાત્મક પેથોલોજી વિશ્લેષણ"
  },
  "Improved Findings": {
    hi: "सुधरे हुए नैदानिक निष्कर्ष",
    gu: "સુધરેલા ક્લિનિકલ તારણો"
  },
  "IMPROVED FINDINGS": {
    hi: "सुधरे हुए नैदानिक निष्कर्ष",
    gu: "સુધરેલા ક્લિનિકલ તારણો"
  },
  "Worsened / Disease Advancement": {
    hi: "गंभीरता में वृद्धि / रोग विस्तार",
    gu: "ગંભીરતામાં વધારો / રોગ વધારો"
  },
  "WORSENED / DISEASE ADVANCEMENT": {
    hi: "गंभीरता में वृद्धि / रोग विस्तार",
    gu: "ગંભીરતામાં વધારો / રોગ વધારો"
  },
  "Newly Detected Findings": {
    hi: "नए पाए गए निष्कर्ष",
    gu: "નવા નોંધાયેલ તારણો"
  },
  "NEWLY DETECTED FINDINGS": {
    hi: "नए पाए गए निष्कर्ष",
    gu: "નવા નોંધાયેલ તારણો"
  },
  "Resolved Findings": {
    hi: "समाधानित / ठीक हुए निष्कर्ष",
    gu: "સાજા થયેલ / દૂર થયેલ તારણો"
  },
  "RESOLVED FINDINGS": {
    hi: "समाधानित / ठीक हुए निष्कर्ष",
    gu: "સાજા થયેલ / દૂર થયેલ તારણો"
  },
  "Stable Findings": {
    hi: "स्थिर निष्कर्ष",
    gu: "સ્થિર તારણો"
  },
  "STABLE FINDINGS": {
    hi: "स्थिर निष्कर्ष",
    gu: "સ્થિર તારણો"
  },
  "Clinical Progression Summary:": {
    hi: "क्लिनिकल प्रगति सारांश:",
    gu: "ક્લિનિકલ પ્રગતિ સારાંશ:"
  },
  "Persistent referable retinopathy: patient continues to meet tertiary care referral criteria.": {
    hi: "सतत रेफ़रेबल रेटिनोपैथी: मरीज़ तृतीयक देखभाल रेफरल मानदंडों को पूरा करता रहता है।",
    gu: "સતત રેફરેબલ રેટિનોપેથી: દર્દી તૃતીયક સંભાળ રેફરલ માપદંડોને પૂર્ણ કરવાનું ચાલુ રાખે છે."
  },
  "Microlesion spatial distribution and neural heatmap activation patterns remain stable.": {
    hi: "माइक्रो-घावों का स्थानिक वितरण एवं न्यूरल हीटमैप सक्रियता पैटर्न स्थिर हैं।",
    gu: "માઇક્રો-જખમોનું વિતરણ અને ન્યુરલ હીટમેપ સક્રિયતા પેટર્ન સ્થિર છે."
  },
  "Increase in spatial distribution and density of segmented retinal microlesions.": {
    hi: "रेटिना के खंडित सूक्ष्म घावों के स्थानिक वितरण एवं घनत्व में वृद्धि।",
    gu: "રેટિનાના વિભાજિત સૂક્ષ્મ જખમોના વિતરણ અને ઘનતામાં વધારો."
  },
  "Contraction of segmented lesion clusters and reduced exudative surface area.": {
    hi: "खंडित घावों के समूहों में संकुचन एवं एक्सयूडेटिव सतह क्षेत्र में कमी।",
    gu: "વિભાજિત જખમોના જૂથોમાં ઘટાડો અને એક્સ્યુડેટ સપાટી વિસ્તારમાં ઘટાડો."
  },
  "High-Risk Referable Threshold Triggered: Patient has transitioned to referable diabetic retinopathy requiring specialist review.": {
    hi: "उच्च जोखिम रेफरल सीमा सक्रिय: मरीज़ रेफ़रेबल डायबिटिक रेटिनोपैथी में प्रवेश कर चुका है जिसके लिए विशेषज्ञ समीक्षा आवश्यक है।",
    gu: "ઉચ્ચ જોખમ રેફરલ થ્રેશોલ્ડ સક્રિય: દર્દી રેફરેબલ ડાયાબિટીક રેટિનોપેથીમાં સંક્રમિત થયો છે જેને નિષ્ણાત તપાસની જરૂર છે."
  },
  "Prior referable condition status resolved following clinical management; current state no longer requires immediate tertiary referral.": {
    hi: "क्लिनिकल प्रबंधन के बाद पूर्व रेफ़रेबल स्थिति में सुधार हुआ; वर्तमान स्थिति में तत्काल तृतीयक रेफरल की आवश्यकता नहीं है।",
    gu: "ક્લિનિકલ સારવાર બાદ અગાઉની રેફરેબલ સ્થિતિમાં સુધારો થયો; હાલની સ્થિતિમાં તાત્કાલિક તૃતીયક રેફરલની જરૂર નથી."
  },
  "U-Net Lesion Segmentation highlights active microaneurysm and exudative clusters not evident in prior assessment.": {
    hi: "U-Net घाव विभाजन सक्रिय माइक्रोएन्यूरिज्म और एक्सयूडेटिव क्लस्टर्स को उजागर करता है जो पहले नहीं थे।",
    gu: "U-Net જખમ વિભાજન સક્રિય માઇક્રોએન્યુરિઝમ અને એક્સ્યુડેટિવ ક્લસ્ટર્સ દર્શાવે છે જે અગાઉ દેખાતા નહોતા."
  },
  "Significant reduction or resolution of previously segmented microvascular lesion clusters.": {
    hi: "पूर्व में खंडित सूक्ष्म संवहनी घाव समूहों में महत्वपूर्ण कमी या समाधान।",
    gu: "અગાઉ વિભાજિત સૂક્ષ્મ રક્તવાહિની જખમ ક્લસ્ટર્સમાં નોંધપાત્ર ઘટાડો અથવા નિવારણ."
  },

  // 12. System & Deployment Modules (Drawers)
  "System & Deployment Modules (Click to Inspect)": {
    hi: "सिस्टम एवं परिनियोजन मॉड्यूल (निरीक्षण हेतु क्लिक करें)",
    gu: "સિસ્ટમ અને ડિપ્લોયમેન્ટ મોડ્યુલ્સ (તપાસ માટે ક્લિક કરો)"
  },
  "🧠 2nd Opinion Consensus": {
    hi: "🧠 द्वितीय राय सहमति",
    gu: "🧠 બીજા અભિપ્રાયની સહમતિ"
  },
  "🏥 5-Year Public Health Sim": {
    hi: "🏥 5-वर्षीय सार्वजनिक स्वास्थ्य सिमुलेशन",
    gu: "🏥 5-વર્ષ જાહેર આરોગ્ય સિમ્યુલેશન"
  },
  "💰 QALY & Health Economics": {
    hi: "💰 QALY एवं स्वास्थ्य अर्थशास्त्र",
    gu: "💰 QALY અને હેલ્થ ઇકોનોમિક્સ"
  },
  "🔒 SHA-256 Tamper Audit": {
    hi: "🔒 SHA-256 छेड़छाड़ ऑडिट",
    gu: "🔒 SHA-256 ટેમ્પર ઓડિટ"
  },
  "Second-Opinion Consensus Architecture": {
    hi: "द्वितीय-राय आम सहमति आर्किटेक्चर",
    gu: "બીજા-અભિપ્રાય સહમતિ આર્કિટેક્ચર"
  },
  "5-Year India Public Health Screening Simulator": {
    hi: "5-वर्षीय भारत सार्वजनिक स्वास्थ्य स्क्रीनिंग सिम्युलेटर",
    gu: "5-વર્ષ ભારત જાહેર આરોગ્ય સ્ક્રીનિંગ સિમ્યુલેટર"
  },
  "5-Yr Screenings": {
    hi: "5-वर्षीय स्क्रीनिंग",
    gu: "5-વર્ષ સ્ક્રીનિંગ"
  },
  "Blindness Averted": {
    hi: "अंधापन रोका गया",
    gu: "અંધાપો અટકાવાયો"
  },
  "Specialist Time Saved": {
    hi: "विशेषज्ञ समय की बचत",
    gu: "નિષ્ણાત સમયની બચત"
  },
  "312 Cases": {
    hi: "312 मामले",
    gu: "312 કેસો"
  },
  "4,200 Hours": {
    hi: "4,200 घंटे",
    gu: "4,200 કલાકો"
  },
  "QALY & Cost-Effectiveness Health Economics": {
    hi: "QALY एवं लागत-प्रभावशीलता स्वास्थ्य अर्थशास्त्र",
    gu: "QALY અને ખર્ચ-અસરકારકતા આરોગ્ય અર્થશાસ્ત્ર"
  },
  "AI Cost / Scan": {
    hi: "एआई लागत / स्कैन",
    gu: "AI ખર્ચ / સ્કેન"
  },
  "Manual Cost / Scan": {
    hi: "मैनुअल लागत / स्कैन",
    gu: "મેન્યુઅલ ખર્ચ / સ્કેન"
  },
  "Total QALYs Gained": {
    hi: "कुल अर्जित QALYs",
    gu: "કુલ મેળવેલ QALYs"
  },
  "Economic Stance": {
    hi: "आर्थिक दृष्टिकोण",
    gu: "આર્થિક પરિપ્રેક્ષ્ય"
  },
  "Cost-Saving Dominant": {
    hi: "लागत बचत में प्रमुख",
    gu: "ખર્ચ બચતમાં અગ્રેસર"
  },
  "Cryptographic SHA-256 Tamper Audit": {
    hi: "क्रिप्टोग्राफिक SHA-256 छेड़छाड़ ऑडिट",
    gu: "ક્રિપ્ટોગ્રાફિક SHA-256 ટેમ્પર ઓડિટ"
  },
  "Verify Audit Log": {
    hi: "ऑडिट लॉग सत्यापित करें",
    gu: "ઓડિટ લોગ ચકાસો"
  },
  "Chained Blocks Verified:": {
    hi: "सत्यापित ब्लॉक श्रृंखला:",
    gu: "ચકાસાયેલ બ્લોક શૃંખલા:"
  },
  "Root Ledger Hash:": {
    hi: "रूट लेजर हैश:",
    gu: "રૂટ લેજર હેશ:"
  },

  // 13. Counterfactual Visual Explanation Studio
  "COUNTERFACTUAL VISUAL EXPLANATION (WHAT A HEALTHIER RETINA WOULD LOOK LIKE)": {
    hi: "काउंटरफैक्चुअल दृश्य व्याख्या (स्वस्थ रेटिना सिमुलेशन)",
    gu: "કાઉન્ટરફેક્ચ્યુઅલ દ્રશ્ય સમજૂતી (સ્વસ્થ રેટિના સિમ્યુલેશન)"
  },
  "Generative inpainting of what a healthier retina looks like with lesions cleared": {
    hi: "घाव और रक्तस्राव हटाने पर स्वस्थ रेटिना कैसा दिखेगा इसका जेनेरेटिव दृश्य",
    gu: "ક્ષતિઓ અને હેમરેજ દૂર કરવાથી સ્વસ્થ રેટિના કેવો દેખાય તેનું સિમ્યુલેશન"
  },
  "Navier-Stokes Generative Retinal Inpainting": {
    hi: "नेवियर-स्टोक्स जेनेरेटिव रेटिनल इनपेंटिंग",
    gu: "નેવિયર-સ્ટોક્સ જનરેટિવ રેટિના ઇનપેઇન્ટિંગ"
  },
  "CURRENT SCAN (GRAD-CAM FLAGGED)": {
    hi: "वर्तमान स्कैन (GRAD-CAM चिह्नित)",
    gu: "હાલનું સ્કેન (GRAD-CAM ચિહ્નિત)"
  },
  "COUNTERFACTUAL (HEALTHIER RETINA COUNTERPART)": {
    hi: "काउंटरफैक्चुअल (स्वस्थ रेटिना प्रतिरूप)",
    gu: "કાઉન્ટરફેક્ચ્યુઅલ (સ્વસ્થ રેટિના પ્રતિરૂપ)"
  },
  "Flagged Lesion Hotspots": {
    hi: "चिह्नित घाव हॉटस्पॉट",
    gu: "ચિહ્નિત જખમ હોટસ્પોટ"
  },
  "Synthesized Healthy Retinal Bed": {
    hi: "संश्लेषित स्वस्थ रेटिना क्षेत्र",
    gu: "સંશ્લેષિત સ્વસ્થ રેટિના પથારી"
  },
  "Microaneurysms and intraretinal blot hemorrhages driving the AI diagnosis.": {
    hi: "एआई निदान को प्रभावित करने वाले माइक्रोएन्यूरिज्म एवं इंट्रा-रेटिनल रक्तस्राव।",
    gu: "AI નિદાનને પ્રેરિત કરતા માઇક્રોએન્યુરિઝમ અને ઇન્ટ્રા-રેટિના હેમરેજ."
  },
  "Lesions replaced with healthy retinal parenchyma, validating causal model behavior.": {
    hi: "घावों को स्वस्थ रेटिना ऊतकों से बदला गया, जो मॉडल के कारणात्मक व्यवहार को प्रमाणित करता है।",
    gu: "જખમોને સ્વસ્થ રેટિના પેશીઓથી બદલવામાં આવ્યા, જે મોડેલની કાર્યક્ષમતા સાબિત કરે છે."
  },
  "Flagged Microvascular Pathology": {
    hi: "चिह्नित सूक्ष्म संवहनी विकृति",
    gu: "ચિહ્નિત સૂક્ષ્મ રક્તવાહિની રોગ"
  },
  "Synthesized Healthy Retina": {
    hi: "संश्लेषित स्वस्थ रेटिना",
    gu: "સંશ્લેષિત સ્વસ્થ રેટિના"
  }
};

/**
 * Localizes individual comparison bullet finding strings
 */
export function localizeComparisonFinding(text: string, lang: SupportedLanguage): string {
  if (lang === 'en' || !text) return text;

  // Direct map check
  if (COMPREHENSIVE_TRANSLATION_MAP[text]) {
    return COMPREHENSIVE_TRANSLATION_MAP[text][lang] || text;
  }

  // Primary severity grade stable pattern
  const stableMatch = text.match(/Primary severity grade stable at (.*?) \(Grade (\d)\) across the screening interval\./i);
  if (stableMatch) {
    const [, label, grade] = stableMatch;
    if (lang === 'hi') return `स्क्रीनिंग अंतराल के दौरान प्राथमिक गंभीरता ग्रेड ${label} (ग्रेड ${grade}) पर स्थिर है।`;
    if (lang === 'gu') return `સ્ક્રીનિંગ ગાળા દરમિયાન પ્રાથમિક ગંભીરતા ગ્રેડ ${label} (ગ્રેડ ${grade}) પર સ્થિર છે.`;
  }

  // Visual acuity right maintained
  const vaRMatch = text.match(/Right Eye \(OD\) Visual Acuity maintained at (.*?)\./i);
  if (vaRMatch) {
    if (lang === 'hi') return `दाहिनी आंख (OD) दृष्टि तीक्ष्णता ${vaRMatch[1]} पर स्थिर।`;
    if (lang === 'gu') return `જમણી આંખ (OD) દ્રષ્ટિ ક્ષમતા ${vaRMatch[1]} પર જળવાઈ રહી.`;
  }

  // Visual acuity left maintained
  const vaLMatch = text.match(/Left Eye \(OS\) Visual Acuity maintained at (.*?)\./i);
  if (vaLMatch) {
    if (lang === 'hi') return `बाईं आंख (OS) दृष्टि तीक्ष्णता ${vaLMatch[1]} पर स्थिर।`;
    if (lang === 'gu') return `ડાબી આંખ (OS) દ્રષ્ટિ ક્ષમતા ${vaLMatch[1]} પર જળવાઈ રહી.`;
  }

  // Visual acuity right improved
  const vaRImp = text.match(/Visual Acuity improvement in Right Eye \(OD\): improved from (.*?) to (.*?)\./i);
  if (vaRImp) {
    if (lang === 'hi') return `दाहिनी आंख (OD) में दृष्टि तीक्ष्णता सुधार: ${vaRImp[1]} से बढ़कर ${vaRImp[2]} हुई।`;
    if (lang === 'gu') return `જમણી આંખ (OD) માં દ્રષ્ટિ ક્ષમતા સુધારો: ${vaRImp[1]} થી વધીને ${vaRImp[2]} થઈ.`;
  }

  // Visual acuity left improved
  const vaLImp = text.match(/Visual Acuity improvement in Left Eye \(OS\): improved from (.*?) to (.*?)\./i);
  if (vaLImp) {
    if (lang === 'hi') return `बाईं आंख (OS) में दृष्टि तीक्ष्णता सुधार: ${vaLImp[1]} से बढ़कर ${vaLImp[2]} हुई।`;
    if (lang === 'gu') return `ડાબી આંખ (OS) માં દ્રષ્ટિ ક્ષમતા સુધારો: ${vaLImp[1]} થી વધીને ${vaLImp[2]} થઈ.`;
  }

  // Regression / improvement
  const regMatch = text.match(/Retinopathy severity regression: primary grading improved from (.*?) \(Grade (\d)\) to (.*?) \(Grade (\d)\)\./i);
  if (regMatch) {
    const [, pLab, pG, cLab, cG] = regMatch;
    if (lang === 'hi') return `रेटिनोपैथी गंभीरता में सुधार: प्राथमिक ग्रेडिंग ${pLab} (ग्रेड ${pG}) से सुधरकर ${cLab} (ग्रेड ${cG}) हो गई।`;
    if (lang === 'gu') return `રેટિનોપેથી ગંભીરતામાં સુધારો: પ્રાથમિક ગ્રેડિંગ ${pLab} (ગ્રેડ ${pG}) થી સુધરીને ${cLab} (ગ્રેડ ${cG}) થયું.`;
  }

  // Advancement / worsening
  const advMatch = text.match(/Disease advancement detected: progression from (.*?) \(Grade (\d)\) to (.*?) \(Grade (\d)\)\./i);
  if (advMatch) {
    const [, pLab, pG, cLab, cG] = advMatch;
    if (lang === 'hi') return `रोग में वृद्धि की पहचान: ${pLab} (ग्रेड ${pG}) से बढ़कर ${cLab} (ग्रेड ${cG}) पर प्रगति पाई गई।`;
    if (lang === 'gu') return `રોગ વધારાની ઓળખ: ${pLab} (ગ્રેડ ${pG}) થી વધીને ${cLab} (ગ્રેડ ${cG}) પર પ્રગતિ જણાઈ.`;
  }

  return text;
}

/**
 * Localizes comparison progression summary paragraph
 */
export function localizeComparisonSummary(summary: string, lang: SupportedLanguage): string {
  if (lang === 'en' || !summary) return summary;

  if (summary.includes('Longitudinal comparison indicates stable diabetic retinopathy')) {
    if (lang === 'hi') {
      return `तुलनात्मक विश्लेषण फॉलो-अप विज़िट के दौरान स्थिर डायबिटिक रेटिनोपैथी स्थिति दर्शाता है। मुख्य नैदानिक संकेतक, रेटिना ग्रेडिंग, एवं दृश्य पैरामीटर दोनों जांचों के बीच सुसंगत रहे हैं।`;
    }
    if (lang === 'gu') {
      return `તુલનાત્મક વિશ્લેષણ ફોલો-અપ મુલાકાત દરમિયાન સ્થિર ડાયાબિટીક રેટિનોપેથી સ્થિતિ દર્શાવે છે. મુખ્ય નિદાન સંકેતકો, રેટિના ગ્રેડિંગ, અને દ્રષ્ટિ તપાસ પેરામીટર્સ બંને તારીખો વચ્ચે સુસંગત રહ્યા છે.`;
    }
  }

  if (summary.includes('demonstrates positive clinical progression')) {
    if (lang === 'hi') {
      return `तुलनात्मक मूल्यांकन सकारात्मक क्लिनिकल प्रगति प्रदर्शित करता है। मरीज़ के रेटिना निष्कर्षों में सुधार हुआ है, जो मेटाबॉलिक नियंत्रण या नेत्र चिकित्सा के अनुकूल प्रभाव को दर्शाता है।`;
    }
    if (lang === 'gu') {
      return `તુલનાત્મક મૂલ્યાંકન હકારાત્મક ક્લિનિકલ પ્રગતિ દર્શાવે છે. દર્દીના રેટિના તારણોમાં સુધારો થયો છે, જે શુગર નિયંત્રણ અથવા આંખની સારવારના અનુકૂળ પ્રતિસાદને પ્રતિબિંબિત કરે છે.`;
    }
  }

  if (summary.includes('indicates microvascular disease advancement')) {
    if (lang === 'hi') {
      return `तुलनात्मक मूल्यांकन सूक्ष्म संवहनी रोग विस्तार दर्शाता है। रोग वृद्धि के कारण सिस्टमिक ग्लाइसेमिक लक्ष्यों के त्वरित पुनर्मूल्यांकन और तत्काल रेटिना विशेषज्ञ परामर्श की आवश्यकता है।`;
    }
    if (lang === 'gu') {
      return `તુલનાત્મક મૂલ્યાંકન સૂક્ષ્મ રક્તવાહિની રોગ વધારો દર્શાવે છે. રોગ વધારાને કારણે તાત્કાલિક ગ્લાયસેમિક લક્ષ્યોની ફરીથી સમીક્ષા અને તાત્કાલિક રેટિના નિષ્ણાત તપાસ જરૂરી છે.`;
    }
  }

  return summary;
}

const originalTextMap = new WeakMap<Node, string>();
let isTranslating = false;
let activeObserver: MutationObserver | null = null;

export function applyLanguageToDOM(container: HTMLElement, targetLang: SupportedLanguage) {
  if (!container || isTranslating) return;

  isTranslating = true;
  try {
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

        // 2. Case-insensitive dictionary match
        let found = false;
        const lowerTrimmed = trimmedOrig.toLowerCase();
        for (const [key, val] of Object.entries(COMPREHENSIVE_TRANSLATION_MAP)) {
          if (key.toLowerCase() === lowerTrimmed) {
            node.nodeValue = orig.replace(trimmedOrig, val[targetLang]);
            found = true;
            break;
          }
        }
        if (found) continue;

        // 3. Dynamic patterns for screening comparison
        const scrHeaderMatch = trimmedOrig.match(/^(CURRENT SCREENING|Current Screening)\s*\(([^)]+)\)\s*(VS|vs)\s*(PREVIOUS SCREENING|Previous Screening)\s*\(([^)]+)\)$/i);
        if (scrHeaderMatch) {
          const d1 = scrHeaderMatch[2];
          const d2 = scrHeaderMatch[5];
          if (targetLang === 'hi') {
            node.nodeValue = orig.replace(trimmedOrig, `वर्तमान स्क्रीनिंग (${d1}) बनाम पिछली स्क्रीनिंग (${d2})`);
          } else if (targetLang === 'gu') {
            node.nodeValue = orig.replace(trimmedOrig, `હાલનું સ્ક્રીનિંગ (${d1}) વિરુદ્ધ અગાઉનું સ્ક્રીનિંગ (${d2})`);
          }
          continue;
        }

        const intervalMatch = trimmedOrig.match(/^Screening Interval:\s*(\d+)\s*days\s*\|\s*Baseline Ref:\s*([^\s]+)$/i);
        if (intervalMatch) {
          const days = intervalMatch[1];
          const ref = intervalMatch[2];
          if (targetLang === 'hi') {
            node.nodeValue = orig.replace(trimmedOrig, `स्क्रीनिंग अंतराल: ${days} दिन | बेसलाइन संदर्भ: ${ref}`);
          } else if (targetLang === 'gu') {
            node.nodeValue = orig.replace(trimmedOrig, `સ્ક્રીનિંગ ગાળો: ${days} દિવસ | બેઝલાઇન સંદર્ભ: ${ref}`);
          }
          continue;
        }

        // Findings localization
        const localizedFinding = localizeComparisonFinding(trimmedOrig, targetLang);
        if (localizedFinding !== trimmedOrig) {
          node.nodeValue = orig.replace(trimmedOrig, localizedFinding);
          continue;
        }

        // Progression summary localization
        const localizedSummary = localizeComparisonSummary(trimmedOrig, targetLang);
        if (localizedSummary !== trimmedOrig) {
          node.nodeValue = orig.replace(trimmedOrig, localizedSummary);
          continue;
        }
      }
    }

    // Attach dynamic MutationObserver to container so newly rendered drawers or tabs auto-translate
    if (typeof window !== 'undefined' && targetLang !== 'en') {
      if (!activeObserver) {
        activeObserver = new MutationObserver(() => {
          if (!isTranslating) {
            applyLanguageToDOM(container, targetLang);
          }
        });
        activeObserver.observe(container, {
          childList: true,
          subtree: true,
          characterData: false
        });
      }
    } else if (activeObserver && targetLang === 'en') {
      activeObserver.disconnect();
      activeObserver = null;
    }
  } finally {
    isTranslating = false;
  }
}

