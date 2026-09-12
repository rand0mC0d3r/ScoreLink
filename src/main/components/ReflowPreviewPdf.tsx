import { useSettingsStoreSelector } from '@/context/settingsStore';
import { Box, Typography } from '@mui/material';

type ReflowPreviewSelection = {
  scoreScrollPosition: number;
  librettoPageNumber: number;
  librettoSelection: [number, number];
};

type ReflowPreviewProps = {
  pageNumber: number;
  selections: ReflowPreviewSelection[];
};

type ReflowPreviewSegment = {
  type: 'score' | 'libretto';
  height: number;
  ariaLabel: string;
  caption: string;
  pageUrl?: string;
  pageWidth?: number;
  pageHeight?: number;
  cropStart?: number;
  cropEnd?: number;
};

const previewWidth = 188;

export default function ReflowPreviewPdf({ pageNumber, selections }: ReflowPreviewProps) {
  const scorePages = useSettingsStoreSelector((s) => s.scorePages)
  const librettoPages = useSettingsStoreSelector((s) => s.librettoPages)
  const scorePage = scorePages.find((page) => page.pageNumber === pageNumber)

  const scoreGapHeight = (startPosition: number, endPosition: number) => (
    scorePage
      ? scorePage.heightPx * previewWidth / scorePage.widthPx * (endPosition - startPosition) / 100
      : 0
  );
  const segments = selections.flatMap((selection, index) => {
    const startPosition = index === 0 ? 0 : selections[index - 1].scoreScrollPosition;
    const librettoPage = librettoPages.find((page) => page.pageNumber === selection.librettoPageNumber);

    return [
      {
        type: 'score' as const,
        height: scoreGapHeight(startPosition, selection.scoreScrollPosition),
        ariaLabel: `Score gap ${index + 1} for score page ${pageNumber}`,
        caption: `${startPosition}% - ${selection.scoreScrollPosition}%`,
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
        pageUrl: librettoPage?.url,
        pageWidth: librettoPage?.widthPx,
        pageHeight: librettoPage?.heightPx,
        cropStart: selection.librettoSelection[0],
        cropEnd: selection.librettoSelection[1],
      },
    ];
  });

  if (selections.length > 0) {
    const lastSelection = selections[selections.length - 1];
    segments.push({
      type: 'score',
      height: scoreGapHeight(lastSelection.scoreScrollPosition, 100),
      ariaLabel: `Score gap after selection ${selections.length} for score page ${pageNumber}`,
      caption: `${lastSelection.scoreScrollPosition}% - 100%`,
      pageUrl: scorePage?.url,
      pageWidth: scorePage?.widthPx,
      pageHeight: scorePage?.heightPx,
      cropStart: lastSelection.scoreScrollPosition,
      cropEnd: 100,
    });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 180, alignItems: 'flex-start' }}>
      {[...segments].map((segment: ReflowPreviewSegment, index) => (
        <Box key={`${segment.type}-${index}`} sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'flex-start' }}>
          <Box
            aria-label={segment.ariaLabel}
            sx={{
              position: 'relative',
              width: previewWidth,
              height: segment.height,
              overflow: 'hidden',
              boxSizing: 'border-box',
              border: 2,
              borderRadius: 1,
              borderColor: segment.type === 'score' ? 'secondary.main' : 'primary.main',
              backgroundColor: 'background.paper',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 2,
                overflow: 'hidden',
                clipPath: 'inset(0)',
              }}
            >
              {segment.pageUrl && segment.pageWidth && segment.pageHeight && segment.cropStart !== undefined && segment.cropEnd !== undefined && (
                <Box
                  component="iframe"
                  title={segment.ariaLabel}
                  src={`${segment.pageUrl}#toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
                  sx={{
                    position: 'absolute',
                    top: `${-(segment.type === 'score' ? segment.cropStart : 100 - segment.cropEnd) * (segment.pageHeight * previewWidth / segment.pageWidth) / 100}px`,
                    left: 0,
                    display: 'block',
                    width: previewWidth,
                    height: segment.pageHeight * previewWidth / segment.pageWidth,
                    border: 0,
                    pointerEvents: 'none',
                    transformOrigin: 'top left',
                    opacity: 0.72,
                  }}
                />
              )}
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  border: 2,
                  borderColor: segment.type === 'score' ? 'secondary.main' : 'primary.main',
                  backgroundColor: segment.type === 'score' ? 'secondary.main' : 'primary.main',
                  opacity: 0.14,
                  pointerEvents: 'none',
                }}
              />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {segment.caption}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
