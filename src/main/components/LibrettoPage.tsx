import { Box, Slider, Typography } from '@mui/material';
import { useState } from 'react';

export type ExtractedPage = {
  pageNumber: number;
  url: string;
  sizeKb: number;
  widthPx: number;
  heightPx: number;
};

export default function LibrettoPage({ label, page, scale = 1 }: { label: string; page: ExtractedPage; scale: number }) {
  const [selection, setSelection] = useState<[number, number]>([20, 80]);
  const pageWidth = page.widthPx / scale;
  const pageHeight = page.heightPx / scale;

  return (
    <Box
      key={page.pageNumber}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minWidth: 0,
        borderRadius: 2,
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2,
        mb: 2,
      }}
    >
      <Typography variant="body2">Page {page.pageNumber}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1 }}>
        <Box sx={{ position: 'relative', width: pageWidth, height: pageHeight }}>
          <Box
            component="iframe"
            title={`${label} page ${page.pageNumber}`}
            src={`${page.url}#toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
            sx={{ display: 'block', width: '100%', height: '100%', border: 0, backgroundColor: 'background.default' }}
          />
          <Box
            aria-label="Selected libretto area"
            sx={{
              position: 'absolute',
              top: `${100 - selection[1]}%`,
              right: 0,
              left: 0,
              height: `${selection[1] - selection[0]}%`,
              backgroundColor: 'primary.main',
              opacity: 0.28,
              pointerEvents: 'none',
            }}
          />
        </Box>
        <Slider
          aria-label={`Selected area for page ${page.pageNumber}`}
          orientation="vertical"
          value={selection}
          min={0}
          max={100}
          onChange={(_, value) => {
            if (Array.isArray(value)) setSelection([value[0], value[1]]);
          }}
          sx={{ height: pageHeight, py: 0 }}
        />
      </Box>
    </Box>
  );
}
