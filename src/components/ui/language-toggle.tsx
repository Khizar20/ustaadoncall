import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguageContext();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 hover:bg-accent"
      title={language === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {language === 'en' ? 'اردو' : 'EN'}
      </span>
    </Button>
  );
};

export const LanguageToggleCompact: React.FC = () => {
  const { language, toggleLanguage } = useLanguageContext();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="px-2 py-1 text-xs font-medium hover:bg-accent"
      title={language === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
    >
      {language === 'en' ? 'اردو' : 'EN'}
    </Button>
  );
}; 