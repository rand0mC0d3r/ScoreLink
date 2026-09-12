import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import ReflowPreviewPdf from '@/main/components/ReflowPreviewPdf';
import { Box } from '@mui/material';

export type ExtractedPage = {
  pageNumber: number;
  url: string;
  sizeKb: number;
  widthPx: number;
  heightPx: number;
};


export default function ReviewPage({ label, page, scale = 1 }: { label: string; page: ExtractedPage; scale: number }) {
  const { setSetting } = useSettings();
  const activePage = useSettingsStoreSelector((settings) => settings.activePage);
  const scrollPosition = useSettingsStoreSelector((settings) => settings.activePageScrollPosition);
  const librettoReflowSelections = useSettingsStoreSelector((settings) => settings.librettoReflowSelections);
  const pageWidth = page.widthPx / scale;
  const pageHeight = page.heightPx / scale;
  const isActive = activePage === page.pageNumber;
  const pageReflowSelections = librettoReflowSelections.filter(
    (selection) => selection.scorePageNumber === page.pageNumber,
  );
  const sortedPageReflowSelections = [...pageReflowSelections].sort((a, b) => a.scoreScrollPosition - b.scoreScrollPosition);
  const activatePage = () => {
    setSetting((settings) => ({ ...settings, activePage: page.pageNumber }));
  };

  return (
    <Box
      key={page.pageNumber}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minWidth: 0,
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2,
        mb: 2,
      }}
    >

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>


        <ReflowPreviewPdf
          pageNumber={page.pageNumber}
          // previewWidth={1000}
        />
      </Box>
    </Box>
  );
}
