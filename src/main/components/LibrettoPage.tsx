import { Box, Typography } from '@mui/material';

export type ExtractedPage = {
  pageNumber: number;
  url: string;
  sizeKb: number;
  widthPx: number;
  heightPx: number;
};

export default function LibrettoPage({ label, page, scale = 1 }: { label: string; page: ExtractedPage; scale: number }) {
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
      <Box
        component="iframe"
        title={`${label} page ${page.pageNumber}`}
        src={`${page.url}#toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
        sx={{ width: page.widthPx / scale, height: page.heightPx / scale, border: 0, backgroundColor: 'background.default' }}
      />
    </Box>
  );
}
