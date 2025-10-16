// context/IconContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { iconService } from '../services/iconService';
import type { Icon } from '../types/icon';

interface IconContextType {
  icons: Record<string, string>;
  loading: boolean;
  error: string | null;
  getIcon: (name: string) => string | undefined;
}

const IconContext = createContext<IconContextType | undefined>(undefined);

export const useIcons = () => {
  const context = useContext(IconContext);
  if (context === undefined) {
    throw new Error('useIcons must be used within an IconProvider');
  }
  return context;
};

interface IconProviderProps {
  children: ReactNode;
}

export const IconProvider: React.FC<IconProviderProps> = ({ children }) => {
  const [icons, setIcons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        setLoading(true);
        const iconsData = await iconService.getIcons();
        
        // Преобразуем массив иконок в объект для быстрого доступа по имени
        const iconsMap: Record<string, string> = {};
        
        iconsData.forEach((icon: Icon) => {
          // Убираем расширение .svg из имени для удобства использования
          const iconName = icon.name.replace('.svg', '');
          iconsMap[iconName] = iconService.decodeSvg(icon.file);
        });
        
        setIcons(iconsMap);
        setError(null);
      } catch (err) {
        setError('Failed to load icons');
        console.error('Error loading icons:', err);
      } finally {
        setLoading(false);
      }
    };

    loadIcons();
  }, []);

  const getIcon = (name: string): string | undefined => {
    return icons[name];
  };

  return (
    <IconContext.Provider value={{ icons, loading, error, getIcon }}>
      {children}
    </IconContext.Provider>
  );
};