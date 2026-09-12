import { useSettings } from '@/context/settingsStore';
import { Box, Button, Typography } from '@mui/material';

export type ExtractedPage = {
  pageNumber: number;
  url: string;
  sizeKb: number;
  widthPx: number;
  heightPx: number;
};


export default function ScorePage({ label, page, scale = 1 }: { label: string; page: ExtractedPage; scale: number }) {
  const { setSetting } = useSettings();
  const pageWidth = page.widthPx / scale;
  const pageHeight = page.heightPx / scale;

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
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
