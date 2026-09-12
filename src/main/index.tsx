import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import FourthStage from '@/main/fourthStage';
import SecondStage from '@/main/secondStage';
import ThirdStage from '@/main/thirdStage';
import { Box, Button, Step, StepLabel, Stepper } from '@mui/material';
import { ChevronLeft, ChevronsRight, CircleX } from 'lucide-react';
import FirstStage from './firstStage';

const steps = [
  "Load PDF",
  "Split In page",
  "Add Libretto",
  "Review",
];

export default function MainApp() {
  const { setSetting } = useSettings()
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
      <Box sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        flexDirection: 'column',
        gap: 2,
        p: 0.5,
        overflow: 'auto',
      }}>
        <Box sx={{
          px: 1,
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}>
          <Stepper activeStep={pipelineStep} alternativeLabel nonLinear={true} >
            {steps.map((label) => (
              <Step key={label}
                sx={{
                  width: '150px'
                }}
              >
                <StepLabel >{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'stretch' }}>
            <Button
              size="large"
              disabled={pipelineStep === 0}
              onClick={() => {
                if (pipelineStep > 0) {
                  setSetting(prev => ({ ...prev, pipelineStep: prev.pipelineStep - 1 }))
                }
              } } variant="outlined">
              <ChevronLeft size={16} />
            </Button>
            <Button
              size="large"
              disabled={pipelineStep === 4}
              onClick={() => {
                if (pipelineStep < steps.length - 1) {
                  setSetting(prev => ({ ...prev, pipelineStep: prev.pipelineStep + 1 }))
                }
              }}
              variant="contained">
              { pipelineStep === steps.length - 1 ? <CircleX size={16} /> : <ChevronsRight size={16} /> }
            </Button>
          </Box>
        </Box>

        {pipelineStep === 0 && <FirstStage />}
        {pipelineStep === 1 && <SecondStage />}
        {pipelineStep === 2 && <ThirdStage />}
        {pipelineStep === 3 && <FourthStage />}
      </Box>
    </Box>
  )
}
