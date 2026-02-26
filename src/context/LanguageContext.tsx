import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te';

interface Translation {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translation = {
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड', ta: 'டாஷ்போர்டு', te: 'డాష్‌బోర్డ్' },
  beltGrading: { en: 'Belt Grading', hi: 'बेल्ट ग्रेडिंग', mr: 'बेल्ट ग्रेडिंग', ta: 'பெல்ட் கிரேடிங்', te: 'బెల్ట్ గ్రేడింగ్' },
  paymentHistory: { en: 'Payment History', hi: 'भुगतान इतिहास', mr: 'पेमेंट इतिहास', ta: 'பணம் செலுத்திய வரலாறு', te: 'చెల్లింపు చరిత్ర' },
  payFee: { en: 'Pay Fee', hi: 'फीस भरें', mr: 'फी भरा', ta: 'கட்டணம் செலுத்துங்கள்', te: 'ఫీజు చెల్లించండి' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल', mr: 'प्रोफाइल', ta: 'சுயவிவரம்', te: 'ప్రొఫైల్' },
  welcome: { en: 'Welcome back', hi: 'आपका स्वागत है', mr: 'स्वागत आहे', ta: 'வரவேற்கிறோம்', te: 'స్వాగతం' },
  logout: { en: 'Logout', hi: 'लॉग आउट', mr: 'लॉग आउट', ta: 'வெளியேறு', te: 'లాగ్ అవుట్' },
  currency: { en: '₹', hi: '₹', mr: '₹', ta: '₹', te: '₹' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('mydojo_lang');
    return (saved as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('mydojo_lang', lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
