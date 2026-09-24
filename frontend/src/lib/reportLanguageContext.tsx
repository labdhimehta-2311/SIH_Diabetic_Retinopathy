'use client';

import React, { createContext, useContext } from 'react';
import { SupportedLanguage } from './reportTranslations';

interface ReportLanguageContextType {
  activeLang: SupportedLanguage;
  setActiveLang: (lang: SupportedLanguage) => void;
}

const ReportLanguageContext = createContext<ReportLanguageContextType>({
  activeLang: 'en',
  setActiveLang: () => {},
});

export const ReportLanguageProvider = ({
  children,
  activeLang,
  setActiveLang,
}: {
  children: React.ReactNode;
  activeLang: SupportedLanguage;
  setActiveLang: (lang: SupportedLanguage) => void;
}) => {
  return (
    <ReportLanguageContext.Provider value={{ activeLang, setActiveLang }}>
      {children}
    </ReportLanguageContext.Provider>
  );
};

export const useReportLanguage = () => useContext(ReportLanguageContext);
