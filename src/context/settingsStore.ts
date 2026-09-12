import { createLocalStorageStoreNg } from '@/lib/createLocalStorageStoreNg';
import { loadStoredFile, saveStoredFile } from '@/lib/fileStorage';
import type { SupportedLanguage } from '@/lib/i18n';
import { ImageArray } from '@/middleware/windows/pipeline/types';
import React, { useEffect } from 'react';

type SettingsStore = {
  pipelineStep: number,

  librettoPDF: File | undefined,
  scorePDF: File | undefined,

  librettoPages: any[],
  scorePages: any[],
  librettoPagesSource?: string,
  scorePagesSource?: string,
  librettoPageSelections: Record<number, [number, number][]>,
  activePage?: number,


  onboarding: boolean,
  onboardingStep: number,
  newVersion?: boolean,
  serverOnline: boolean,
  lightboxOpen: boolean,
  lightboxImages: ImageArray,
  pipelineOpen: boolean,
  pipelineMaxConcurrentTasks: number,
  pipelinePhotoBatchSize: number,
  pipelineMaxAIRequests: number,
  pipelineAICallDelayMs: number,
  performanceMode: boolean,
  tutorial: boolean,
  themeMode?: 'light' | 'dark',
  themeId: string,
  thumbnailFormat: 'cover' | 'contain',
  activeSettingsTab?: string,
  previewPhotoObj?: string,
  loading: boolean,
  loadingValue: number | null,
  showSettings: boolean,
  selectMode: boolean,
  locale: SupportedLanguage,
}

const defaults: SettingsStore = {

  pipelineStep: 0,

  librettoPDF: undefined,
  scorePDF: undefined,

  librettoPages: [],
  scorePages: [],
  librettoPagesSource: undefined,
  scorePagesSource: undefined,
  librettoPageSelections: {},
  activePage: undefined,


  onboarding: true,
  onboardingStep: 0,
  newVersion: false,
  performanceMode: false,
  lightboxOpen: false,
  lightboxImages: [],
  serverOnline: true,
  thumbnailFormat: 'cover',
  themeMode: 'light',
  themeId: 'default',
  tutorial: false,
  loading: false,
  loadingValue: null,
  previewPhotoObj: undefined,
  pipelineOpen: false,
  pipelineMaxConcurrentTasks: 5,
  pipelinePhotoBatchSize: 10,
  pipelineMaxAIRequests: 2,
  pipelineAICallDelayMs: 250,
  showSettings: false,
  activeSettingsTab: undefined,
  selectMode: false,
  locale: 'en',
} satisfies SettingsStore;

const fileStorageKeys = {
  librettoPDF: 'libretto-pdf',
  scorePDF: 'score-pdf',
} as const;

const {
  Provider: BaseSettingsProvider,
  useSetStore,
  useStoreSelector: useSettingsStoreSelector,
  getStore: getSettingsStore,
  setStore: setSettingsStore,
} = createLocalStorageStoreNg<SettingsStore>(defaults, 'settingsStore')

function useHydratePdfFiles() {
  const setSetting = useSetStore()

  useEffect(() => {
    void Promise.all([
      loadStoredFile(fileStorageKeys.librettoPDF),
      loadStoredFile(fileStorageKeys.scorePDF),
    ]).then(([librettoPDF, scorePDF]) => {
      if (!librettoPDF && !scorePDF) return

      setSetting(prev => ({
        ...prev,
        librettoPDF: prev.librettoPDF ?? librettoPDF,
        scorePDF: prev.scorePDF ?? scorePDF,
      }))
    }).catch(() => undefined)
  }, [setSetting])
}

export const persistPdfFile = (key: keyof typeof fileStorageKeys, file: File | undefined) => {
  if (file) void saveStoredFile(fileStorageKeys[key], file).catch(() => undefined)
}

function SettingsProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(
    BaseSettingsProvider,
    null,
    React.createElement(PdfFileHydrator, null, children),
  )
}

function PdfFileHydrator({ children }: { children: React.ReactNode }) {
  useHydratePdfFiles()
  return children
}

export const useSettings = () => {
  const setSetting = useSetStore()

  return {
    setSetting,
    setPreviewPhotoObj: (photo: string | undefined) => {
      setSetting(prev => ({
        ...prev,
        previewPhotoObj: photo,
      }))
    },
  }
}

export { getSettingsStore, setSettingsStore, SettingsProvider, useSettingsStoreSelector };
