import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import ReflowPreviewPdf from '@/main/components/ReflowPreviewPdf';
import { Box, Button, Slider, Typography } from '@mui/material';
import ReflowPreview from './ReflowPreview';

export type ExtractedPage = {
  pageNumber: number;
  url: string;
  sizeKb: number;
  widthPx: number;
  heightPx: number;
};


export default function ScorePage({ label, page, scale = 1 }: { label: string; page: ExtractedPage; scale: number }) {
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">Page {page.pageNumber}</Typography>
        <Button size="small" variant="outlined" onClick={activatePage}>
          Activate
        </Button>
        {scrollPosition}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1 }}>
            <Box sx={{ position: 'relative', width: pageWidth, height: pageHeight }}>
              <Box
                component="iframe"
                title={`${label} page ${page.pageNumber}`}
                src={`${page.url}#toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
                sx={{ display: 'block', width: '100%', height: '100%', border: 0, backgroundColor: 'background.default' }}
              />
            </Box>
            {isActive && (
              <Slider
                aria-label={`Scroll position for page ${page.pageNumber}`}
                orientation="vertical"
                value={100 - scrollPosition}
                min={0}
                max={100}
                onChange={(_, value) => {
                  if (typeof value === 'number') {
                    setSetting((settings) => ({ ...settings, activePageScrollPosition: 100 - value }));
                  }
                }}
                color="secondary"
                sx={{ height: pageHeight, py: 0 }}
              />
            )}
          </Box>
        </Box>
        <ReflowPreview
          pageNumber={page.pageNumber}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          selections={sortedPageReflowSelections}
        />
        <ReflowPreviewPdf
          pageNumber={page.pageNumber}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          selections={sortedPageReflowSelections}
        />
      </Box>
    </Box>
  );
}
