import { BYOKProvider } from '@/context/byokStore';
import React from 'react';
import { AlbumPhotoCardProvider } from './albumPhotoCardStore';
import { SettingsProvider } from './settingsStore';
import { ThemeContextProvider } from './ThemeContext';

type Props = { children: React.ReactNode };

export default function AppProviders({ children }: Props) {
  return (
    <SettingsProvider>
      <ThemeContextProvider>
        <BYOKProvider>
          {/* <PipelineProvider> */}
          <AlbumPhotoCardProvider>
            {children}
          </AlbumPhotoCardProvider>
          {/* </PipelineProvider> */}
        </BYOKProvider>
      </ThemeContextProvider>
    </SettingsProvider>
  );
}
