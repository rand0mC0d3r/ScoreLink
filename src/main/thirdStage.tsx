import LibrettoPicker from '@/main/components/LibrettoPicker';
import ScorePicker from '@/main/components/ScorePicker';
import { Box } from '@mui/material';

export default function ThirdStage() {
  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
      <ScorePicker />
      <LibrettoPicker />
    </Box>
  );
}
