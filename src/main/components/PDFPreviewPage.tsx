import SolidChip from '@/components/SolidChip';
import { Box } from '@mui/material';

export type ExtractedPage = {
  pageNumber: number;
  url: string;
  sizeKb: number;
  widthPx: number;
  heightPx: number;
};

export default function PDFPreviewPage({ label, page, scale = 1 }: { label: string; page: ExtractedPage; scale: number }) {
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
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
        <SolidChip label={`Page ${page.pageNumber}`} variant="header" />
        <SolidChip label={`Size: ${page.sizeKb} KB`} />
        <SolidChip label={`Dimensions: ${page.widthPx} x ${page.heightPx} px`} />
      </Box>
      <Box
        component="iframe"
        title={`${label} page ${page.pageNumber}`}
        src={`${page.url}#toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
        sx={{ width: page.widthPx / scale, height: page.heightPx / scale, border: 0, backgroundColor: 'background.default', borderRadius: 2, overflow: 'hidden' }}
      />
    </Box>
  );
}
