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
    hi: "दृष्टि तीक्ष्णता",
    gu: "દ્રષ્ટિ ક્ષમતા"
  },
  "Oral Medication": {
    hi: "मौखिक दवा (Oral)",
    gu: "મોં વાટે લેવાતી દવા (Oral)"
  },
  "Insulin": {
    hi: "इंसुलिन (Insulin)",
    gu: "ઇન્સ્યુલિન (Insulin)"
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
  "PROLIFERATIVE DIABETIC RETINOPATHY": {
    hi: "प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी (PDR)",
    gu: "પ્રોલિફેરેટિવ ડાયાબિટીક રેટિનોપેથી (PDR)"
  },
  "MODERATE NON-PROLIFERATIVE DIABETIC RETINOPATHY": {
    hi: "मध्यम गैर-प्रोलिफेरेटिव रेटिनोपैथी",
    gu: "મધ્યમ નોન-પ્રોલિફેરેટિવ રેટિનોપેથી"
  },
  "SEVERE NON-PROLIFERATIVE DIABETIC RETINOPATHY": {
    hi: "गंभीर गैर-प्रोलिफेरेटिव रेटिनोपैथी",
    gu: "ગંભીર નોન-પ્રોલિફેરેટિવ રેટિનોપેથી"
  },

  // 4. Clinical Queue System
  "CLINICAL QUEUE ASSIGNMENT & WAITING TIME ESTIMATE": {
    hi: "क्लिनिकल कतार आवंटन एवं प्रतीक्षा समय अनुमान",
    gu: "ક્લિનિકલ કતાર ફાળવણી અને રાહ જોવાનો અંદાજિત સમય"
  },
  "Discrete-Event Queue Model": {
    hi: "डिस्क्रीट-इवेंट कतार मॉडल",
    gu: "ડિસ્ક્રીટ-ઇવેન્ટ કતાર મોડેલ"
  },
  "RISK PRIORITY QUEUE": {
    hi: "जोखिम प्राथमिकता कतार",
    gu: "જોખમ અગ્રતા કતાર"
  },
  "HIGH-PRIORITY REFERRAL (GRADE 4: PROLIFERATIVE DIABETIC RETINOPATHY)": {
    hi: "उच्च प्राथमिकता रेफरल (ग्रेड 4: प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी)",
    gu: "ઉચ્ચ અગ્રતા રેફરલ (ગ્રેડ 4: પ્રોલિફેરેટિવ ડાયાબિટીક રેટિનોપેથી)"
  },
  "YOUR POSITION": {
    hi: "आपकी स्थिति",
    gu: "તમારો ક્રમ"
  },
  "Rank in Risk Queue": {
    hi: "जोखिम कतार में रैंक",
    gu: "જોખમ કતારમાં ક્રમ"
  },
  "PATIENTS AHEAD": {
    hi: "आगे मरीज़",
    gu: "આગળ દર્દીઓ"
  },
  "0 patients ahead": {
    hi: "आगे 0 मरीज़",
    gu: "આગળ 0 દર્દીઓ"
  },
  "ESTIMATED WAIT TIME": {
    hi: "अनुमानित प्रतीक्षा समय",
    gu: "અંદાજિત પ્રતીક્ષા સમય"
  },
  "0 minutes": {
    hi: "0 मिनट",
    gu: "0 મિનિટ"
  },
  "Based on 60s/case review (Est.)": {
    hi: "60 सेकंड/केस समीक्षा पर आधारित (अनुमानित)",
    gu: "60 સેકન્ડ/કેસ સમીક્ષા આધારિત (અંદાજિત)"
  },
  "High-risk cases fast-tracked ahead of routine screenings for rapid specialist review.": {
    hi: "त्वरित विशेषज्ञ समीक्षा हेतु उच्च जोखिम मामलों को प्राथमिकता दी गई है।",
    gu: "ઝડપી નિષ્ણાત તપાસ માટે ઉચ્ચ જોખમ ધરાવતા કેસોને અગ્રતા આપવામાં આવી છે."
  },
  "1 Doctor Active (60s/case)": {
    hi: "1 डॉक्टर सक्रिय (60 सेकंड/केस)",
    gu: "1 ડૉક્ટર સક્રિય (60 સેકન્ડ/કેસ)"
  },

  // 5. Diagnostic Matrix
  "Comparative Fundus Diagnostic Matrix": {
    hi: "तुलनात्मक रेटिना डायग्नोस्टिक मैट्रिक्स",
    gu: "તુલનાત્મક રેટિના ડાયગ્નોસ્ટિક મેટ્રિક્સ"
  },
  "Synchronized clinical side-by-side inspection": {
    hi: "समानांतर क्लिनिकल रेटिना तुलनात्मक परीक्षण",
    gu: "સમાંતર ક્લિનિકલ રેટિના તુલનાત્મક તપાસ"
  },
  "1. Raw Fundus Capture": {
    hi: "1. मूल फंडस छवि (Raw)",
    gu: "1. મૂળ ફંડસ ફોટો (Raw)"
  },
  "Unmodified 45° macular retinal field.": {
    hi: "अपरिवर्तित 45° मैकुलर रेटिना क्षेत्र।",
    gu: "મૂળભૂત 45° મેક્યુલર રેટિના ક્ષેત્ર."
  },
  "2. CLAHE Contrast": {
    hi: "2. एन्हांस्ड कन्ट्रास्ट (CLAHE)",
    gu: "2. ઉન્નત કોન્ટ્રાસ્ટ (CLAHE)"
  },
  "Green-channel microvascular boost.": {
    hi: "ग्रीन-चैनल सूक्ष्म संवहनी संवर्धन।",
    gu: "ગ્રીન-ચેનલ સૂક્ષ્મ રક્તવાહિની ઉન્નતીકરણ."
  },
  "3. U-Net Lesion Mask": {
    hi: "3. घाव विभाजन मास्क (U-Net)",
    gu: "3. ક્ષતિ વિભાજન માસ્ક (U-Net)"
  },
  "Microaneurysms, hemorrhages & exudates.": {
    hi: "माइक्रोएन्यूरिज्म, रक्तस्राव एवं एक्सुडेट्स।",
    gu: "માઇક્રોએન્યુરિઝમ, રક્તસ્ત્રાવ અને એક્સ્યુડેટ્સ."
  },
  "4. Grad-CAM Activation": {
    hi: "4. ग्रेड-कैम हीटमैप (Grad-CAM)",
    gu: "4. ગ્રેડ-કેમ હીટમેપ (Grad-CAM)"
  },
  "Attentive feature grading saliency.": {
    hi: "मॉडल ध्यान एवं वर्गीकरण प्रमुखता।",
    gu: "મોડેલ ફોકસ અને વર્ગીકરણ પ્રાધાન્યતા."
  },
  "Quantitative Lesion Distribution & Optical Assessment": {
    hi: "मात्रात्मक घाव वितरण एवं ऑप्टिकल मूल्यांकन",
    gu: "જથ્થાત્મક ક્ષતિ વિતરણ અને ઓપ્ટિકલ મૂલ્યાંકન"
  },
  "Microaneurysms (MA)": {
    hi: "माइक्रोएन्यूरिज्म (MA)",
    gu: "માઇક્રોએન્યુરિઝમ (MA)"
  },
  "Focal Vascular Dilations": {
    hi: "सूक्ष्म रक्तवाहिका फैलाव",
    gu: "સૂક્ષ્મ રક્તવાહિની વિસ્તરણ"
  },
  "Isolated capillary outpouchings": {
    hi: "अलग-थलग केशिका फैलाव",
    gu: "છૂટાછવાયા રક્તવાહિની ફુલાવા"
  },
  "Hemorrhages (HEM)": {
    hi: "रक्तस्राव (Hemorrhages)",
    gu: "રેટિના હેમરેજ"
  },
  "Intra-Retinal Micro-Bleeds": {
    hi: "रेटिना भीतर सूक्ष्म रक्तस्राव",
    gu: "રેટિના અંદર સૂક્ષ્મ રક્તસ્ત્રાવ"
  },
  "Blot, dot & flame patterns": {
    hi: "ब्लॉट, डॉट एवं फ्लेम पैटर्न",
    gu: "બ્લોટ, ડોટ અને ફ્લેમ પેટર્ન"
  },
  "Hard Exudates (EX)": {
    hi: "हार्ड एक्सुडेट्स (वसा जमाव)",
    gu: "હાર્ડ એક્સ્યુડેટ્સ"
  },
  "Lipoprotein Deposition": {
    hi: "लाइपोप्रोटीन वसा जमाव",
    gu: "લિપોપ્રોટીન ચરબી જમાવટ"
  },
  "Macular edema risk assessment": {
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
  "Save & Sign": {
    hi: "सहेजें एवं हस्ताक्षर करें",
    gu: "સાચવો અને સહી કરો"
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
  }
};

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

    // Do not translate code blocks, script tags, or the language switcher itself
    if (parentEl.closest('.language-switcher-ignore') || parentEl.tagName === 'SCRIPT' || parentEl.tagName === 'STYLE') {
      continue;
    }

    const originalText = parentEl.getAttribute('data-original-text') || text;

    if (targetLang === 'en') {
      if (parentEl.hasAttribute('data-original-text')) {
        node.nodeValue = parentEl.getAttribute('data-original-text');
        parentEl.removeAttribute('data-original-text');
      }
    } else {
      // 1. Direct exact match
      if (COMPREHENSIVE_TRANSLATION_MAP[originalText]) {
        const translated = COMPREHENSIVE_TRANSLATION_MAP[originalText][targetLang];
        if (translated) {
          if (!parentEl.hasAttribute('data-original-text')) {
            parentEl.setAttribute('data-original-text', originalText);
          }
          node.nodeValue = translated;
          continue;
        }
      }

      // 2. Substring matching for labels
      for (const [key, val] of Object.entries(COMPREHENSIVE_TRANSLATION_MAP)) {
        if (text === key) {
          if (!parentEl.hasAttribute('data-original-text')) {
            parentEl.setAttribute('data-original-text', originalText);
          }
          node.nodeValue = val[targetLang];
          break;
        }
      }
    }
  }
}
