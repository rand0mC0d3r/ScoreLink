import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import { Box, Button, Slider, Typography } from '@mui/material';

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
  const sortedPageReflowSelections = [...pageReflowSelections].sort((a, b) => a.scoreScrollPosition - b.scoreScrollPosition);
  const scoreGapHeight = (startPosition: number, endPosition: number) => (
    pageHeight * (endPosition - startPosition) / 100
  );
  const reflowPreviewSegments = sortedPageReflowSelections.flatMap((selection, index) => {
    const startPosition = index === 0 ? 0 : sortedPageReflowSelections[index - 1].scoreScrollPosition;

    return [
      {
        type: 'score' as const,
        height: scoreGapHeight(startPosition, selection.scoreScrollPosition),
        ariaLabel: `Score gap ${index + 1} for score page ${page.pageNumber}`,
        caption: `${startPosition}% - ${selection.scoreScrollPosition}%`,
      },
      {
        type: 'libretto' as const,
        height: reflowPreviewPageHeight * (selection.librettoSelection[1] - selection.librettoSelection[0]) / 100,
        ariaLabel: `Libretto selection ${index + 1} for score page ${page.pageNumber}`,
        caption: `Libretto page ${selection.librettoPageNumber}`,
      },
    ];
  });

  if (sortedPageReflowSelections.length > 0) {
    const lastSelection = sortedPageReflowSelections[sortedPageReflowSelections.length - 1];
    reflowPreviewSegments.push({
      type: 'score',
      height: scoreGapHeight(lastSelection.scoreScrollPosition, 100),
      ariaLabel: `Score gap after selection ${sortedPageReflowSelections.length} for score page ${page.pageNumber}`,
      caption: `${lastSelection.scoreScrollPosition}% - 100%`,
    });
  }
  const reflowPreviewNaturalHeight = reflowPreviewSegments.reduce((total, segment) => total + segment.height, 0);
  const reflowPreviewScale = reflowPreviewNaturalHeight > pageHeight
    ? pageHeight / reflowPreviewNaturalHeight
    : 1;

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 180, maxHeight: pageHeight, overflow: 'hidden' }}>
          {reflowPreviewSegments.map((segment, index) => (
            <Box key={`${segment.type}-${index}`} sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'flex-start' }}>
              <Box
                aria-label={segment.ariaLabel}
                sx={{
                  width: reflowPreviewWidth,
                  height: segment.height * reflowPreviewScale,
                  border: 1,
                  borderRadius: 1,
                  borderColor: segment.type === 'score' ? 'secondary.main' : 'primary.main',
                  backgroundColor: segment.type === 'score' ? 'secondary.main' : 'primary.main',
                  opacity: 0.42,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {segment.caption}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
