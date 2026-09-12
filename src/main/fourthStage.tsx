import PDFComposer from '@/main/components/PDFComposer';
import ReviewPicker from '@/main/components/ReviewPicker';
import { Box } from '@mui/material';

export default function FourthStage() {
  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
      <ReviewPicker />
      <PDFComposer />
    </Box>
  );
}
