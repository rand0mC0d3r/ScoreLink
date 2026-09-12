import ReflowPreviewPdf from '@/main/components/ReflowPreviewPdf';
import { Box } from '@mui/material';

export type ExtractedPage = {
  pageNumber: number;
  url: string;
  sizeKb: number;
  widthPx: number;
  heightPx: number;
};


export default function ReviewPage({ label, page, scale = 1 }: { label: string; page: ExtractedPage; scale: number }) {

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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <ReflowPreviewPdf
          pageNumber={page.pageNumber}
        />
      </Box>
    </Box>
  );
}
