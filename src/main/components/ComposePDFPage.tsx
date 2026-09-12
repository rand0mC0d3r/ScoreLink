import { getReflowPreviewSegments, useSettingsStoreSelector, type ReflowPreviewSegment } from '@/context/settingsStore';
import { Box, Typography } from '@mui/material';

type ReflowPreviewProps = {
  pageNumber: number;
  previewWidth?: number;
};

// const previewWidth = 288;

export default function ComposePDFPage({ pageNumber, previewWidth = 288 }: ReflowPreviewProps) {
  useSettingsStoreSelector((settings) => settings);
  const segments = getReflowPreviewSegments(pageNumber);

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
