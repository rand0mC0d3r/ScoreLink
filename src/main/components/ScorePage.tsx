import SolidChip from '@/components/SolidChip';
import { useSettings, useSettingsStoreSelector, type LibrettoReflowSelection } from '@/context/settingsStore';
import ReflowPreviewPdf from '@/main/components/ReflowPreviewPdf';
import { Box, Button, Slider } from '@mui/material';
import { useInView } from 'react-intersection-observer';
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
  const { inView, ref } = useInView();
  const isActive = activePage === page.pageNumber;
  const pageReflowSelections = librettoReflowSelections.filter(
    (selection) => selection.scorePageNumber === page.pageNumber,
  );
  const sortedPageReflowSelections = [...pageReflowSelections].sort((a, b) => a.scoreScrollPosition - b.scoreScrollPosition);
  const activatePage = () => {
    setSetting((settings) => ({ ...settings, activePage: page.pageNumber }));
  };
  const deleteLibrettoReflowSelection = (selection: LibrettoReflowSelection) => {
    setSetting((settings) => ({
      ...settings,
      librettoReflowSelections: settings.librettoReflowSelections.filter(({ name }) => name !== selection.name),
    }));
  };

  return (
    <Box
      ref={ref}
      key={page.pageNumber}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        minWidth: 0,
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SolidChip label={`Page ${page.pageNumber}`} variant={isActive ? 'header' : 'text'} fontSize={22} height={36} minWidth={110} />
        <Button variant={isActive ? 'contained' : 'outlined'} onClick={activatePage}>
          {isActive ? 'Active' : 'Activate'}
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, width: '100%' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1 }}>
            <Box
              sx={{ position: 'relative', width: pageWidth, height: pageHeight }}>
              {inView && <Box
                component="iframe"
                title={`${label} page ${page.pageNumber}`}
                src={`${page.url}#toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
                sx={{ display: 'block', width: '100%', height: '100%',
                  border: 0, backgroundColor: 'background.default',
                  opacity: isActive ? 1 : 0.35,
                }}
              />}
            </Box>
            {isActive && (
              <Slider
                valueLabelFormat={(value) => `Insert at position: ${100 - value}%`}
                orientation="vertical"
                value={100 - scrollPosition}
                valueLabelDisplay="auto"
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
          onDeleteSelection={deleteLibrettoReflowSelection}
        />
        {inView && <ReflowPreviewPdf
          pageNumber={page.pageNumber}
        />}
      </Box>
    </Box>
  );
}
