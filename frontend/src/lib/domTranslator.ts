/**
 * DOM Translator for Clinical Screening Report
 * --------------------------------------------
 * Dynamically translates static strings on the clinical report page
 * without mutating the underlying component source code.
 */

import { SupportedLanguage } from './reportTranslations';

const TRANSLATION_MAP: Record<string, { hi: string; gu: string }> = {
  "Clinical Retinal Tele-Screening": {
    hi: "क्लिनिकल रेटिना टेली-स्क्रीनिंग",
    gu: "ક્લિનિકલ રેટિના ટેલિ-સ્ક્રીનિંગ"
  },
  "Diagnostic Deep Learning Assessment Report": {
    hi: "डायग्नोस्टिक डीप लर्निंग मूल्यांकन रिपोर्ट",
    gu: "ડાયગ્નોસ્ટિક ડીપ લર્નિંગ મૂલ્યાંકન અહેવાલ"
  },
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
  "Current Screening Diagnostic Grading": {
    hi: "वर्तमान स्क्रीनिंग डायग्नोस्टिक ग्रेडिंग",
    gu: "હાલનું સ્ક્રીનિંગ ડાયગ્નોસ્ટિક ગ્રેડિંગ"
  },
  "Comparative Fundus Diagnostic Matrix": {
    hi: "तुलनात्मक रेटिना डायग्नोस्टिक मैट्रिक्स",
    gu: "તુલનાત્મક રેટિના ડાયગ્નોસ્ટિક મેટ્રિક્સ"
  },
  "Synchronized clinical side-by-side inspection": {
    hi: "समानांतर क्लिनिकल रेटिना तुलनात्मक परीक्षण",
    gu: "સમાંતર ક્લિનિકલ રેટિના તુલનાત્મક તપાસ"
  },
  "Quantitative Lesion Distribution & Optical Assessment": {
    hi: "मात्रात्मक घाव वितरण एवं ऑप्टिकल मूल्यांकन",
    gu: "જથ્થાત્મક ક્ષતિ વિતરણ અને ઓપ્ટિકલ મૂલ્યાંકન"
  },
  "Microaneurysms (MA)": {
    hi: "माइक्रोएन्यूरिज्म (MA)",
    gu: "માઇક્રોએન્યુરિઝમ (MA)"
  },
  "Hemorrhages (HEM)": {
    hi: "रक्तस्राव (Hemorrhages)",
    gu: "રેટિના હેમરેજ"
  },
  "Hard Exudates (EX)": {
    hi: "हार्ड एक्सुडेट्स (वसा जमाव)",
    gu: "હાર્ડ એક્સ્યુડેટ્સ"
  },
  "Focal Vascular Dilations": {
    hi: "सूक्ष्म रक्तवाहिका फैलाव",
    gu: "સૂક્ષ્મ રક્તવાહિની વિસ્તરણ"
  },
  "Intra-Retinal Micro-Bleeds": {
    hi: "रेटिना के भीतर सूक्ष्म रक्तस्राव",
    gu: "રેટિના અંદર સૂક્ષ્મ રક્તસ્ત્રાવ"
  },
  "Lipoprotein Deposition": {
    hi: "लाइपोप्रोटीन वसा जमाव",
    gu: "લિપોપ્રોટીન ચરબી જમાવટ"
  },
  "Vessel Arborization": {
    hi: "रक्तवाहिका संरचना परीक्षण",
    gu: "રક્તવાહિની સંરચના તપાસ"
  },
  "1. Raw Fundus Capture": {
    hi: "1. मूल फंडस छवि (Raw)",
    gu: "1. મૂળ ફંડસ ફોટો (Raw)"
  },
  "2. CLAHE Contrast": {
    hi: "2. एन्हांस्ड कन्ट्रास्ट (CLAHE)",
    gu: "2. ઉન્નત કોન્ટ્રાસ્ટ (CLAHE)"
  },
  "3. U-Net Lesion Mask": {
    hi: "3. घाव विभाजन मास्क (U-Net)",
    gu: "3. ક્ષતિ વિભાજન માસ્ક (U-Net)"
  },
  "4. Grad-CAM Activation": {
    hi: "4. ग्रेड-कैम हीटमैप (Grad-CAM)",
    gu: "4. ગ્રેડ-કેમ હીટમેપ (Grad-CAM)"
  },
  "Print / PDF": {
    hi: "प्रिंट / पीडीएफ",
    gu: "પ્રિન્ટ / પીડીએફ"
  },
  "Audit Trail": {
    hi: "ऑडिट ट्रेल",
    gu: "ઓડિટ ટ્રેઇલ"
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
    const text = node.nodeValue?.trim();
    if (!text) continue;

    // Check if node has stored original text
    const parentEl = node.parentElement;
    if (!parentEl) continue;

    const originalText = parentEl.getAttribute('data-original-text') || text;

    if (targetLang === 'en') {
      if (parentEl.hasAttribute('data-original-text')) {
        node.nodeValue = parentEl.getAttribute('data-original-text');
        parentEl.removeAttribute('data-original-text');
      }
    } else {
      if (TRANSLATION_MAP[originalText]) {
        const translated = TRANSLATION_MAP[originalText][targetLang];
        if (translated) {
          if (!parentEl.hasAttribute('data-original-text')) {
            parentEl.setAttribute('data-original-text', originalText);
          }
          node.nodeValue = translated;
        }
      }
    }
  }
}
