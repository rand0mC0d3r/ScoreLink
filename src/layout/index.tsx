import AiLoadingBar from '@/components/AiLoadingBar';
import LoadingBar from '@/components/LoadingBar';
import StatusBar from '@/components/StatusBar';
import MainDriver from '@/components/tutorial/MainDriver';
import LightboxWindow from '@/middleware/windows/LightboxWindow';
import NewVersionWindow from '@/middleware/windows/NewVersionWindow';
import OnboardingWindow from '@/middleware/windows/OnboardingWindow';
import Header from '@/middleware/windows/pipeline/components/Header';
import SettingsWindow from '@/middleware/windows/SettingsWindow';
import Box from '@mui/material/Box';

export default function AppLayout() {

  return (
    <>
      <LightboxWindow />
      <NewVersionWindow />
      <OnboardingWindow />
      <SettingsWindow />

      <MainDriver />
      <AiLoadingBar />


      <Header
        currentPipelineId={''}
        pipelines={[]}
        loadPipeline={() => {}}
      />
      dddd


      <Box
        id="status-bar"
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          p: 0.5,
          py: 0,
          position: 'relative',
        }}
      >
        <LoadingBar />
        <StatusBar />
      </Box>
    </>
  );
}
