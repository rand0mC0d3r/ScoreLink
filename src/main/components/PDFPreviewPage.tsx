import { Box, Typography } from '@mui/material';

export default function PDFPreviewPage({label, page}: {label: string, page: { pageNumber: number; url: string }}) {
  return (
    <Box
      key={page.pageNumber}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        minWidth: 0,
        p: 1.5,
        border: 1,
        borderRadius: 2,
        borderColor: 'divider',
        backgroundColor: 'background.default',
      }}
    >
      <Typography variant="body2">Page {page.pageNumber}</Typography>
      <Box
        component="iframe"
        title={`${label} page ${page.pageNumber}`}
        src={`${page.url}#toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
        sx={{ width: '100%', height: 730, border: 0, backgroundColor: 'background.default' }}
      />
    </Box>
  );
}
