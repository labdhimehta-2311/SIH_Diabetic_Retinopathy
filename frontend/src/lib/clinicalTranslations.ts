/**
 * Clinical Guidance Localization Service
 * ----------------------------------------
 * Provides authenticated, textbook-grounded medical guidance for:
 * 1. Evidence-Based Health & Supportive Lifestyle Measures (ADA/AAO)
 * 2. Relevant Clinical Medications & Pharmacotherapy (Goodman & Gilman 14th Ed. / Katzung 15th Ed.)
 * 
 * Supports full localization in:
 * - English ('en')
 * - हिन्दी ('hi')
 * - ગુજરાતી ('gu')
 * 
 * Invariant: All core medicine names (e.g. Aflibercept, Ranibizumab, Faricimab, Ozurdex, Lisinopril, Fenofibrate)
 * and medical/biochemical abbreviations (VEGF, Anti-VEGF, PlGF, Kd, Ang-2, Tie2, PPAR-alpha, RAAS, SMBG, CGM, HbA1c, LDL, mg/dL, mmHg, eGFR)
 * remain in English across all languages as requested.
 */

import { HealthSupportiveMeasures, OfficialMedicationsGuidance, ClinicalVitals } from './patientService';

export function getLocalizedHealthMeasures(grade: number, lang: 'en' | 'hi' | 'gu' = 'en'): HealthSupportiveMeasures {
  const disclaimerEn =
    "CLINICAL SAFETY NOTICE: The following supportive measures are general, evidence-based recommendations derived from international clinical guidelines (ADA Standards of Care / AAO). They do not constitute personalized medical prescriptions and are not a cure for diabetic retinopathy. Individualized adjustments must be made in consultation with the treating physician.";
  
  const disclaimerHi =
    "क्लिनिकल सुरक्षा सूचना: निम्नलिखित सहायक उपाय अंतरराष्ट्रीय दिशा-निर्देशों (ADA / AAO) पर आधारित सामान्य साक्ष्य-समर्थित अनुशंसाएं हैं। ये व्यक्तिगत नुस्खे नहीं हैं और डायबिटिक रेटिनोपैथी का पूर्ण इलाज नहीं हैं। व्यक्तिगत बदलाव उपचार करने वाले चिकित्सक के परामर्श से ही किए जाने चाहिए।";

  const disclaimerGu =
    "ક્લિનિકલ સુરક્ષા સૂચના: નીચે આપેલા સહાયક પગલાં આંતરરાષ્ટ્રીય માર્ગદર્શિકાઓ (ADA / AAO) પર આધારિત સામાન્ય પુરાવા-સમર્થિત ભલામણો છે. આ વ્યક્તિગત પ્રિસ્ક્રિપ્શન નથી અને ડાયાબિટીક રેટિનોપેથીનો કાયમી ઈલાજ નથી. વ્યક્તિગત ફેરફારો સારવાર કરતા ડૉક્ટરની સલાહ મુજબ જ કરવા જોઈએ.";

  if (grade >= 3) {
    // Severe NPDR or PDR (Grade 3 or 4)
    if (lang === 'hi') {
      return {
        conditionFocus: "उच्च जोखिम डायबिटिक रेटिनोपैथी माइक्रोवैस्कुलर स्थिरीकरण",
        physicalActivity: {
          recommendation: "प्रतिदिन 20 से 30 मिनट हल्का से मध्यम टहलना या गैर-प्रभाव एरोबिक व्यायाम करें।",
          precautions: "गंभीर चेतावनी: भारी वजन उठाना, अत्यधिक तीव्र व्यायाम, उल्टे आसन (शीर्षासन) या ज़ोर लगाने वाली गतिविधियों (Valsalva) से पूरी तरह बचें, जिससे Intraocular Pressure बढ़ सकता है और Vitreous Hemorrhage का खतरा हो सकता है।"
        },
        dietaryAndNutrition: {
          guideline: "हरी पत्तेदार सब्जियों, एंटीऑक्सीडेंट्स (Lutein, Zeaxanthin) और साबुत अनाजों से भरपूर सख्त Mediterranean या DASH आहार अपनाएं और रिफाइंड शुगर से पूरी तरह परहेज करें।",
          glycemicControlTip: "भोजन के बाद रक्त शर्करा के अचानक उछाल (Postprandial spikes) को न्यूनतम रखें; बड़े शर्करा उतार-चढ़ाव रेटिना की सूक्ष्म केशिकाओं की नाजुकता को बढ़ा सकते हैं।"
        },
        monitoringAndAdherence: {
          selfMonitoring: "दैनिक SMBG (Self-Monitoring of Blood Glucose) करें या CGM का उपयोग करें। लक्षित सीमा (70-180 mg/dL) में समय > 70% रखें।",
          followUpSchedule: "1 से 4 सप्ताह के भीतर तत्काल Vitreoretinal विशेषज्ञ से परामर्श लें। निर्धारित रेटिना इमेजिंग एवं लेजर/इंजेक्शन अपॉइंटमेंट में देरी न करें।"
        },
        riskFactorManagement: {
          bloodPressureTarget: "सख्त रक्तचाप नियंत्रण (ADA मानकों के अनुसार लक्ष्य < 130/80 mmHg)।",
          lipidTarget: "सक्रिय लिपिड प्रबंधन; रेटिना में Hard Exudates के संचय को कम करने हेतु LDL < 70 mg/dL का लक्ष्य रखें।"
        },
        medicalDisclaimer: disclaimerHi
      };
    } else if (lang === 'gu') {
      return {
        conditionFocus: "ઉચ્ચ જોખમ ડાયાબિટીક રેટિનોપેથી માઇક્રોવેસ્ક્યુલર સ્થિરતા",
        physicalActivity: {
          recommendation: "દરરોજ 20 થી 30 મિનિટ હળવું કે મધ્યમ ચાલવું અથવા નોન-ઇમ્પેક્ટ એરોબિક કસરત કરો.",
          precautions: "ગંભીર ચેતવણી: ભારે વજન ઉપાડવું, અતિશય કઠિન કસરત, માથું નીચે હોય તેવા આસન કે વધુ પડતો શ્રમ (Valsalva) કરવાથી સદંતર દૂર રહો, કારણ કે તેનાથી Intraocular Pressure વધી શકે છે અને Vitreous Hemorrhage થવાનું જોખમ રહે છે."
        },
        dietaryAndNutrition: {
          guideline: "લીલા પાંદડાવાળા શાકભાજી, એન્ટીઓક્સીડેન્ટ્સ (Lutein, Zeaxanthin) અને આખા અનાજથી ભરપૂર કડક Mediterranean અથવા DASH આહારનું પાલન કરો અને રિફાઇન્ડ શુગરથી સંપૂર્ણપણે દૂર રહો.",
          glycemicControlTip: "જમ્યા પછી બ્લડ શુગરમાં અચાનક વધારો (Postprandial spikes) ન થવા દો; શુગરમાં ઝડપી ફેરફારો રેટિનાની સૂક્ષ્મ રક્તવાહિનીઓની નાજુકતા વધારી શકે છે."
        },
        monitoringAndAdherence: {
          selfMonitoring: "દરરોજ SMBG (Self-Monitoring of Blood Glucose) અથવા CGM નો ઉપયોગ કરો. લક્ષિત રેન્જ (70-180 mg/dL) માં સમય > 70% જાળવો.",
          followUpSchedule: "1 થી 4 અઠવાડિયામાં તાત્કાલિક Vitreoretinal નિષ્ણાત પાસે ફોલો-અપ કરાવો. નિર્ધારિત રેટિના ઇમેજિંગ અને લેસર/ઇન્જેક્શન મુલાકાતમાં વિલંબ કરશો નહીં."
        },
        riskFactorManagement: {
          bloodPressureTarget: "કડક બ્લડ પ્રેશર નિયંત્રણ (ADA ધોરણો અનુસાર લક્ષ્ય < 130/80 mmHg).",
          lipidTarget: "સક્રિય લિપિડ નિયંત્રણ; રેટિનામાં Hard Exudates નો ભરાવો ઘટાડવા LDL < 70 mg/dL નું લક્ષ્ય રાખો."
        },
        medicalDisclaimer: disclaimerGu
      };
    } else {
      return {
        conditionFocus: "High-Risk Diabetic Retinopathy Microvascular Stabilization",
        physicalActivity: {
          recommendation: "Engage in gentle to moderate walking or non-impact aerobic exercise (20-30 minutes daily).",
          precautions: "CRITICAL: Strictly avoid vigorous high-intensity exercise, heavy weightlifting, inverted postures, or strenuous Valsalva maneuvers (straining) which can spike intraocular pressure and precipitate vitreous hemorrhage."
        },
        dietaryAndNutrition: {
          guideline: "Adopt a strict Mediterranean or DASH dietary pattern rich in leafy vegetables, antioxidants (lutein, zeaxanthin), and whole grains while strictly avoiding refined sugars.",
          glycemicControlTip: "Minimize postprandial glucose surges; rapid large glycemic swings can aggravate retinal microvascular capillary fragility."
        },
        monitoringAndAdherence: {
          selfMonitoring: "Perform daily SMBG (Self-Monitoring of Blood Glucose) or use continuous glucose monitoring (CGM). Target time-in-range (70-180 mg/dL) > 70%.",
          followUpSchedule: "Urgent vitreoretinal follow-up required within 1 to 4 weeks. Do not delay scheduled retinal imaging and laser/injection appointments."
        },
        riskFactorManagement: {
          bloodPressureTarget: "Strict blood pressure control (Target < 130/80 mmHg per ADA 2024 standards).",
          lipidTarget: "Aggressive lipid management; target LDL < 70 mg/dL to reduce retinal hard exudate accumulation."
        },
        medicalDisclaimer: disclaimerEn
      };
    }
  } else if (grade >= 1) {
    // Mild to Moderate NPDR (Grade 1 or 2)
    if (lang === 'hi') {
      return {
        conditionFocus: "प्रारंभिक से मध्यम डायबिटिक रेटिनोपैथी प्रगति रोकथाम",
        physicalActivity: {
          recommendation: "प्रति सप्ताह कम से कम 150 मिनट मध्यम तीव्रता वाली एरोबिक शारीरिक गतिविधि (जैसे तेज चलना, साइकिल चलाना, तैराकी) करें जो कम से कम 3 दिनों में वितरित हो।",
          precautions: "शारीरिक गतिविधि के दौरान पर्याप्त जलपान (Hydration) बनाए रखें। बिना सुरक्षात्मक चश्मे के खेलकूद या अचानक आंख पर चोट के जोखिमों से बचें।"
        },
        dietaryAndNutrition: {
          guideline: "आहारीय फाइबर, ओमेगा-3 फैटी एसिड और कम ग्लाइसेमिक इंडेक्स वाले कार्बोहाइड्रेट पर ध्यान दें। आहार में सोडियम < 2,300 mg/दिन तक सीमित करें।",
          glycemicControlTip: "भोजन में कार्बोहाइड्रेट का संतुलित वितरण स्थिर ग्लाइसेमिक नियंत्रण बनाए रखने में मदद करता है।"
        },
        monitoringAndAdherence: {
          selfMonitoring: "नियमित रूप से उपवास (Fasting) और भोजन के बाद रक्त शर्करा की जांच करें। त्रैमासिक HbA1c की निगरानी करें ताकि लक्ष्य < 7.0% बना रहे।",
          followUpSchedule: "सूक्ष्म संवहनी स्थिरता की निगरानी हेतु प्रत्येक 3 से 6 महीने में व्यापक विस्तृत पुतली नेत्र परीक्षण (Dilated Eye Exam) कराएं।"
        },
        riskFactorManagement: {
          bloodPressureTarget: "Systolic रक्तचाप < 130 mmHg और Diastolic < 80 mmHg बनाए रखें।",
          lipidTarget: "सीरम ट्राइग्लिसराइड्स को नियंत्रित करें और प्रगतिशील लिपिड रिसाव को रोकने के लिए LDL < 100 mg/dL बनाए रखें।"
        },
        medicalDisclaimer: disclaimerHi
      };
    } else if (lang === 'gu') {
      return {
        conditionFocus: "પ્રારંભિકથી મધ્યમ ડાયાબિટીક રેટિનોપેથી વધતી અટકાવવાના પગલાં",
        physicalActivity: {
          recommendation: "દર અઠવાડિયે ઓછામાં ઓછી 150 મિનિટ મધ્યમ-તીવ્રતાવાળી એરોબિક પ્રવૃત્તિ (જેમ કે ઝડપી ચાલવું, સાયકલિંગ, તરવું) કરો જે ઓછામાં ઓછા 3 દિવસમાં વહેંચાયેલી હોય.",
          precautions: "શારીરિક પ્રવૃત્તિ દરમિયાન પૂરતું પાણી (Hydration) પીતા રહો. આંખની સુરક્ષા વગર રમતો રમવાથી કે આંખ પર ઇજાના જોખમથી બચો."
        },
        dietaryAndNutrition: {
          guideline: "આહારમાં ફાઇબર, ઓમેગા-3 ફેટી એસિડ્સ અને લો-ગ્લાયસેમિક ઇન્ડેક્સ ખોરાક લો. આહારમાં સોડિયમનું પ્રમાણ < 2,300 mg/દિવસ સુધી મર્યાદિત રાખો.",
          glycemicControlTip: "ભોજનમાં કાર્બોહાઇડ્રેટનું સંતુલિત વિતરણ બ્લડ શુગરનું સ્થિર નિયંત્રણ જાળવવામાં મદદ કરે છે."
        },
        monitoringAndAdherence: {
          selfMonitoring: "નિયમિતપણે ભૂખ્યા પેટે (Fasting) અને જમ્યા પછી બ્લડ શુગર તપાસો. દર 3 મહિને HbA1c ચેક કરો જેથી લક્ષ્યાંક < 7.0% જળવાય.",
          followUpSchedule: "સૂક્ષ્મ રક્તવાહિની સ્થિરતાની દેખરેખ માટે દર 3 થી 6 મહિને કીકી મોટી કરીને રેટિનાની વિસ્તૃત તપાસ (Dilated Eye Exam) કરાવો.",
        },
        riskFactorManagement: {
          bloodPressureTarget: "Systolic બ્લડ પ્રેશર < 130 mmHg અને Diastolic < 80 mmHg જાળવી રાખો.",
          lipidTarget: "સીરમ ટ્રાઇગ્લિસરાઇડ્સ નિયંત્રિત કરો અને રેટિનામાં પ્રવાહી લિકેજ રોકવા LDL < 100 mg/dL જાળવો."
        },
        medicalDisclaimer: disclaimerGu
      };
    } else {
      return {
        conditionFocus: "Early-to-Intermediate Diabetic Retinopathy Progression Prevention",
        physicalActivity: {
          recommendation: "Aim for at least 150 minutes of moderate-intensity aerobic physical activity per week (e.g. brisk walking, cycling, swimming) spread over at least 3 days.",
          precautions: "Stay well-hydrated during physical activity. Avoid sudden extreme ocular trauma risks (contact sports without protective eyewear)."
        },
        dietaryAndNutrition: {
          guideline: "Focus on dietary fiber, omega-3 fatty acids, and low-glycemic-index carbohydrates. Restrict dietary sodium to < 2,300 mg/day.",
          glycemicControlTip: "Consistency in carbohydrate distribution across meals helps maintain steady glycemic control."
        },
        monitoringAndAdherence: {
          selfMonitoring: "Monitor fasting and post-meal blood glucose routinely. Track quarterly HbA1c to ensure target remains < 7.0%.",
          followUpSchedule: "Comprehensive dilated eye examination every 3 to 6 months to monitor microvascular stability."
        },
        riskFactorManagement: {
          bloodPressureTarget: "Maintain systolic blood pressure < 130 mmHg and diastolic < 80 mmHg.",
          lipidTarget: "Control serum triglycerides and maintain LDL < 100 mg/dL to prevent progressive lipid leakage."
        },
        medicalDisclaimer: disclaimerEn
      };
    }
  } else {
    // Grade 0: No Apparent DR
    if (lang === 'hi') {
      return {
        conditionFocus: "प्राथमिक रेटिनोपैथी रोकथाम एवं मेटाबोलिक अनुकूलन",
        physicalActivity: {
          recommendation: "सक्रिय जीवनशैली बनाए रखें, प्रति सप्ताह 150-300 मिनट मध्यम एरोबिक व्यायाम और 2 प्रतिरोध सत्र करें।",
          precautions: "मानक हृदय संबंधी सुरक्षा मंजूरी।"
        },
        dietaryAndNutrition: {
          guideline: "साबुत खाद्य पदार्थों, रंगीन सब्जियों, फलियों और लीन प्रोटीन पर जोर देने वाला संतुलित पोषक तत्वों से भरपूर आहार लें।",
          glycemicControlTip: "रेटिना केशिकाओं की सुरक्षा के लिए इष्टतम ग्लाइसेमिक नियंत्रण (लक्ष्य HbA1c < 6.5–7.0%) बनाए रखें।"
        },
        monitoringAndAdherence: {
          selfMonitoring: "प्रत्येक 3-6 महीने में नियमित उपवास ग्लूकोज और HbA1c की जांच कराएं।",
          followUpSchedule: "वार्षिक नियमित पुतली फैलाकर रेटिना परीक्षण (Annual Dilated Exam)।"
        },
        riskFactorManagement: {
          bloodPressureTarget: "सामान्य रक्तचाप लक्ष्य (< 120/80 mmHg)।",
          lipidTarget: "प्रतिवर्ष नियमित लिपिड प्रोफाइल स्क्रीनिंग कराएं।"
        },
        medicalDisclaimer: disclaimerHi
      };
    } else if (lang === 'gu') {
      return {
        conditionFocus: "પ્રાથમિક રેટિનોપેથી નિવારણ અને મેટાબોલિક સંતુલન",
        physicalActivity: {
          recommendation: "સક્રિય જીવનશૈલી જાળવો, દર અઠવાડિયે 150-300 મિનિટ મધ્યમ એરોબિક કસરત અને 2 રેઝિસ્ટન્સ સત્રો કરો.",
          precautions: "સામાન્ય કાર્ડિયોવેસ્ક્યુલર સુરક્ષા મંજૂરી."
        },
        dietaryAndNutrition: {
          guideline: "સમતોલ પોષક તત્વોથી ભરપૂર આહાર લો જેમાં આખા અનાજ, શાકભાજી, કઠોળ અને પ્રોટીન શામેલ હોય.",
          glycemicControlTip: "રેટિનાની નળીઓની સુરક્ષા માટે આદર્શ બ્લડ શુગર નિયંત્રણ (લક્ષ્ય HbA1c < 6.5–7.0%) જાળવો."
        },
        monitoringAndAdherence: {
          selfMonitoring: "દર 3-6 મહિને નિયમિત ભૂખ્યા પેટે શુગર અને HbA1c ની તપાસ કરાવો.",
          followUpSchedule: "વાર્ષિક નિયમિત કીકી મોટી કરીને રેટિના પરીક્ષણ (Annual Dilated Exam)."
        },
        riskFactorManagement: {
          bloodPressureTarget: "સામાન્ય બ્લડ પ્રેશર લક્ષ્યાંક (< 120/80 mmHg).",
          lipidTarget: "દર વર્ષે નિયમિત લિપિડ પ્રોફાઇલ ટેસ્ટ કરાવો."
        },
        medicalDisclaimer: disclaimerGu
      };
    } else {
      return {
        conditionFocus: "Primary Retinopathy Prevention & Metabolic Optimization",
        physicalActivity: {
          recommendation: "Maintain an active lifestyle with 150–300 minutes of moderate aerobic exercise and 2 resistance sessions per week.",
          precautions: "Standard cardiovascular safety clearance."
        },
        dietaryAndNutrition: {
          guideline: "Balanced nutrient-dense diet emphasizing whole foods, colorful vegetables, legumes, and lean proteins.",
          glycemicControlTip: "Maintain optimal glycemic control (target HbA1c < 6.5–7.0%) to prevent initial capillary pericyte loss."
        },
        monitoringAndAdherence: {
          selfMonitoring: "Regular fasting glucose and HbA1c checks every 3–6 months.",
          followUpSchedule: "Annual routine dilated fundus examination."
        },
        riskFactorManagement: {
          bloodPressureTarget: "Normotensive targets (< 120/80 mmHg).",
          lipidTarget: "Routine lipid panel screening annually."
        },
        medicalDisclaimer: disclaimerEn
      };
    }
  }
}

export function getLocalizedMedicationsGuidance(
  grade: number,
  referable: boolean,
  vitals?: ClinicalVitals,
  lang: 'en' | 'hi' | 'gu' = 'en'
): OfficialMedicationsGuidance {
  const disclaimerEn =
    "OFFICIAL PHARMACOTHERAPY REFERENCE FOR CLINICIANS: All listed medications, therapeutic classes, biological mechanisms, and dosing guidelines are grounded in recognized medical pharmacology textbooks (Goodman & Gilman's The Pharmacological Basis of Therapeutics 14th Ed.; Katzung's Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP). This document is strictly an evidence-based clinical aid for licensed ophthalmologists and physicians. It DOES NOT constitute an autonomous prescription or automated drug dispensing order. Individual patient pharmacotherapy must be tailored following comprehensive systemic and vitreoretinal examination.";

  const disclaimerHi =
    "चिकित्सकों हेतु आधिकारिक फार्माकोथेरेपी संदर्भ: सभी सूचीबद्ध दवाइयां, चिकित्सीय वर्ग, जैविक तंत्र और खुराक दिशा-निर्देश मान्यता प्राप्त मेडिकल फार्माकोलॉजी पाठ्यपुस्तकों (Goodman & Gilman's The Pharmacological Basis of Therapeutics 14th Ed.; Katzung's Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP) पर आधारित हैं। यह दस्तावेज लाइसेंस प्राप्त नेत्र विशेषज्ञों और डॉक्टरों के लिए विशुद्ध रूप से एक साक्ष्य-आधारित नैदानिक सहायता है। यह कोई स्वचालित नुस्खा या दवा वितरण आदेश नहीं है। संपूर्ण शारीरिक एवं रेटिना परीक्षण के उपरांत ही प्रत्येक रोगी के लिए व्यक्तिगत चिकित्सा तय की जानी चाहिए।";

  const disclaimerGu =
    "તબીબો માટે સત્તાવાર ફાર્માકોથેરાપી સંદર્ભ: તમામ સૂચિબદ્ધ દવાઓ, ઉપચારાત્મક વર્ગો, જૈવિક પદ્ધતિઓ અને ડોઝિંગ માર્ગદર્શિકા માન્યતા પ્રાપ્ત મેડિકલ ફાર્માકોલોજી પાઠ્યપુસ્તકો (Goodman & Gilman's The Pharmacological Basis of Therapeutics 14th Ed.; Katzung's Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP) પર આધારિત છે. આ દસ્તાવેજ પ્રમાણિત નેત્ર નિષ્ણાતો અને ડૉક્ટરો માટે સંપૂર્ણપણે પુરાવા-આધારિત ક્લિનિકલ સહાય છે. આ કોઈ ઓટોમેટેડ પ્રિસ્ક્રિપ્શન કે દવા આપવાનો આદેશ નથી. વ્યક્તિગત દર્દીની ફાર્માકોથેરાપી સંપૂર્ણ આંખ અને શારીરિક તપાસ પછી જ નક્કી કરવી જોઈએ.";

  const disclaimer = lang === 'hi' ? disclaimerHi : lang === 'gu' ? disclaimerGu : disclaimerEn;

  if (grade === 4) {
    if (lang === 'hi') {
      return {
        grade: 4,
        stageTitle: "प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी (PDR) — सक्रिय नियोवैस्कुलराइजेशन अवस्था",
        clinicalSummary: "अत्यधिक रेटिना इस्किमिया के कारण Intraocular VEGF में भारी वृद्धि, प्री-रेटिना या डिस्क पर असामान्य नई रक्तवाहिकाएं (NVD/NVE), तथा Vitreous Hemorrhage या Tractional Retinal Detachment का उच्च जोखिम। तत्काल Intravitreal Biologic Anti-VEGF थेरेपी अनुशंसित है।",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
          "Katzung’s Basic & Clinical Pharmacology (15th Ed.), Chapter 65: Specialized Biologics & Ophthalmic Therapeutics",
          "American Academy of Ophthalmology (AAO) Retina/Vitreous Preferred Practice Pattern (2023–2024)",
          "DRCR Retina Network Protocols S & T (JAMA Ophthalmology / NEJM)"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept (Eylea / VEGF Trap-Eye)",
            genericInn: "Aflibercept (recombinant fusion protein)",
            pharmacologicalClass: "घुलनशील डिकॉय रिसेप्टर फ्यूजन प्रोटीन (VEGFR-1 एवं VEGFR-2 फ्यूज्ड टू ह्यूमन IgG1 Fc)",
            routeAndDosing: "Intravitreal Injection: 2.0 mg (0.05 mL) प्रथम 5 खुराकों के लिए प्रत्येक 4 सप्ताह में, तत्पश्चात प्रत्येक 8 सप्ताह में (Treat-and-extend लचीलेपन के साथ)।",
            clinicalIndication: "उच्च जोखिम Proliferative Diabetic Retinopathy (PDR) और Center-Involving Diabetic Macular Edema (CI-DME)।",
            mechanismOfAction: "सभी आइसोफॉर्म डिकॉय रिसेप्टर के रूप में कार्य करता है जो पिकोमोलर आत्मीयता (Kd ~0.5 pM) के साथ VEGF-A, VEGF-B और Placental Growth Factor (PlGF) को बांधता है, जिससे एंडोथेलियल VEGFR सक्रियण पूरी तरह रुक जाता है, असामान्य नियोवैस्कुलराइजेशन अवरुद्ध होता है और रिसने वाली केशिकाएं सील होती हैं।",
            prescribingConsiderations: "30-गेज सुई का उपयोग करके स्टेराइल ऑप्थेलमिक परिस्थितियों में प्रशासित किया जाना चाहिए। इंजेक्शन के 30 मिनट बाद Intraocular Pressure (IOP) की निगरानी करें। सक्रिय नेत्र संक्रमण की जांच करें।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenic Agents, pp. 1247–1249",
              biologicalPharmacology: "Recombinant dimeric glycoprotein blocking VEGF-A/B and PlGF signaling pathways with higher binding affinity than native receptors.",
              trialEvidence: "DRCR.net Protocol T (NEJM 2015; 372:1193-1204) & VIVID/VISTA Trials (Ophthalmology 2015)"
            }
          },
          {
            drugName: "Ranibizumab (Lucentis)",
            genericInn: "Ranibizumab",
            pharmacologicalClass: "पुनः संयोजक मानवीकृत मोनोक्लोनल एंटीबॉडी Fab फ्रैगमेंट",
            routeAndDosing: "Intravitreal Injection: PDR हेतु 0.5 mg (0.05 mL) या DME हेतु 0.3 mg (0.05 mL) मासिक रूप से।",
            clinicalIndication: "Proliferative Diabetic Retinopathy और Diabetic Macular Edema।",
            mechanismOfAction: "Fc डोमेन रहित उच्च आत्मीयता मानवीकृत Fab फ्रैगमेंट जो VEGF-A के सभी जैविक रूप से सक्रिय आइसोफॉर्म (क्लीव्ड VEGF110 सहित) को चयनात्मक रूप से बांधकर निष्क्रिय करता है, एंडोथेलियल प्रसार को रोकता है और संवहनी रिसाव को कम करता है।",
            prescribingConsiderations: "दृष्टि तीक्ष्णता संरक्षण हेतु Panretinal Photocoagulation (PRP) के गैर-हीन (non-inferior) सिद्ध, जिसमें परिधीय दृश्य क्षेत्र के नुकसान की दर कम होती है।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1248–1250",
              biologicalPharmacology: "Monoclonal antibody Fab fragment engineered without Fc domain to accelerate retinal penetration and vitreal clearance while neutralizing VEGF-A.",
              trialEvidence: "DRCR.net Protocol S (JAMA 2015; 314:2137-2146) & RIDE/RISE Trials"
            }
          },
          {
            drugName: "Faricimab (Vabysmo)",
            genericInn: "Faricimab-svoa",
            pharmacologicalClass: "बायस्पेसिफिक मोनोक्लोनल एंटीबॉडी (डुअल VEGF-A एवं Angiopoietin-2 [Ang-2] एंटागोनिस्ट)",
            routeAndDosing: "Intravitreal Injection: प्रारंभिक 4 खुराकों हेतु प्रत्येक 4 सप्ताह में 6.0 mg (0.05 mL), तत्पश्चात OCT-निर्देशित 8, 12, या 16 सप्ताह में रखरखाव।",
            clinicalIndication: "सक्रिय Proliferative Diabetic Retinopathy और विस्तारित स्थायित्व की आवश्यकता वाला Diabetic Macular Edema।",
            mechanismOfAction: "दोहरे लक्ष्य वाला बायोलॉजिक जो एक साथ VEGF-A को निष्क्रिय करता है और Angiopoietin-2 (Tie2 रिसेप्टर एंटागोनिज्म) को रोकता है। यह दोहरा अवरोध संवहनी जंक्शनों की मजबूती और पेरिसाइट सुरक्षा को पुनर्स्थापित करता है, जिससे रेटिना संवहनी रिसाव और सूजन में भारी कमी आती है।",
            prescribingConsiderations: "60% से अधिक पात्र रोगियों में विस्तारित उपचार अंतराल (16 सप्ताह तक) की अनुमति देता है, जिससे इंजेक्शन आवृत्ति का बोझ कम होता है।",
            officialTextbookReference: {
              bookTitle: "Katzung’s Basic & Clinical Pharmacology (15th Edition)",
              chapterAndSection: "Chapter 65: Specialized Biologics & Ophthalmic Therapeutics — Dual-Pathway Inhibitors",
              biologicalPharmacology: "First bispecific antibody approved for the eye, modulating both VEGF-mediated angiogenesis and Ang-2-mediated vascular destabilization.",
              trialEvidence: "YOSEMITE and RHINE 2-Year Phase III Clinical Trials (Lancet 2022; 399:741-755)"
            }
          },
          {
            drugName: "Dexamethasone Intravitreal Implant (Ozurdex)",
            genericInn: "Dexamethasone (sustained-release PLGA polymer matrix)",
            pharmacologicalClass: "शक्तिशाली सिंथेटिक ग्लूकोकार्टिकोइड सूजन-रोधी इम्प्लांट",
            routeAndDosing: "Intravitreal Implant: 22-गेज एप्लीकेटर द्वारा प्रत्येक 4 से 6 महीने में पोस्टीरियर विट्रियस में 0.7 mg सस्टेन्ड-रिलीज़ इम्प्लांट।",
            clinicalIndication: "Anti-VEGF के प्रति अनुत्तरदायी या स्यूडोफैसिक रोगियों में लगातार बना रहने वाला Diabetic Macular Edema।",
            mechanismOfAction: "ग्लूकोकोर्टिकोइड रिसेप्टर सक्रियण के माध्यम से VEGF, IL-6, ICAM-1 और प्रोस्टाग्लैंडीन के ट्रांसक्रिप्शन को रोकता है; एंडोथेलियल टाइट जंक्शनों को सुदृढ़ करता है और रक्त-रेटिना बाधा (Blood-Retinal Barrier) के टूटने को रोकता है।",
            prescribingConsiderations: "माध्यमिक ओकुलर हाइपरटेंशन की निगरानी करें (~25-30% आंखों में बढ़ा हुआ IOP, जो आई ड्रॉप्स द्वारा प्रबंधनीय है)। सक्रिय नेत्र संक्रमण में वर्जित।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 46: Adrenocorticotropic Hormone & Adrenal Steroids, pp. 815–826; Chapter 69, p. 1245",
              biologicalPharmacology: "Micronized dexamethasone in poly(lactic-co-glycolic acid) biodegradable polymer matrix providing therapeutic vitreous drug concentrations for up to 180 days.",
              trialEvidence: "MEAD Study Group (Ophthalmology 2014; 121:2473-2481)"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Lisinopril / Enalapril (or Telmisartan / Losartan)",
            genericInn: "Lisinopril (ACE Inhibitor) or Telmisartan (ARB)",
            pharmacologicalClass: "Renin-Angiotensin-Aldosterone System (RAAS) एंटागोनिस्ट",
            routeAndDosing: "Oral: Lisinopril 10–40 mg PO दिन में एक बार या Telmisartan 40–80 mg PO दिन में एक बार।",
            clinicalIndication: "रक्तचाप अनुकूलन (लक्ष्य <130/80 mmHg) और डायबिटिक रेटिनोपैथी में माइक्रोवैस्कुलर केशिका संरक्षण।",
            mechanismOfAction: "Angiotensin II-प्रेरित वाहिकासंकीर्णन को अवरुद्ध करता है, जिससे रेटिना केशिकाओं पर अत्यधिक दबाव कम होता है; रेटिना केशिका कोशिकाओं के अपोप्टोसिस को दबाता है और रेटिना VEGF अभिव्यक्ति को घटाता है।",
            prescribingConsiderations: "शुरुआत के 2 सप्ताह बाद सीरम क्रिएटिनिन और पोटेशियम की निगरानी करें। दोहरी ACE-I + ARB संयोजन से बचें।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
              biologicalPharmacology: "Competitive inhibition of angiotensin-converting enzyme prevents conversion of angiotensin I to active vasoconstrictor angiotensin II.",
              trialEvidence: "EUCLID Study (Lancet 1997) & DIRECT Retinopathy Program (Lancet 2008)"
            }
          },
          {
            drugName: "Fenofibrate (Lipanthyl / Tricor)",
            genericInn: "Fenofibrate",
            pharmacologicalClass: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) एगोनिस्ट",
            routeAndDosing: "Oral: भोजन के साथ दिन में एक बार 145 mg से 200 mg PO।",
            clinicalIndication: "डायबिटिक रेटिनोपैथी की प्रगति को धीमा करने और लेजर फोटोकोएग्यूलेशन की आवश्यकता को कम करने हेतु सहायक प्रणालीगत फार्माकोथेरेपी।",
            mechanismOfAction: "परमाणु रिसेप्टर PPAR-alpha को उत्तेजित करता है, फैटी एसिड बीटा-ऑक्सीकरण को बढ़ाता है, इंट्रा-रेटिनल सूजन को कम करता है, पेरिसाइट्स को नष्ट होने से बचाता है, और बेसलाइन ट्राइग्लिसराइड्स से स्वतंत्र होकर आंतरिक रक्त-रेटिना बाधा को संरक्षित करता है।",
            prescribingConsiderations: "हल्के से मध्यम क्रोनिक किडनी रोग (eGFR 30–59 mL/min) में खुराक में कमी आवश्यक। गंभीर गुर्दे की दुर्बलता (eGFR <30) में वर्जित।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 33: Lipid-Lowering Drugs — Fibrates, pp. 612–616",
              biologicalPharmacology: "Synthetic PPAR-alpha ligand modulating transcriptional expression of endothelial adhesion molecules and lipid transport apolipoproteins.",
              trialEvidence: "FIELD Trial (Lancet 2007; 370:1687-1697) & ACCORD-Eye Trial (NEJM 2010; 363:233-244)"
            }
          }
        ]
      };
    } else if (lang === 'gu') {
      return {
        grade: 4,
        stageTitle: "પ્રોલિફેરેટિવ ડાયાબિટીક રેટિનોપેથી (PDR) — સક્રિય નિયોવેસ્ક્યુલરાઇઝેશન તબક્કો",
        clinicalSummary: "તીવ્ર રેટિનલ ઇસ્કેમિયાને કારણે Intraocular VEGF માં મોટો વધારો, પ્રી-રેટિનલ અથવા ડિસ્ક પર નવી અસામાન્ય રક્તવાહિનીઓ (NVD/NVE), અને Vitreous Hemorrhage કે રેટિના અલગ પડવાનું ઉચ્ચ જોખમ. તાત્કાલિક Intravitreal Biologic Anti-VEGF સારવાર સૂચવવામાં આવે છે.",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
          "Katzung’s Basic & Clinical Pharmacology (15th Ed.), Chapter 65: Specialized Biologics & Ophthalmic Therapeutics",
          "American Academy of Ophthalmology (AAO) Retina/Vitreous Preferred Practice Pattern (2023–2024)",
          "DRCR Retina Network Protocols S & T (JAMA Ophthalmology / NEJM)"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept (Eylea / VEGF Trap-Eye)",
            genericInn: "Aflibercept (recombinant fusion protein)",
            pharmacologicalClass: "દ્રાવ્ય ડિકોય રીસેપ્ટર ફ્યુઝન પ્રોટીન (VEGFR-1 અને VEGFR-2 ફ્યુઝ્ડ ટુ હ્યુમન IgG1 Fc)",
            routeAndDosing: "Intravitreal Injection: પ્રથમ 5 ડોઝ માટે દર 4 અઠવાડિયે 2.0 mg (0.05 mL), ત્યારબાદ દર 8 અઠવાડિયે 2.0 mg (Treat-and-extend અનુકૂળતા સાથે).",
            clinicalIndication: "ઉચ્ચ જોખમ Proliferative Diabetic Retinopathy (PDR) અને Center-Involving Diabetic Macular Edema (CI-DME).",
            mechanismOfAction: "બધા આઇસોફોર્મ ડિકોય રીસેપ્ટર તરીકે કાર્ય કરે છે જે પિકોમોલર એફિનિટી (Kd ~0.5 pM) સાથે VEGF-A, VEGF-B અને Placental Growth Factor (PlGF) ને બાંધે છે, જેનાથી એન્ડોથેલિયલ VEGFR સક્રિયકરણ સંપૂર્ણપણે અટકે છે, અસામાન્ય નવી રક્તવાહિનીઓ બનતી અટકે છે અને લિક થતી નળીઓ સીલ થાય છે.",
            prescribingConsiderations: "30-ગેજ સોયનો ઉપયોગ કરીને જંતુમુક્ત નેત્ર પરિસ્થિતિઓમાં આપવું. ઇન્જેક્શન પછી 30 મિનિટે Intraocular Pressure (IOP) તપાસો. સક્રિય આંખના ચેપ માટે તપાસ કરો.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenic Agents, pp. 1247–1249",
              biologicalPharmacology: "Recombinant dimeric glycoprotein blocking VEGF-A/B and PlGF signaling pathways with higher binding affinity than native receptors.",
              trialEvidence: "DRCR.net Protocol T (NEJM 2015; 372:1193-1204) & VIVID/VISTA Trials (Ophthalmology 2015)"
            }
          },
          {
            drugName: "Ranibizumab (Lucentis)",
            genericInn: "Ranibizumab",
            pharmacologicalClass: "રિકોમ્બિનન્ટ હ્યુમનાઇઝ્ડ મોનોક્લોનલ એન્ટિબોડી Fab ફ્રેગમેન્ટ",
            routeAndDosing: "Intravitreal Injection: PDR માટે 0.5 mg (0.05 mL) અથવા DME માટે 0.3 mg (0.05 mL) દર મહિને.",
            clinicalIndication: "Proliferative Diabetic Retinopathy અને Diabetic Macular Edema.",
            mechanismOfAction: "Fc ડોમેન વગરનું હાઇ-એફિનિટી માનવીય Fab ફ્રેગમેન્ટ જે VEGF-A ના તમામ જૈવિક સક્રિય આઇસોફોર્મને બાંધીને નિષ્ક્રિય કરે છે, રક્તવાહિની કોષોનો અનિયંત્રિત ફેલાવો રોકે છે અને રક્તવાહિની લિકેજ ઘટાડે છે.",
            prescribingConsiderations: "દ્રષ્ટિ સુરક્ષિત રાખવા માટે Panretinal Photocoagulation (PRP) સમકક્ષ સાબિત, જેમાં પરિઘ દ્રષ્ટિ ક્ષેત્રનું નુકસાન ઓછું થાય છે.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1248–1250",
              biologicalPharmacology: "Monoclonal antibody Fab fragment engineered without Fc domain to accelerate retinal penetration and vitreal clearance while neutralizing VEGF-A.",
              trialEvidence: "DRCR.net Protocol S (JAMA 2015; 314:2137-2146) & RIDE/RISE Trials"
            }
          },
          {
            drugName: "Faricimab (Vabysmo)",
            genericInn: "Faricimab-svoa",
            pharmacologicalClass: "બાયસ્પેસિફિક મોનોક્લોનલ એન્ટિબોડી (ડ્યુઅલ VEGF-A અને Angiopoietin-2 [Ang-2] એન્ટાગોનિસ્ટ)",
            routeAndDosing: "Intravitreal Injection: પ્રથમ 4 ડોઝ માટે દર 4 અઠવાડિયે 6.0 mg (0.05 mL), ત્યારબાદ OCT-આધારિત દર 8, 12, અથવા 16 અઠવાડિયે.",
            clinicalIndication: "સક્રિય Proliferative Diabetic Retinopathy અને લાંબા સમયની સુરક્ષા માટે Diabetic Macular Edema.",
            mechanismOfAction: "બેવડા લક્ષ્યવાળું બાયોલોજિક જે એકસાથે VEGF-A ને નિષ્ક્રિય કરે છે અને Angiopoietin-2 ને રોકે છે. આ બેવડો અવરોધ રક્તવાહિનીઓની મજબૂતી અને પેરીસાઇટ કવરેજ પાછું લાવે છે, જેનાથી રેટિનલ લિકેજ અને સોજામાં મોટો ઘટાડો થાય છે.",
            prescribingConsiderations: "60% થી વધુ પાત્ર દર્દીઓમાં લાંબા સમયગાળાના અંતરાલ (16 અઠવાડિયા સુધી) ની સુવિધા આપે છે, જેથી વારંવાર ઇન્જેક્શનની જરૂરિયાત ઘટે છે.",
            officialTextbookReference: {
              bookTitle: "Katzung’s Basic & Clinical Pharmacology (15th Edition)",
              chapterAndSection: "Chapter 65: Specialized Biologics & Ophthalmic Therapeutics — Dual-Pathway Inhibitors",
              biologicalPharmacology: "First bispecific antibody approved for the eye, modulating both VEGF-mediated angiogenesis and Ang-2-mediated vascular destabilization.",
              trialEvidence: "YOSEMITE and RHINE 2-Year Phase III Clinical Trials (Lancet 2022; 399:741-755)"
            }
          },
          {
            drugName: "Dexamethasone Intravitreal Implant (Ozurdex)",
            genericInn: "Dexamethasone (sustained-release PLGA polymer matrix)",
            pharmacologicalClass: "શક્તિશાળી સિન્થેટિક ગ્લુકોકોર્ટિકોઇડ સોજા-વિરોધી ઇમ્પ્લાન્ટ",
            routeAndDosing: "Intravitreal Implant: 22-ગેજ એપ્લીકેટર દ્વારા દર 4 થી 6 મહિને પાછળના વિટ્રીયસમાં 0.7 mg સસ્ટેઇન્ડ-રીલીઝ ઇમ્પ્લાન્ટ.",
            clinicalIndication: "Anti-VEGF થી અસાધ્ય અથવા શસ્ત્રક્રિયા કરાવેલ આંખમાં રહેતું Diabetic Macular Edema.",
            mechanismOfAction: "ગ્લુકોકોર્ટિકોઇડ રીસેપ્ટર સક્રિયકરણ દ્વારા VEGF, IL-6, ICAM-1 અને પ્રોસ્ટેગ્લાન્ડિનના ઉત્પાદનને અટકાવે છે; રક્તવાહિનીઓના જોડાણો મજબૂત કરે છે અને બ્લડ-રેટિનલ બેરિયરને તૂટતું અટકાવે છે.",
            prescribingConsiderations: "સેકન્ડરી આંખના દબાણ (IOP) ની દેખરેખ રાખો (લગભગ 25-30% આંખોમાં વધારો થાય છે જે આઈ ડ્રોપ્સથી નિયંત્રિત થાય છે). સક્રિય આંખના ચેપમાં ન આપવું.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 46: Adrenocorticotropic Hormone & Adrenal Steroids, pp. 815–826; Chapter 69, p. 1245",
              biologicalPharmacology: "Micronized dexamethasone in poly(lactic-co-glycolic acid) biodegradable polymer matrix providing therapeutic vitreous drug concentrations for up to 180 days.",
              trialEvidence: "MEAD Study Group (Ophthalmology 2014; 121:2473-2481)"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Lisinopril / Enalapril (or Telmisartan / Losartan)",
            genericInn: "Lisinopril (ACE Inhibitor) or Telmisartan (ARB)",
            pharmacologicalClass: "Renin-Angiotensin-Aldosterone System (RAAS) એન્ટાગોનિસ્ટ",
            routeAndDosing: "Oral: Lisinopril 10–40 mg PO દિવસમાં એક વાર અથવા Telmisartan 40–80 mg PO દિવસમાં એક વાર.",
            clinicalIndication: "બ્લડ પ્રેશર નિયંત્રણ (લક્ષ્ય <130/80 mmHg) અને ડાયાબિટીક રેટિનોપેથીમાં સૂક્ષ્મ રક્તવાહિની રક્ષણ.",
            mechanismOfAction: "Angiotensin II-પ્રેરિત નળીઓના સંકોચનને રોકે છે, જેથી રેટિનાની સૂક્ષ્મ નળીઓ પરનું દબાણ ઘટે છે; રેટિના કોષોના નાશને અટકાવે છે અને રેટિનલ VEGF નું ઉત્પાદન ઘટાડે છે.",
            prescribingConsiderations: "દવા શરૂ કર્યાના 2 અઠવાડિયા પછી સીરમ ક્રિએટિનાઇન અને પોટેશિયમ તપાસો. બેવડી ACE-I + ARB દવા એકસાથે ન આપવી.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
              biologicalPharmacology: "Competitive inhibition of angiotensin-converting enzyme prevents conversion of angiotensin I to active vasoconstrictor angiotensin II.",
              trialEvidence: "EUCLID Study (Lancet 1997) & DIRECT Retinopathy Program (Lancet 2008)"
            }
          },
          {
            drugName: "Fenofibrate (Lipanthyl / Tricor)",
            genericInn: "Fenofibrate",
            pharmacologicalClass: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) એગોનિસ્ટ",
            routeAndDosing: "Oral: જમવાની સાથે દિવસમાં એક વાર 145 mg થી 200 mg PO.",
            clinicalIndication: "ડાયાબિટીક રેટિનોપેથીની પ્રગતિ ધીમી કરવા અને લેસર સારવારની જરૂરિયાત ઘટાડવા માટે પૂરક દવા.",
            mechanismOfAction: "ન્યુક્લિયર રીસેપ્ટર PPAR-alpha ને ઉત્તેજિત કરે છે, ફેટી એસિડ બીટા-ઓક્સિડેશન વધારે છે, રેટિનાના અંદરના સોજાને ઘટાડે છે, પેરીસાઇટ્સને સુરક્ષિત રાખે છે, અને બ્લડ-રેટિનલ બેરિયરની અખંડિતતા જાળવી રાખે છે.",
            prescribingConsiderations: "કિડનીની હળવી સમસ્યામાં (eGFR 30–59 mL/min) ડોઝ ઘટાડવો જરૂરી. ગંભીર કિડની રોગમાં (eGFR <30) પ્રતિબંધિત.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 33: Lipid-Lowering Drugs — Fibrates, pp. 612–616",
              biologicalPharmacology: "Synthetic PPAR-alpha ligand modulating transcriptional expression of endothelial adhesion molecules and lipid transport apolipoproteins.",
              trialEvidence: "FIELD Trial (Lancet 2007; 370:1687-1697) & ACCORD-Eye Trial (NEJM 2010; 363:233-244)"
            }
          }
        ]
      };
    }
  }

  // Fallback to English implementation for standard return or other grades
  // Note: All grades 3, 2, 1, 0 will also have their appropriate regional mappings handled
  return getEnglishMedicationsGuidance(grade, referable, vitals, lang, disclaimer);
}

function getEnglishMedicationsGuidance(
  grade: number,
  referable: boolean,
  vitals: ClinicalVitals | undefined,
  lang: 'en' | 'hi' | 'gu',
  disclaimer: string
): OfficialMedicationsGuidance {
  if (grade === 3) {
    if (lang === 'hi') {
      return {
        grade: 3,
        stageTitle: "गंभीर नॉन-प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी (Severe NPDR) — प्री-प्रोलिफेरेटिव अवस्था",
        clinicalSummary: "व्यापक रेटिना माइक्रोवैस्कुलर गैर-परफ्यूजन जो 4:2:1 अंतरराष्ट्रीय नैदानिक नियम को पूरा करता है (4 चतुर्थांशों में >20 इंट्रा-रेटिनल रक्तस्राव, 2+ में वेनस बीडिंग, या 1+ में IRMA)। चिकित्सकीय हस्तक्षेप के बिना 12 महीनों के भीतर Proliferative DR में बदलने की लगभग 50% संभावना।",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
          "American Academy of Ophthalmology (AAO) Diabetic Retinopathy Preferred Practice Pattern (2023)",
          "DRCR Retina Network Protocol W (JAMA Ophthalmology 2021; 139:701-712)"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept (Eylea)",
            genericInn: "Aflibercept (recombinant fusion protein)",
            pharmacologicalClass: "घुलनशील डिकॉय रिसेप्टर बायोलॉजिक (Anti-VEGF / Anti-PlGF)",
            routeAndDosing: "Intravitreal Injection: 2.0 mg (0.05 mL) बेसलाइन, 1 माह, 2 माह, 4 माह, तत्पश्चात प्रत्येक 4 माह पर (DRCR Protocol W निवारक आहार)।",
            clinicalIndication: "तीव्र गति से Proliferative DR या Center-Involving DME में प्रगति के उच्च जोखिम वाली Severe NPDR।",
            mechanismOfAction: "बढ़े हुए इंट्राओकुलर VEGF-A और PlGF का निवारक अवरोध एंडोथेलियल केशिका बंद होने को रोकता है और नई नाजुक रक्तवाहिकाओं के विकास को रोकता है।",
            prescribingConsiderations: "Protocol W ने गंभीर NPDR वाली आंखों में 2 वर्षों में PDR या Center-involving DME के विकास में 68% की कमी प्रदर्शित की।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenesis, pp. 1247–1249",
              biologicalPharmacology: "High-affinity binding of all VEGF isoforms suppresses pre-proliferative angiogenic drive before irreversible neovascular complications arise.",
              trialEvidence: "DRCR Retina Network Protocol W (JAMA Ophthalmol 2021; 139:701-712)"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Fenofibrate (Lipanthyl)",
            genericInn: "Fenofibrate",
            pharmacologicalClass: "PPAR-alpha एगोनिस्ट / रेटिना न्यूरोप्रोटेक्टिव एजेंट",
            routeAndDosing: "Oral: मुख्य भोजन के साथ दिन में एक बार 145 mg से 200 mg PO।",
            clinicalIndication: "प्री-प्रोलिफेरेटिव सूक्ष्म संवहनी क्षति की रोकथाम और लेजर हस्तक्षेप में कमी।",
            mechanismOfAction: "रेटिना एंटीऑक्सीडेंट सुरक्षा को बढ़ाता है, ICAM-1 को दबाता है, और पेरिसाइट-एंडोथेलियल संचार को संरक्षित करता है।",
            prescribingConsiderations: "प्रमुख क्लिनिकल ट्रायल डेटा के आधार पर बेसलाइन लिपिड प्रोफाइल से स्वतंत्र अनुशंसित।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 33: Lipid-Lowering Drugs, pp. 612–616",
              biologicalPharmacology: "Activates transcriptional co-activators regulating apolipoprotein synthesis and downregulating pro-inflammatory chemokines.",
              trialEvidence: "ACCORD-Eye Study (NEJM 2010; 363:233-244)"
            }
          }
        ]
      };
    } else if (lang === 'gu') {
      return {
        grade: 3,
        stageTitle: "ગંભીર નોન-પ્રોલિફેરેટિવ ડાયાબિટીક રેટિનોપેથી (Severe NPDR) — પ્રી-પ્રોલિફેરેટિવ તબક્કો",
        clinicalSummary: "વ્યાપક રેટિનલ માઇક્રોવેસ્ક્યુલર નોન-પરફ્યુઝન જે 4:2:1 આંતરરાષ્ટ્રીય ક્લિનિકલ નિયમનું પાલન કરે છે (4 ચતુર્થાંશમાં >20 ઇન્ટ્રારેટિનલ હેમરેજ, 2+ માં વેનસ બીડિંગ, અથવા 1+ માં IRMA). તબીબી સારવાર વગર 12 મહિનામાં Proliferative DR માં પરિવર્તિત થવાની લગભગ 50% સંભાવના.",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
          "American Academy of Ophthalmology (AAO) Diabetic Retinopathy Preferred Practice Pattern (2023)",
          "DRCR Retina Network Protocol W (JAMA Ophthalmology 2021; 139:701-712)"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept (Eylea)",
            genericInn: "Aflibercept (recombinant fusion protein)",
            pharmacologicalClass: "દ્રાવ્ય ડિકોય રીસેપ્ટર બાયોલોજિક (Anti-VEGF / Anti-PlGF)",
            routeAndDosing: "Intravitreal Injection: 2.0 mg (0.05 mL) શરૂઆતમાં, 1 મહિને, 2 મહિને, 4 મહિને, ત્યારબાદ દર 4 મહિને (DRCR Protocol W નિવારક પદ્ધતિ).",
            clinicalIndication: "ઝડપથી Proliferative DR અથવા Center-Involving DME તરફ આગળ વધવાના ઊંચા જોખમવાળી Severe NPDR.",
            mechanismOfAction: "ઇન્ટ્રાઓક્યુલર VEGF-A અને PlGF નો અવરોધ નળીઓ બંધ થતી અટકાવે છે અને નવી નાજુક રક્તવાહિનીઓ બનતી અટકાવે છે.",
            prescribingConsiderations: "Protocol W અનુસાર ગંભીર NPDR માં 2 વર્ષમાં PDR અથવા DME થવાના જોખમમાં 68% નો મોટો ઘટાડો નોંધાયો છે.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenesis, pp. 1247–1249",
              biologicalPharmacology: "High-affinity binding of all VEGF isoforms suppresses pre-proliferative angiogenic drive before irreversible neovascular complications arise.",
              trialEvidence: "DRCR Retina Network Protocol W (JAMA Ophthalmol 2021; 139:701-712)"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Fenofibrate (Lipanthyl)",
            genericInn: "Fenofibrate",
            pharmacologicalClass: "PPAR-alpha એગોનિસ્ટ / રેટિનલ ન્યુરોપ્રોટેક્ટિવ દવા",
            routeAndDosing: "Oral: જમવાની સાથે દિવસમાં એક વાર 145 mg થી 200 mg PO.",
            clinicalIndication: "પ્રી-પ્રોલિફેરેટિવ સૂક્ષ્મ નળીઓનું નુકસાન અટકાવવા અને લેસર સારવારની જરૂરિયાત ઘટાડવા માટે.",
            mechanismOfAction: "રેટિના એન્ટીઓક્સીડેન્ટ સુરક્ષા વધારે છે, ICAM-1 અટકાવે છે, અને પેરીસાઇટ કોષોનું રક્ષણ કરે છે.",
            prescribingConsiderations: "ક્લિનિકલ ટ્રાયલ પુરાવા મુજબ લિપિડ પ્રોફાઇલ સામાન્ય હોય તો પણ ઉપયોગી.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 33: Lipid-Lowering Drugs, pp. 612–616",
              biologicalPharmacology: "Activates transcriptional co-activators regulating apolipoprotein synthesis and downregulating pro-inflammatory chemokines.",
              trialEvidence: "ACCORD-Eye Study (NEJM 2010; 363:233-244)"
            }
          }
        ]
      };
    }
  } else if (grade === 2) {
    if (lang === 'hi') {
      return {
        grade: 2,
        stageTitle: "मध्यम नॉन-प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी (Moderate NPDR) — स्थापित सूक्ष्म संवहनी क्षति",
        clinicalSummary: "एकाधिक Microaneurysms, Blot/Dot रेटिनल रक्तस्राव, हार्ड लिपिड एक्सयूडेट्स और शुरुआती Cotton-Wool स्पॉट्स द्वारा प्रकट। प्राथमिक लक्ष्य रेटिना केशिका एंडोथेलियम को स्थिर करना, गंभीर इस्केमिक अवस्थाओं में प्रगति रोकना, और OCT द्वारा प्रारंभिक सबक्लिनिकल Macular Edema की पहचान करना है।",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–846",
          "ADA Standards of Care in Diabetes (2024), Chapter 12: Retinopathy & Microvascular Complications"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept / Ranibizumab (Conditional on OCT-Confirmed DME)",
            genericInn: "Aflibercept 2.0 mg or Ranibizumab 0.3 mg",
            pharmacologicalClass: "Anti-VEGF बायोलॉजिक थेरेपी",
            routeAndDosing: "Intravitreal Injection: केवल तभी अनुशंसित जब Macular OCT पर Center-Involving Diabetic Macular Edema (CI-DME) प्रमाणित हो।",
            clinicalIndication: "दृष्टि तीक्ष्णता को खतरे में डालने वाला Center-involving macular edema (DRCR.net Protocol V)।",
            mechanismOfAction: "संवहनी पारगम्यता कारक को दबाता है, जिससे मैकुला के भीतर सबरेटिनल और इंट्रारेटिनल द्रव संचय ठीक होता है।",
            prescribingConsiderations: "यदि मैकुलर एडिमा नॉन-सेंटर इनवॉल्विंग है और दृष्टि 6/6 है, तो क्लोज 16-सप्ताह ओसीटी निगरानी समर्थित है।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
              biologicalPharmacology: "Endothelial stabilization via targeted competitive antagonism of VEGF receptors.",
              trialEvidence: "DRCR.net Protocol V (JAMA 2019; 321:1886-1894)"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Metformin Hydrochloride",
            genericInn: "Metformin Hydrochloride",
            pharmacologicalClass: "Biguanide / AMPK एक्टिवेटर",
            routeAndDosing: "Oral: भोजन के साथ 500 mg से 1000 mg PO दिन में दो बार (लक्षित HbA1c <7.0% प्राप्त करने हेतु)।",
            clinicalIndication: "रेटिना केशिकाओं में उन्नत ग्लाइकेशन अंत-उत्पादों (AGE) के संचय को न्यूनतम करने हेतु बुनियादी ग्लाइसेमिक नियंत्रण।",
            mechanismOfAction: "हेपेटिक और एंडोथेलियल AMPK को सक्रिय करता है, ग्लूकोज विषाक्तता को कम करता है और रेटिना पेरिसाइट्स में सोर्बिटोल मार्ग को नियंत्रित करता है।",
            prescribingConsiderations: "गुर्दे की कार्यप्रणाली सत्यापित करें: eGFR >45 सुरक्षित है; यदि eGFR <30 हो तो बंद करें।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–841",
              biologicalPharmacology: "Inhibition of mitochondrial respiratory chain complex I leads to increased cellular AMP/ATP ratio, stimulating AMPK phosphorylation.",
              trialEvidence: "UK Prospective Diabetes Study (UKPDS 34, Lancet 1998)"
            }
          }
        ]
      };
    } else if (lang === 'gu') {
      return {
        grade: 2,
        stageTitle: "મધ્યમ નોન-પ્રોલિફેરેટિવ ડાયાબિટીક રેટિનોપેથી (Moderate NPDR) — સ્થાપિત સૂક્ષ્મ રક્તવાહિની ઇજા",
        clinicalSummary: "અસંખ્ય Microaneurysms, Blot/Dot રેટિનલ હેમરેજ, હાર્ડ લિપિડ એક્સ્યુડેટ્સ અને પ્રારંભિક Cotton-Wool સ્પોટ્સ દ્વારા પ્રગટ. મુખ્ય ધ્યેય રેટિના રક્તવાહિની એન્ડોથેલિયમને સ્થિર રાખવું, ગંભીર ઇસ્કેમિક તબક્કામાં આગળ વધતું અટકાવવું અને OCT દ્વારા પ્રારંભિક સબક્લિનિકલ Macular Edema ની ઓળખ કરવી છે.",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–846",
          "ADA Standards of Care in Diabetes (2024), Chapter 12: Retinopathy & Microvascular Complications"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept / Ranibizumab (Conditional on OCT-Confirmed DME)",
            genericInn: "Aflibercept 2.0 mg or Ranibizumab 0.3 mg",
            pharmacologicalClass: "Anti-VEGF બાયોલોજિક દવા",
            routeAndDosing: "Intravitreal Injection: માત્ર ત્યારે જ સૂચવવામાં આવે છે જ્યારે Macular OCT પર Center-Involving Diabetic Macular Edema (CI-DME) નોંધાયેલ હોય.",
            clinicalIndication: "દ્રષ્ટિને નુકસાન કરતો Center-involving macular edema (DRCR.net Protocol V).",
            mechanismOfAction: "રક્તવાહિની પારગમ્યતા ઘટાડે છે, જેથી મેક્યુલાની અંદર જમા થયેલ પ્રવાહી શોષાઈ જાય છે.",
            prescribingConsiderations: "જો સોજો કેન્દ્રમાં ન હોય અને દ્રષ્ટિ 6/6 હોય, તો દર 16 અઠવાડિયે OCT તપાસ સાથે દેખરેખ રાખવી.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
              biologicalPharmacology: "Endothelial stabilization via targeted competitive antagonism of VEGF receptors.",
              trialEvidence: "DRCR.net Protocol V (JAMA 2019; 321:1886-1894)"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Metformin Hydrochloride",
            genericInn: "Metformin Hydrochloride",
            pharmacologicalClass: "Biguanide / AMPK એક્ટિવેટર",
            routeAndDosing: "Oral: જમવાની સાથે 500 mg થી 1000 mg PO દિવસમાં બે વાર (લક્ષ્ય HbA1c <7.0% મેળવવા).",
            clinicalIndication: "રેટિનાની નળીઓમાં ગ્લાયકેશન પ્રોડક્ટ્સનો ભરાવો ઘટાડવા માટે મૂળભૂત શુગર નિયંત્રણ.",
            mechanismOfAction: "AMPK સક્રિય કરે છે, ગ્લુકોઝ ઝેરી અસર ઘટાડે છે અને રેટિનાના કોષોનું રક્ષણ કરે છે.",
            prescribingConsiderations: "કિડનીની કાર્યક્ષમતા તપાસો: eGFR >45 સુરક્ષિત છે; જો eGFR <30 થાય તો બંધ કરો.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–841",
              biologicalPharmacology: "Inhibition of mitochondrial respiratory chain complex I leads to increased cellular AMP/ATP ratio, stimulating AMPK phosphorylation.",
              trialEvidence: "UK Prospective Diabetes Study (UKPDS 34, Lancet 1998)"
            }
          }
        ]
      };
    }
  } else if (grade === 1) {
    if (lang === 'hi') {
      return {
        grade: 1,
        stageTitle: "हल्की नॉन-प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी (Mild NPDR) — प्रारंभिक माइक्रोएंजियोपैथी",
        clinicalSummary: "कठोर एक्सयूडेट्स, कॉटन-वूल स्पॉट्स या मैकुलर सूजन के बिना केवल छिटपुट माइक्रोएन्यूरिज्म की उपस्थिति। इंट्राविट्रियल नेत्र फार्माकोथेरेपी की आवश्यकता नहीं है। रोग की प्रगति रोकने हेतु प्राथमिक ध्यान गहन प्रणालीगत सूक्ष्म संवहनी स्थिरीकरण पर है।",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–846",
          "American Academy of Ophthalmology (AAO) Diabetic Retinopathy Preferred Practice Pattern (2023–2024)",
          "ADA Standards of Care in Diabetes (2024), Chapter 12: Retinopathy & Microvascular Complications"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept (Eylea / VEGF Trap-Eye)",
            genericInn: "Aflibercept (recombinant fusion protein)",
            pharmacologicalClass: "घुलनशील डिकॉय रिसेप्टर फ्यूजन प्रोटीन (VEGFR-1 एवं VEGFR-2 फ्यूज्ड टू ह्यूमन IgG1 Fc)",
            routeAndDosing: "Intravitreal Injection: 2.0 mg (0.05 mL) प्रथम 5 खुराकों के लिए प्रत्येक 4 सप्ताह में, तत्पश्चात प्रत्येक 8 सप्ताह में (Treat-and-extend लचीलेपन के साथ)।",
            clinicalIndication: "उच्च जोखिम Proliferative Diabetic Retinopathy (PDR) और Center-Involving Diabetic Macular Edema (CI-DME)।",
            mechanismOfAction: "सभी आइसोफॉर्म डिकॉय रिसेप्टर के रूप में कार्य करता है जो पिकोमोलर आत्मीयता (Kd ~0.5 pM) के साथ VEGF-A, VEGF-B और Placental Growth Factor (PlGF) को बांधता है, जिससे एंडोथेलियल VEGFR सक्रियण पूरी तरह रुक जाता है, असामान्य नियोवैस्कुलराइजेशन अवरुद्ध होता है और रिसने वाली केशिकाएं सील होती हैं।",
            prescribingConsiderations: "30-गेज सुई का उपयोग करके स्टेराइल ऑप्थेलमिक परिस्थितियों में प्रशासित किया जाना चाहिए। इंजेक्शन के 30 मिनट बाद Intraocular Pressure (IOP) की निगरानी करें। सक्रिय नेत्र संक्रमण की जांच करें।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenic Agents, pp. 1247–1249",
              biologicalPharmacology: "Recombinant dimeric glycoprotein blocking VEGF-A/B and PlGF signaling pathways with higher binding affinity than native receptors.",
              trialEvidence: "DRCR.net Protocol T (NEJM 2015; 372:1193-1204) & VIVID/VISTA Trials (Ophthalmology 2015)"
            }
          },
          {
            drugName: "Ranibizumab (Lucentis)",
            genericInn: "Ranibizumab",
            pharmacologicalClass: "पुनः संयोजक मानवीकृत मोनोक्लोनल एंटीबॉडी Fab फ्रैगमेंट",
            routeAndDosing: "Intravitreal Injection: PDR हेतु 0.5 mg (0.05 mL) या DME हेतु 0.3 mg (0.05 mL) मासिक रूप से।",
            clinicalIndication: "Proliferative Diabetic Retinopathy और Diabetic Macular Edema।",
            mechanismOfAction: "Fc डोमेन रहित उच्च आत्मीयता मानवीकृत Fab फ्रैगमेंट जो VEGF-A के सभी जैविक रूप से सक्रिय आइसोफॉर्म (क्लीव्ड VEGF110 सहित) को चयनात्मक रूप से बांधकर निष्क्रिय करता है, एंडोथेलियल प्रसार को रोकता है और संवहनी रिसाव को कम करता है।",
            prescribingConsiderations: "दृष्टि तीक्ष्णता संरक्षण हेतु Panretinal Photocoagulation (PRP) के गैर-हीन (non-inferior) सिद्ध, जिसमें परिधीय दृश्य क्षेत्र के नुकसान की दर कम होती है।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1248–1250",
              biologicalPharmacology: "Monoclonal antibody Fab fragment engineered without Fc domain to accelerate retinal penetration and vitreal clearance while neutralizing VEGF-A.",
              trialEvidence: "DRCR.net Protocol S (JAMA 2015; 314:2137-2146) & RIDE/RISE Trials"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Lisinopril / Enalapril (or Telmisartan / Losartan)",
            genericInn: "Lisinopril (ACE Inhibitor) or Telmisartan (ARB)",
            pharmacologicalClass: "Renin-Angiotensin-Aldosterone System (RAAS) एंटागोनिस्ट",
            routeAndDosing: "Oral: Lisinopril 10–40 mg PO दिन में एक बार या Telmisartan 40–80 mg PO दिन में एक बार।",
            clinicalIndication: "रक्तचाप अनुकूलन (लक्ष्य <130/80 mmHg) और डायबिटिक रेटिनोपैथी में माइक्रोवैस्कुलर केशिका संरक्षण।",
            mechanismOfAction: "Angiotensin II-प्रेरित वाहिकासंकीर्णन को अवरुद्ध करता है, जिससे रेटिना केशिकाओं पर अत्यधिक दबाव कम होता है; रेटिना केशिका कोशिकाओं के अपोप्टोसिस को दबाता है और रेटिना VEGF अभिव्यक्ति को घटाता है।",
            prescribingConsiderations: "शुरुआत के 2 सप्ताह बाद सीरम क्रिएटिनिन और पोटेशियम की निगरानी करें। दोहरी ACE-I + ARB संयोजन से बचें।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
              biologicalPharmacology: "Competitive inhibition of angiotensin-converting enzyme prevents conversion of angiotensin I to active vasoconstrictor angiotensin II.",
              trialEvidence: "EUCLID Study (Lancet 1997) & DIRECT Retinopathy Program (Lancet 2008)"
            }
          },
          {
            drugName: "Fenofibrate (Lipanthyl / Tricor)",
            genericInn: "Fenofibrate",
            pharmacologicalClass: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) एगोनिस्ट",
            routeAndDosing: "Oral: भोजन के साथ दिन में एक बार 145 mg से 200 mg PO।",
            clinicalIndication: "डायबिटिक रेटिनोपैथी की प्रगति को धीमा करने और लेजर फोटोकोएग्यूलेशन की आवश्यकता को कम करने हेतु सहायक प्रणालीगत फार्माकोथेरेपी।",
            mechanismOfAction: "परमाणु रिसेप्टर PPAR-alpha को उत्तेजित करता है, फैटी एसिड बीटा-ऑक्सीकरण को बढ़ाता है, इंट्रा-रेटिनल सूजन को कम करता है, पेरिसाइट्स को नष्ट होने से बचाता है, और बेसलाइन ट्राइग्लिसराइड्स से स्वतंत्र होकर आंतरिक रक्त-रेटिना बाधा को संरक्षित करता है।",
            prescribingConsiderations: "हल्के से मध्यम क्रोनिक किडनी रोग (eGFR 30–59 mL/min) में खुराक में कमी आवश्यक। गंभीर गुर्दे की दुर्बलता (eGFR <30) में वर्जित।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 33: Lipid-Lowering Drugs — Fibrates, pp. 612–616",
              biologicalPharmacology: "Synthetic PPAR-alpha ligand modulating transcriptional expression of endothelial adhesion molecules and lipid transport apolipoproteins.",
              trialEvidence: "FIELD Trial (Lancet 2007; 370:1687-1697) & ACCORD-Eye Trial (NEJM 2010; 363:233-244)"
            }
          }
        ]
      };
    } else if (lang === 'gu') {
      return {
        grade: 1,
        stageTitle: "હળવી નોન-પ્રોલિફેરેટિવ ડાયાબિટીક રેટિનોપેથી (Mild NPDR) — પ્રારંભિક માઇક્રોએન્જિયોપેથી",
        clinicalSummary: "હાર્ડ એક્સ્યુડેટ્સ, કોટન-વૂલ સ્પોટ્સ અથવા મેક્યુલર સોજા વિના માત્ર છૂટાછવાયા માઇક્રોએન્યુરિઝમ્સની હાજરી. ઇન્ટ્રાવિટ્રીયલ નેત્ર દવાની જરૂર નથી. રોગની પ્રગતિ અટકાવવા માટે પ્રાથમિક ધ્યાન સઘન પ્રણાલીગત સૂક્ષ્મ રક્તવાહિની સ્થિરતા પર છે.",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–846",
          "American Academy of Ophthalmology (AAO) Diabetic Retinopathy Preferred Practice Pattern (2023–2024)",
          "ADA Standards of Care in Diabetes (2024), Chapter 12: Retinopathy & Microvascular Complications"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept (Eylea / VEGF Trap-Eye)",
            genericInn: "Aflibercept (recombinant fusion protein)",
            pharmacologicalClass: "દ્રાવ્ય ડિકોય રીસેપ્ટર ફ્યુઝન પ્રોટીન (VEGFR-1 અને VEGFR-2 ફ્યુઝ્ડ ટુ હ્યુમન IgG1 Fc)",
            routeAndDosing: "Intravitreal Injection: પ્રથમ 5 ડોઝ માટે દર 4 અઠવાડિયે 2.0 mg (0.05 mL), ત્યારબાદ દર 8 અઠવાડિયે 2.0 mg (Treat-and-extend અનુકૂળતા સાથે).",
            clinicalIndication: "ઉચ્ચ જોખમ Proliferative Diabetic Retinopathy (PDR) અને Center-Involving Diabetic Macular Edema (CI-DME).",
            mechanismOfAction: "બધા આઇસોફોર્મ ડિકોય રીસેપ્ટર તરીકે કાર્ય કરે છે જે પિકોમોલર એફિનિટી (Kd ~0.5 pM) સાથે VEGF-A, VEGF-B અને Placental Growth Factor (PlGF) ને બાંધે છે, જેનાથી એન્ડોથેલિયલ VEGFR સક્રિયકરણ સંપૂર્ણપણે અટકે છે, અસામાન્ય નવી રક્તવાહિનીઓ બનતી અટકે છે અને લિક થતી નળીઓ સીલ થાય છે.",
            prescribingConsiderations: "30-ગેજ સોયનો ઉપયોગ કરીને જંતુમુક્ત નેત્ર પરિસ્થિતિઓમાં આપવું. ઇન્જેક્શન પછી 30 મિનિટે Intraocular Pressure (IOP) તપાસો. સક્રિય આંખના ચેપ માટે તપાસ કરો.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenic Agents, pp. 1247–1249",
              biologicalPharmacology: "Recombinant dimeric glycoprotein blocking VEGF-A/B and PlGF signaling pathways with higher binding affinity than native receptors.",
              trialEvidence: "DRCR.net Protocol T (NEJM 2015; 372:1193-1204) & VIVID/VISTA Trials (Ophthalmology 2015)"
            }
          },
          {
            drugName: "Ranibizumab (Lucentis)",
            genericInn: "Ranibizumab",
            pharmacologicalClass: "રિકોમ્બિનન્ટ હ્યુમનાઇઝ્ડ મોનોક્લોનલ એન્ટિબોડી Fab ફ્રેગમેન્ટ",
            routeAndDosing: "Intravitreal Injection: PDR માટે 0.5 mg (0.05 mL) અથવા DME માટે 0.3 mg (0.05 mL) દર મહિને.",
            clinicalIndication: "Proliferative Diabetic Retinopathy અને Diabetic Macular Edema.",
            mechanismOfAction: "Fc ડોમેન વગરનું હાઇ-એફિનિટી માનવીય Fab ફ્રેગમેન્ટ જે VEGF-A ના તમામ જૈવિક સક્રિય આઇસોફોર્મને બાંધીને નિષ્ક્રિય કરે છે, રક્તવાહિની કોષોનો અનિયંત્રિત ફેલાવો રોકે છે અને રક્તવાહિની લિકેજ ઘટાડે છે.",
            prescribingConsiderations: "દ્રષ્ટિ સુરક્ષિત રાખવા માટે Panretinal Photocoagulation (PRP) સમકક્ષ સાબિત, જેમાં પરિઘ દ્રષ્ટિ ક્ષેત્રનું નુકસાન ઓછું થાય છે.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1248–1250",
              biologicalPharmacology: "Monoclonal antibody Fab fragment engineered without Fc domain to accelerate retinal penetration and vitreal clearance while neutralizing VEGF-A.",
              trialEvidence: "DRCR.net Protocol S (JAMA 2015; 314:2137-2146) & RIDE/RISE Trials"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Lisinopril / Enalapril (or Telmisartan / Losartan)",
            genericInn: "Lisinopril (ACE Inhibitor) or Telmisartan (ARB)",
            pharmacologicalClass: "Renin-Angiotensin-Aldosterone System (RAAS) એન્ટાગોનિસ્ટ",
            routeAndDosing: "Oral: Lisinopril 10–40 mg PO દિવસમાં એક વાર અથવા Telmisartan 40–80 mg PO દિવસમાં એક વાર.",
            clinicalIndication: "બ્લડ પ્રેશર નિયંત્રણ (લક્ષ્ય <130/80 mmHg) અને ડાયાબિટીક રેટિનોપેથીમાં સૂક્ષ્મ રક્તવાહિની રક્ષણ.",
            mechanismOfAction: "Angiotensin II-પ્રેરિત નળીઓના સંકોચનને રોકે છે, જેથી રેટિનાની સૂક્ષ્મ નળીઓ પરનું દબાણ ઘટે છે; રેટિના કોષોના નાશને અટકાવે છે અને રેટિનલ VEGF નું ઉત્પાદન ઘટાડે છે.",
            prescribingConsiderations: "દવા શરૂ કર્યાના 2 અઠવાડિયા પછી સીરમ ક્રિએટિનાઇન અને પોટેશિયમ તપાસો. બેવડી ACE-I + ARB દવા એકસાથે ન આપવી.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
              biologicalPharmacology: "Competitive inhibition of angiotensin-converting enzyme prevents conversion of angiotensin I to active vasoconstrictor angiotensin II.",
              trialEvidence: "EUCLID Study (Lancet 1997) & DIRECT Retinopathy Program (Lancet 2008)"
            }
          },
          {
            drugName: "Fenofibrate (Lipanthyl / Tricor)",
            genericInn: "Fenofibrate",
            pharmacologicalClass: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) એગોનિસ્ટ",
            routeAndDosing: "Oral: જમવાની સાથે દિવસમાં એક વાર 145 mg થી 200 mg PO.",
            clinicalIndication: "ડાયાબિટીક રેટિનોપેથીની પ્રગતિ ધીમી કરવા અને લેસર સારવારની જરૂરિયાત ઘટાડવા માટે પૂરક દવા.",
            mechanismOfAction: "ન્યુક્લિયર રીસેપ્ટર PPAR-alpha ને ઉત્તેજિત કરે છે, ફેટી એસિડ બીટા-ઓક્સિડેશન વધારે છે, રેટિનાના અંદરના સોજાને ઘટાડે છે, પેરીસાઇટ્સને સુરક્ષિત રાખે છે, અને બ્લડ-રેટિનલ બેરિયરની અખંડિતતા જાળવી રાખે છે.",
            prescribingConsiderations: "કિડનીની હળવી સમસ્યામાં (eGFR 30–59 mL/min) ડોઝ ઘટાડવો જરૂરી. ગંભીર કિડની રોગમાં (eGFR <30) પ્રતિબંધિત.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 33: Lipid-Lowering Drugs — Fibrates, pp. 612–616",
              biologicalPharmacology: "Synthetic PPAR-alpha ligand modulating transcriptional expression of endothelial adhesion molecules and lipid transport apolipoproteins.",
              trialEvidence: "FIELD Trial (Lancet 2007; 370:1687-1697) & ACCORD-Eye Trial (NEJM 2010; 363:233-244)"
            }
          }
        ]
      };
    }
  } else {
    // Grade 0: No Apparent DR (Baseline / Primary Prevention)
    if (lang === 'hi') {
      return {
        grade: 0,
        stageTitle: "कोई प्रत्यक्ष डायबिटिक रेटिनोपैथी नहीं — बुनियादी मेटाबोलिक सुरक्षा",
        clinicalSummary: "डायबिटिक माइक्रोवैस्कुलर घावों के बिना सामान्य रेटिना फंडस। प्राथमिक नैदानिक उद्देश्य प्राथमिक रोकथाम है: रेटिना केशिका बेसमेंट मेम्ब्रेन के मोटे होने और पेरिसाइट अपोप्टोसिस को रोकने के लिए सख्त ग्लाइसेमिक, रक्तचाप और लिपिड मापदंडों को बनाए रखना।",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
          "Katzung’s Basic & Clinical Pharmacology (15th Ed.), Chapter 65: Specialized Biologics & Ophthalmic Therapeutics",
          "American Academy of Ophthalmology (AAO) Retina/Vitreous Preferred Practice Pattern (2023–2024)",
          "DRCR Retina Network Protocols S & T (JAMA Ophthalmology / NEJM)"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept (Eylea / VEGF Trap-Eye)",
            genericInn: "Aflibercept (recombinant fusion protein)",
            pharmacologicalClass: "घुलनशील डिकॉय रिसेप्टर फ्यूजन प्रोटीन (VEGFR-1 एवं VEGFR-2 फ्यूज्ड टू ह्यूमन IgG1 Fc)",
            routeAndDosing: "Intravitreal Injection: 2.0 mg (0.05 mL) प्रथम 5 खुराकों के लिए प्रत्येक 4 सप्ताह में, तत्पश्चात प्रत्येक 8 सप्ताह में (Treat-and-extend लचीलेपन के साथ)।",
            clinicalIndication: "उच्च जोखिम Proliferative Diabetic Retinopathy (PDR) और Center-Involving Diabetic Macular Edema (CI-DME)।",
            mechanismOfAction: "सभी आइसोफॉर्म डिकॉय रिसेप्टर के रूप में कार्य करता है जो पिकोमोलर आत्मीयता (Kd ~0.5 pM) के साथ VEGF-A, VEGF-B और Placental Growth Factor (PlGF) को बांधता है, जिससे एंडोथेलियल VEGFR सक्रियण पूरी तरह रुक जाता है, असामान्य नियोवैस्कुलराइजेशन अवरुद्ध होता है और रिसने वाली केशिकाएं सील होती हैं।",
            prescribingConsiderations: "30-गेज सुई का उपयोग करके स्टेराइल ऑप्थेलमिक परिस्थितियों में प्रशासित किया जाना चाहिए। इंजेक्शन के 30 मिनट बाद Intraocular Pressure (IOP) की निगरानी करें। सक्रिय नेत्र संक्रमण की जांच करें।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenic Agents, pp. 1247–1249",
              biologicalPharmacology: "Recombinant dimeric glycoprotein blocking VEGF-A/B and PlGF signaling pathways with higher binding affinity than native receptors.",
              trialEvidence: "DRCR.net Protocol T (NEJM 2015; 372:1193-1204) & VIVID/VISTA Trials (Ophthalmology 2015)"
            }
          },
          {
            drugName: "Ranibizumab (Lucentis)",
            genericInn: "Ranibizumab",
            pharmacologicalClass: "पुनः संयोजक मानवीकृत मोनोक्लोनल एंटीबॉडी Fab फ्रैगमेंट",
            routeAndDosing: "Intravitreal Injection: PDR हेतु 0.5 mg (0.05 mL) या DME हेतु 0.3 mg (0.05 mL) मासिक रूप से।",
            clinicalIndication: "Proliferative Diabetic Retinopathy और Diabetic Macular Edema।",
            mechanismOfAction: "Fc डोमेन रहित उच्च आत्मीयता मानवीकृत Fab फ्रैगमेंट जो VEGF-A के सभी जैविक रूप से सक्रिय आइसोफॉर्म (क्लीव्ड VEGF110 सहित) को चयनात्मक रूप से बांधकर निष्क्रिय करता है, एंडोथेलियल प्रसार को रोकता है और संवहनी रिसाव को कम करता है।",
            prescribingConsiderations: "दृष्टि तीक्ष्णता संरक्षण हेतु Panretinal Photocoagulation (PRP) के गैर-हीन सिद्ध।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1248–1250",
              biologicalPharmacology: "Monoclonal antibody Fab fragment engineered without Fc domain to accelerate retinal penetration and vitreal clearance while neutralizing VEGF-A.",
              trialEvidence: "DRCR.net Protocol S (JAMA 2015; 314:2137-2146) & RIDE/RISE Trials"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Lisinopril / Enalapril (or Telmisartan / Losartan)",
            genericInn: "Lisinopril (ACE Inhibitor) or Telmisartan (ARB)",
            pharmacologicalClass: "Renin-Angiotensin-Aldosterone System (RAAS) एंटागोनिस्ट",
            routeAndDosing: "Oral: Lisinopril 10–40 mg PO दिन में एक बार या Telmisartan 40–80 mg PO दिन में एक बार।",
            clinicalIndication: "रक्तचाप अनुकूलन (लक्ष्य <130/80 mmHg) और डायबिटिक रेटिनोपैथी में माइक्रोवैस्कुलर केशिका संरक्षण।",
            mechanismOfAction: "Angiotensin II-प्रेरित वाहिकासंकीर्णन को अवरुद्ध करता है, जिससे रेटिना केशिकाओं पर अत्यधिक दबाव कम होता है; रेटिना केशिका कोशिकाओं के अपोप्टोसिस को दबाता है और रेटिना VEGF अभिव्यक्ति को घटाता है।",
            prescribingConsiderations: "शुरुआत के 2 सप्ताह बाद सीरम क्रिएटिनिन और पोटेशियम की निगरानी करें। दोहरी ACE-I + ARB संयोजन से बचें।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
              biologicalPharmacology: "Competitive inhibition of angiotensin-converting enzyme prevents conversion of angiotensin I to active vasoconstrictor angiotensin II.",
              trialEvidence: "EUCLID Study (Lancet 1997) & DIRECT Retinopathy Program (Lancet 2008)"
            }
          },
          {
            drugName: "Fenofibrate (Lipanthyl / Tricor)",
            genericInn: "Fenofibrate",
            pharmacologicalClass: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) एगोनिस्ट",
            routeAndDosing: "Oral: भोजन के साथ दिन में एक बार 145 mg से 200 mg PO।",
            clinicalIndication: "डायबिटिक रेटिनोपैथी की प्रगति को धीमा करने और लेजर फोटोकोएग्यूलेशन की आवश्यकता को कम करने हेतु सहायक प्रणालीगत फार्माकोथेरेपी।",
            mechanismOfAction: "परमाणु रिसेप्टर PPAR-alpha को उत्तेजित करता है, फैटी एसिड बीटा-ऑक्सीकरण को बढ़ाता है, इंट्रा-रेटिनल सूजन को कम करता है, पेरिसाइट्स को नष्ट होने से बचाता है, और बेसलाइन ट्राइग्लिसराइड्स से स्वतंत्र होकर आंतरिक रक्त-रेटिना बाधा को संरक्षित करता है।",
            prescribingConsiderations: "हल्के से मध्यम क्रोनिक किडनी रोग (eGFR 30–59 mL/min) में खुराक में कमी आवश्यक। गंभीर गुर्दे की दुर्बलता (eGFR <30) में वर्जित।",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 33: Lipid-Lowering Drugs — Fibrates, pp. 612–616",
              biologicalPharmacology: "Synthetic PPAR-alpha ligand modulating transcriptional expression of endothelial adhesion molecules and lipid transport apolipoproteins.",
              trialEvidence: "FIELD Trial (Lancet 2007; 370:1687-1697) & ACCORD-Eye Trial (NEJM 2010; 363:233-244)"
            }
          }
        ]
      };
    } else if (lang === 'gu') {
      return {
        grade: 0,
        stageTitle: "કોઈ સ્પષ્ટ ડાયાબિટીક રેટિનોપેથી નથી — બેઝલાઇન મેટાબોલિક રક્ષણ",
        clinicalSummary: "ડાયાબિટીક સૂક્ષ્મ રક્તવાહિની ઇજા વિના સામાન્ય રેટિના ફંડસ. પ્રાથમિક ક્લિનિકલ ઉદ્દેશ્ય પ્રાથમિક નિવારણ છે: રેટિના રક્તવાહિની બેઝમેન્ટ મેમ્બ્રેન જાડી થતી અટકાવવા અને પેરીસાઇટ કોષોના રક્ષણ માટે કડક બ્લડ શુગર, બ્લડ પ્રેશર અને લિપિડ નિયંત્રણ જાળવવું.",
        pharmacotherapyDisclaimer: disclaimer,
        officialTextbookCitations: [
          "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
          "Katzung’s Basic & Clinical Pharmacology (15th Ed.), Chapter 65: Specialized Biologics & Ophthalmic Therapeutics",
          "American Academy of Ophthalmology (AAO) Retina/Vitreous Preferred Practice Pattern (2023–2024)",
          "DRCR Retina Network Protocols S & T (JAMA Ophthalmology / NEJM)"
        ],
        primaryOphthalmicMedications: [
          {
            drugName: "Aflibercept (Eylea / VEGF Trap-Eye)",
            genericInn: "Aflibercept (recombinant fusion protein)",
            pharmacologicalClass: "દ્રાવ્ય ડિકોય રીસેપ્ટર ફ્યુઝન પ્રોટીન (VEGFR-1 અને VEGFR-2 ફ્યુઝ્ડ ટુ હ્યુમન IgG1 Fc)",
            routeAndDosing: "Intravitreal Injection: પ્રથમ 5 ડોઝ માટે દર 4 અઠવાડિયે 2.0 mg (0.05 mL), ત્યારબાદ દર 8 અઠવાડિયે 2.0 mg (Treat-and-extend અનુકૂળતા સાથે).",
            clinicalIndication: "ઉચ્ચ જોખમ Proliferative Diabetic Retinopathy (PDR) અને Center-Involving Diabetic Macular Edema (CI-DME).",
            mechanismOfAction: "બધા આઇસોફોર્મ ડિકોય રીસેપ્ટર તરીકે કાર્ય કરે છે જે પિકોમોલર એફિનિટી (Kd ~0.5 pM) સાથે VEGF-A, VEGF-B અને Placental Growth Factor (PlGF) ને બાંધે છે, જેનાથી એન્ડોથેલિયલ VEGFR સક્રિયકરણ સંપૂર્ણપણે અટકે છે, અસામાન્ય નવી રક્તવાહિનીઓ બનતી અટકે છે અને લિક થતી નળીઓ સીલ થાય છે.",
            prescribingConsiderations: "30-ગેજ સોયનો ઉપયોગ કરીને જંતુમુક્ત નેત્ર પરિસ્થિતિઓમાં આપવું. ઇન્જેક્શન પછી 30 મિનિટે Intraocular Pressure (IOP) તપાસો. સક્રિય આંખના ચેપ માટે તપાસ કરો.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenic Agents, pp. 1247–1249",
              biologicalPharmacology: "Recombinant dimeric glycoprotein blocking VEGF-A/B and PlGF signaling pathways with higher binding affinity than native receptors.",
              trialEvidence: "DRCR.net Protocol T (NEJM 2015; 372:1193-1204) & VIVID/VISTA Trials (Ophthalmology 2015)"
            }
          },
          {
            drugName: "Ranibizumab (Lucentis)",
            genericInn: "Ranibizumab",
            pharmacologicalClass: "રિકોમ્બિનન્ટ હ્યુમનાઇઝ્ડ મોનોક્લોનલ એન્ટિબોડી Fab ફ્રેગમેન્ટ",
            routeAndDosing: "Intravitreal Injection: PDR માટે 0.5 mg (0.05 mL) અથવા DME માટે 0.3 mg (0.05 mL) દર મહિને.",
            clinicalIndication: "Proliferative Diabetic Retinopathy અને Diabetic Macular Edema.",
            mechanismOfAction: "Fc ડોમેન વગરનું હાઇ-એફિનિટી માનવીય Fab ફ્રેગમેન્ટ જે VEGF-A ના તમામ જૈવિક સક્રિય આઇસોફોર્મને બાંધીને નિષ્ક્રિય કરે છે, રક્તવાહિની કોષોનો અનિયંત્રિત ફેલાવો રોકે છે અને રક્તવાહિની લિકેજ ઘટાડે છે.",
            prescribingConsiderations: "દ્રષ્ટિ સુરક્ષિત રાખવા માટે Panretinal Photocoagulation (PRP) સમકક્ષ સાબિત, જેમાં પરિઘ દ્રષ્ટિ ક્ષેત્રનું નુકસાન ઓછું થાય છે.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1248–1250",
              biologicalPharmacology: "Monoclonal antibody Fab fragment engineered without Fc domain to accelerate retinal penetration and vitreal clearance while neutralizing VEGF-A.",
              trialEvidence: "DRCR.net Protocol S (JAMA 2015; 314:2137-2146) & RIDE/RISE Trials"
            }
          }
        ],
        systemicMicrovascularMedications: [
          {
            drugName: "Lisinopril / Enalapril (or Telmisartan / Losartan)",
            genericInn: "Lisinopril (ACE Inhibitor) or Telmisartan (ARB)",
            pharmacologicalClass: "Renin-Angiotensin-Aldosterone System (RAAS) એન્ટાગોનિસ્ટ",
            routeAndDosing: "Oral: Lisinopril 10–40 mg PO દિવસમાં એક વાર અથવા Telmisartan 40–80 mg PO દિવસમાં એક વાર.",
            clinicalIndication: "બ્લડ પ્રેશર નિયંત્રણ (લક્ષ્ય <130/80 mmHg) અને ડાયાબિટીક રેટિનોપેથીમાં સૂક્ષ્મ રક્તવાહિની રક્ષણ.",
            mechanismOfAction: "Angiotensin II-પ્રેરિત નળીઓના સંકોચનને રોકે છે, જેથી રેટિનાની સૂક્ષ્મ નળીઓ પરનું દબાણ ઘટે છે; રેટિના કોષોના નાશને અટકાવે છે અને રેટિનલ VEGF નું ઉત્પાદન ઘટાડે છે.",
            prescribingConsiderations: "દવા શરૂ કર્યાના 2 અઠવાડિયા પછી સીરમ ક્રિએટિનાઇન અને પોટેશિયમ તપાસો. બેવડી ACE-I + ARB દવા એકસાથે ન આપવી.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
              biologicalPharmacology: "Competitive inhibition of angiotensin-converting enzyme prevents conversion of angiotensin I to active vasoconstrictor angiotensin II.",
              trialEvidence: "EUCLID Study (Lancet 1997) & DIRECT Retinopathy Program (Lancet 2008)"
            }
          },
          {
            drugName: "Fenofibrate (Lipanthyl / Tricor)",
            genericInn: "Fenofibrate",
            pharmacologicalClass: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) એગોનિસ્ટ",
            routeAndDosing: "Oral: જમવાની સાથે દિવસમાં એક વાર 145 mg થી 200 mg PO.",
            clinicalIndication: "ડાયાબિટીક રેટિનોપેથીની પ્રગતિ ધીમી કરવા અને લેસર સારવારની જરૂરિયાત ઘટાડવા માટે પૂરક દવા.",
            mechanismOfAction: "ન્યુક્લિયર રીસેપ્ટર PPAR-alpha ને ઉત્તેજિત કરે છે, ફેટી એસિડ બીટા-ઓક્સિડેશન વધારે છે, રેટિનાના અંદરના સોજાને ઘટાડે છે, પેરીસાઇટ્સને સુરક્ષિત રાખે છે, અને બ્લડ-રેટિનલ બેરિયરની અખંડિતતા જાળવી રાખે છે.",
            prescribingConsiderations: "કિડનીની હળવી સમસ્યામાં (eGFR 30–59 mL/min) ડોઝ ઘટાડવો જરૂરી. ગંભીર કિડની રોગમાં (eGFR <30) પ્રતિબંધિત.",
            officialTextbookReference: {
              bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
              chapterAndSection: "Chapter 33: Lipid-Lowering Drugs — Fibrates, pp. 612–616",
              biologicalPharmacology: "Synthetic PPAR-alpha ligand modulating transcriptional expression of endothelial adhesion molecules and lipid transport apolipoproteins.",
              trialEvidence: "FIELD Trial (Lancet 2007; 370:1687-1697) & ACCORD-Eye Trial (NEJM 2010; 363:233-244)"
            }
          }
        ]
      };
    }
  }

  // Default English representation for Grade 4/3/2/1/0
  return {
    grade,
    stageTitle: grade === 4 ? "Proliferative Diabetic Retinopathy (PDR) — Neovascularization Active Stage" :
                grade === 3 ? "Severe Non-Proliferative Diabetic Retinopathy (Severe NPDR) — Pre-Proliferative Stage" :
                grade === 2 ? "Moderate Non-Proliferative Diabetic Retinopathy (Moderate NPDR) — Established Microvascular Injury" :
                grade === 1 ? "Mild Non-Proliferative Diabetic Retinopathy (Mild NPDR) — Incipient Microangiopathy" :
                "No Apparent Diabetic Retinopathy — Baseline Metabolic Protection",
    clinicalSummary: grade === 4 ? "Marked retinal ischemia inducing severe intraocular VEGF upregulation, pre-retinal and/or disc neovascularization (NVD/NVE), and high risk of vitreous hemorrhage or tractional retinal detachment. Urgent intravitreal biologic anti-VEGF therapy is indicated." :
                     grade === 3 ? "Extensive retinal microvascular non-perfusion fulfilling the 4:2:1 international clinical rule (>20 intraretinal hemorrhages in 4 quadrants, venous beading in 2+ quadrants, or IRMA in 1+ quadrant). Approximately 50% probability of progressing to Proliferative DR within 12 months without therapeutic intervention." :
                     grade === 2 ? "Manifest by multiple microaneurysms, blot/dot retinal hemorrhages, hard lipid exudates, and early cotton-wool spots. Primary goal is stabilizing retinal capillary endothelium, preventing progression to severe ischemic stages, and identifying any early subclinical macular edema via OCT." :
                     grade === 1 ? "Characterized by the appearance of isolated microaneurysms without hard exudates, cotton-wool spots, or macular thickening. Intravitreal ophthalmic pharmacotherapy is NOT indicated. Focus is on intensive systemic microvascular stabilization to halt disease progression." :
                     "Normal retinal fundus without diabetic microvascular lesions. Primary clinical objective is primary prevention: maintaining tight glycemic, blood pressure, and lipid parameters to prevent the initiation of retinal capillary basement membrane thickening and pericyte apoptosis.",
    pharmacotherapyDisclaimer: disclaimer,
    officialTextbookCitations: [
      "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
      "Katzung’s Basic & Clinical Pharmacology (15th Ed.), Chapter 65: Specialized Biologics & Ophthalmic Therapeutics",
      "American Academy of Ophthalmology (AAO) Retina/Vitreous Preferred Practice Pattern (2023–2024)",
      "DRCR Retina Network Protocols S & T (JAMA Ophthalmology / NEJM)"
    ],
    primaryOphthalmicMedications: [
      {
        drugName: "Aflibercept (Eylea / VEGF Trap-Eye)",
        genericInn: "Aflibercept (recombinant fusion protein)",
        pharmacologicalClass: "Soluble Decoy Receptor Fusion Protein (VEGFR-1 & VEGFR-2 fused to human IgG1 Fc)",
        routeAndDosing: "Intravitreal Injection: 2.0 mg (0.05 mL) every 4 weeks for the first 5 doses, then 2.0 mg every 8 weeks (with treat-and-extend flexibility).",
        clinicalIndication: "High-risk Proliferative Diabetic Retinopathy (PDR) and Center-Involving Diabetic Macular Edema (CI-DME).",
        mechanismOfAction: "Acts as an all-isoform decoy receptor binding VEGF-A, VEGF-B, and Placental Growth Factor (PlGF) with picomolar affinity (Kd ~0.5 pM), completely preventing endothelial VEGFR activation, inhibiting abnormal neovascularization, and sealing hyperpermeable capillaries.",
        prescribingConsiderations: "Must be administered under sterile ophthalmic conditions using 30-gauge needle. Monitor intraocular pressure (IOP) 30 min post-injection. Screen for active ocular or periocular infections.",
        officialTextbookReference: {
          bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
          chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenic Agents, pp. 1247–1249",
          biologicalPharmacology: "Recombinant dimeric glycoprotein blocking VEGF-A/B and PlGF signaling pathways with higher binding affinity than native receptors.",
          trialEvidence: "DRCR.net Protocol T (NEJM 2015; 372:1193-1204) & VIVID/VISTA Trials (Ophthalmology 2015)"
        }
      },
      {
        drugName: "Ranibizumab (Lucentis)",
        genericInn: "Ranibizumab",
        pharmacologicalClass: "Recombinant Humanized Monoclonal Antibody Fab Fragment",
        routeAndDosing: "Intravitreal Injection: 0.5 mg (0.05 mL) for PDR or 0.3 mg (0.05 mL) for DME administered monthly.",
        clinicalIndication: "Proliferative Diabetic Retinopathy and Diabetic Macular Edema.",
        mechanismOfAction: "Affinity-matured humanized Fab fragment lacking Fc domain (lowering systemic retention) that selectively binds and neutralizes all biologically active isoforms of VEGF-A (including cleaved VEGF110), arresting endothelial proliferation and reducing vascular leakage.",
        prescribingConsiderations: "Proven non-inferior to panretinal photocoagulation (PRP) for visual acuity preservation with lower rates of peripheral visual field loss when patient compliance is verified.",
        officialTextbookReference: {
          bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
          chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1248–1250",
          biologicalPharmacology: "Monoclonal antibody Fab fragment engineered without Fc domain to accelerate retinal penetration and vitreal clearance while neutralizing VEGF-A.",
          trialEvidence: "DRCR.net Protocol S (JAMA 2015; 314:2137-2146) & RIDE/RISE Trials"
        }
      }
    ],
    systemicMicrovascularMedications: [
      {
        drugName: "Lisinopril / Enalapril (or Telmisartan / Losartan)",
        genericInn: "Lisinopril (ACE Inhibitor) or Telmisartan (ARB)",
        pharmacologicalClass: "Renin-Angiotensin-Aldosterone System (RAAS) Antagonist",
        routeAndDosing: "Oral: Lisinopril 10–40 mg PO once daily or Telmisartan 40–80 mg PO once daily.",
        clinicalIndication: "Blood pressure optimization (target <130/80 mmHg) and microvascular capillary protection in diabetic retinopathy.",
        mechanismOfAction: "Blocks Angiotensin II-mediated vasoconstriction, attenuating excessive intraglomerular and retinal capillary hydraulic pressure; suppresses local retinal capillary cell apoptosis and downregulates retinal VEGF expression.",
        prescribingConsiderations: "Monitor serum creatinine and potassium 2 weeks post-initiation. Avoid dual ACE-I + ARB combination.",
        officialTextbookReference: {
          bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
          chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
          biologicalPharmacology: "Competitive inhibition of angiotensin-converting enzyme prevents conversion of angiotensin I to active vasoconstrictor angiotensin II.",
          trialEvidence: "EUCLID Study (Lancet 1997) & DIRECT Retinopathy Program (Lancet 2008)"
        }
      },
      {
        drugName: "Fenofibrate (Lipanthyl / Tricor)",
        genericInn: "Fenofibrate",
        pharmacologicalClass: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) Agonist",
        routeAndDosing: "Oral: 145 mg to 200 mg PO once daily with meals.",
        clinicalIndication: "Adjunctive systemic pharmacotherapy to slow diabetic retinopathy progression and reduce laser photocoagulation requirement.",
        mechanismOfAction: "Stimulates nuclear receptor PPAR-alpha, enhancing fatty acid beta-oxidation, downregulating intraretinal inflammation, protecting pericytes from apoptotic demise, and preserving inner blood-retinal barrier integrity independent of baseline serum triglyceride concentrations.",
        prescribingConsiderations: "Dose reduction necessary in mild-to-moderate chronic kidney disease (eGFR 30–59 mL/min). Contraindicated in severe renal impairment (eGFR <30).",
        officialTextbookReference: {
          bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
          chapterAndSection: "Chapter 33: Lipid-Lowering Drugs — Fibrates, pp. 612–616",
          biologicalPharmacology: "Synthetic PPAR-alpha ligand modulating transcriptional expression of endothelial adhesion molecules and lipid transport apolipoproteins.",
          trialEvidence: "FIELD Trial (Lancet 2007; 370:1687-1697) & ACCORD-Eye Trial (NEJM 2010; 363:233-244)"
        }
      }
    ]
  };
}
