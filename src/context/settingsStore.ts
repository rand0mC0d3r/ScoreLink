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
  librettoReflowSelections: LibrettoReflowSelection[],
  activePage?: number,
  activePageScrollPosition: number,


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

export type LibrettoReflowSelection = {
  name: string,
  type: 'librettoSection' | 'emoji' | 'paragraph',
  scorePageNumber: number,
  scoreScrollPosition: number,
  librettoPageNumber: number,
  librettoSelection: [number, number],
}

export type ReflowPreviewSegment = {
  type: 'score' | 'libretto',
  height: number,
  ariaLabel: string,
  caption: string,
  sourcePageNumber?: number,
  pageUrl?: string,
  pageWidth?: number,
  pageHeight?: number,
  cropStart?: number,
  cropEnd?: number,
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
  librettoReflowSelections: [],
  activePage: undefined,
  activePageScrollPosition: 0,


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

export const getReflowPreviewSegments = (pageNumber: number): ReflowPreviewSegment[] => {
  const { scorePages, librettoPages, librettoReflowSelections } = getSettingsStore()
  const scorePage = scorePages.find((page) => page.pageNumber === pageNumber)
  const selections = librettoReflowSelections
    .filter((selection) => selection.scorePageNumber === pageNumber)
    .sort((a, b) => a.scoreScrollPosition - b.scoreScrollPosition)
  const previewWidth = 288
  const scoreGapHeight = (startPosition: number, endPosition: number) => (
    scorePage
      ? scorePage.heightPx * previewWidth / scorePage.widthPx * (endPosition - startPosition) / 100
      : 0
  )

  if (selections.length === 0) {
    return [{
      type: 'score',
      height: scoreGapHeight(0, 100),
      ariaLabel: `Score page ${pageNumber}`,
      caption: '0% - 100%',
      pageUrl: scorePage?.url,
      pageWidth: scorePage?.widthPx,
      pageHeight: scorePage?.heightPx,
      cropStart: 0,
      cropEnd: 100,
    }]
  }

  const segments = selections.flatMap((selection, index) => {
    const startPosition = index === 0 ? 0 : selections[index - 1].scoreScrollPosition
    const librettoPage = librettoPages.find((page) => page.pageNumber === selection.librettoPageNumber)

    return [
      {
        type: 'score' as const,
        height: scoreGapHeight(startPosition, selection.scoreScrollPosition),
        ariaLabel: `Score gap ${index + 1} for score page ${pageNumber}`,
        caption: `${startPosition}% - ${selection.scoreScrollPosition}%`,
        sourcePageNumber: scorePage?.pageNumber,
        pageUrl: scorePage?.url,
        pageWidth: scorePage?.widthPx,
        pageHeight: scorePage?.heightPx,
        cropStart: startPosition,
        cropEnd: selection.scoreScrollPosition,
      },
      {
        type: 'libretto' as const,
        height: librettoPage
          ? librettoPage.heightPx * previewWidth / librettoPage.widthPx * (selection.librettoSelection[1] - selection.librettoSelection[0]) / 100
          : 0,
        ariaLabel: `Libretto selection ${index + 1} for score page ${pageNumber}`,
        caption: `Libretto page ${selection.librettoPageNumber}`,
        sourcePageNumber: librettoPage?.pageNumber,
        pageUrl: librettoPage?.url,
        pageWidth: librettoPage?.widthPx,
        pageHeight: librettoPage?.heightPx,
        cropStart: selection.librettoSelection[0],
        cropEnd: selection.librettoSelection[1],
      },
    ]
  })

  if (selections.length > 0) {
    const lastSelection = selections[selections.length - 1]
    segments.push({
      type: 'score',
      height: scoreGapHeight(lastSelection.scoreScrollPosition, 100),
      ariaLabel: `Score gap after selection ${selections.length} for score page ${pageNumber}`,
      caption: `${lastSelection.scoreScrollPosition}% - 100%`,
      sourcePageNumber: scorePage?.pageNumber,
      pageUrl: scorePage?.url,
      pageWidth: scorePage?.widthPx,
      pageHeight: scorePage?.heightPx,
      cropStart: lastSelection.scoreScrollPosition,
      cropEnd: 100,
    })
  }

  return segments
}

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
