// components/Icon.tsx
import React from 'react';
import { useIcons } from '../context/IconContext';

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  filled?: boolean;
  [key: string]: any;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = '', 
  style = {}, 
  width = 24, 
  height = 24,
  filled = false,
  ...props 
}) => {
  const { getIcon, loading } = useIcons();

  if (loading) {
    return <div className={`icon-loading ${className}`} style={{ width, height, ...style }} />;
  }

  const iconName = filled ? `${name}-filled` : name;
  const svgContent = getIcon(iconName);

  if (!svgContent) {
    console.warn(`Icon "${iconName}" not found`);
    return <div className={`icon-not-found ${className}`} style={{ width, height, ...style }} />;
  }

  return (
    <div
      className={`icon ${className}`}
      style={{ width, height, display: 'inline-flex', ...style }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
};