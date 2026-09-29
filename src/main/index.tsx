import { useSettingsStoreSelector } from '@/context/settingsStore';
import FourthStage from '@/main/fourthStage';
import SecondStage from '@/main/secondStage';
import ThirdStage from '@/main/thirdStage';
import { Box } from '@mui/material';
import FirstStage from './firstStage';

export default function MainApp() {
  const pipelineStep = useSettingsStoreSelector((s) => s.pipelineStep)

  return (
    <Box sx={{
      display: 'flex',
      flex: 1,
      minHeight: 0,
      backgroundColor: 'background.paper',
      flexDirection: 'column',
      p: 4,
      overflow: 'auto',
    }}>
      {pipelineStep === 0 && <FirstStage />}
      {pipelineStep === 1 && <SecondStage />}
      {pipelineStep === 2 && <ThirdStage />}
      {pipelineStep === 3 && <FourthStage />}
    </Box>
  )
}
