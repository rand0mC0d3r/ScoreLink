import { Box, Typography } from '@mui/material';

type ReflowPreviewSelection = {
  scoreScrollPosition: number;
  librettoPageNumber: number;
  librettoSelection: [number, number];
};

type ReflowPreviewProps = {
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
  selections: ReflowPreviewSelection[];
};

type ReflowPreviewSegment = {
  type: 'score' | 'libretto';
  height: number;
  ariaLabel: string;
  caption: string;
};

const previewWidth = 88;

export default function ReflowPreview({ pageNumber, pageWidth, pageHeight, selections }: ReflowPreviewProps) {
  const previewPageHeight = pageHeight * previewWidth / pageWidth;
  const scoreGapHeight = (startPosition: number, endPosition: number) => (
    pageHeight * (endPosition - startPosition) / 100
  );
  const segments = selections.flatMap((selection, index) => {
    const startPosition = index === 0 ? 0 : selections[index - 1].scoreScrollPosition;

    return [
      {
        type: 'score' as const,
        height: scoreGapHeight(startPosition, selection.scoreScrollPosition),
        ariaLabel: `Score gap ${index + 1} for score page ${pageNumber}`,
        caption: `${startPosition}% - ${selection.scoreScrollPosition}%`,
      },
      {
        type: 'libretto' as const,
        height: previewPageHeight * (selection.librettoSelection[1] - selection.librettoSelection[0]) / 100,
        ariaLabel: `Libretto selection ${index + 1} for score page ${pageNumber}`,
        caption: `Libretto page ${selection.librettoPageNumber}`,
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
    });
  }

  const naturalHeight = segments.reduce((total, segment) => total + segment.height, 0);
  const scale = naturalHeight > pageHeight ? pageHeight / naturalHeight : 1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 180, maxHeight: pageHeight, overflow: 'hidden' }}>
      {[...segments].reverse().map((segment: ReflowPreviewSegment, index) => (
        <Box key={`${segment.type}-${index}`} sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'flex-start' }}>
          <Box
            aria-label={segment.ariaLabel}
            sx={{
              width: previewWidth,
              height: segment.height * scale,
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
  );
}