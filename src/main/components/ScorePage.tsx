import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import { Box, Button, Slider, Typography } from '@mui/material';
import { Fragment } from 'react';

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
  const reflowPreviewWidth = 88;
  const reflowPreviewPageHeight = pageHeight * reflowPreviewWidth / pageWidth;
  const isActive = activePage === page.pageNumber;
  const pageReflowSelections = librettoReflowSelections.filter(
    (selection) => selection.scorePageNumber === page.pageNumber,
  );
  const scoreGapHeight = (startPosition: number, endPosition: number) => (
    reflowPreviewPageHeight * (endPosition - startPosition) / 100
  );

  const activatePage = () => {
    setSetting((settings) => ({ ...settings, activePage: page.pageNumber }));
  };

  const sortedPageReflowSelections = [...pageReflowSelections].sort((a, b) => a.scoreScrollPosition - b.scoreScrollPosition);

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
                value={scrollPosition}
                min={0}
                max={100}
                onChange={(_, value) => {
                  if (typeof value === 'number') {
                    setSetting((settings) => ({ ...settings, activePageScrollPosition: value }));
                  }
                }}
                color="secondary"
                sx={{ height: pageHeight, py: 0 }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 180 }}>
          {sortedPageReflowSelections.map((selection, index) => (<Fragment key={`${selection.librettoPageNumber}-${selection.librettoSelection[0]}-${selection.librettoSelection[1]}-${index}`}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'start' }}>
              <Box
                aria-label={`Score selection ${index + 1} for score page ${page.pageNumber}`}
                sx={{
                  width: reflowPreviewWidth,
                  height: scoreGapHeight(
                    index === 0 ? 0 : sortedPageReflowSelections[index - 1].scoreScrollPosition,
                    selection.scoreScrollPosition,
                  ),
                  border: 1,
                  borderRadius: 1,
                  borderColor: 'secondary.main',
                  backgroundColor: 'secondary.main',
                  opacity: 0.42,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                [({index === 0 ? 0 : sortedPageReflowSelections[index - 1].scoreScrollPosition}% - {selection.scoreScrollPosition}%)]
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'start' }}>

              <Box
                aria-label={`Libretto selection ${index + 1} for score page ${page.pageNumber}`}
                sx={{
                  width: reflowPreviewWidth,
                  height: reflowPreviewPageHeight * (selection.librettoSelection[1] - selection.librettoSelection[0]) / 100,
                  border: 1,
                  borderRadius: 1,
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.main',
                  opacity: 0.42,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Libretto: {selection.scoreScrollPosition} %
              </Typography>
            </Box>
            {index === sortedPageReflowSelections.length - 1 && (
              <Box>
                <Box
                  aria-label={`Libretto selection ${index + 1} for score page ${page.pageNumber}`}
                  sx={{
                    width: reflowPreviewWidth,
                    height: scoreGapHeight(selection.scoreScrollPosition, 100),
                    border: 1,
                    borderRadius: 1,
                    borderColor: 'primary.main',
                    backgroundColor: 'secondary.main',
                    opacity: 0.42,
                  }}
                />
              </Box>
            )}
          </Fragment>))}
        </Box>
      </Box>
    </Box>
  );
}
