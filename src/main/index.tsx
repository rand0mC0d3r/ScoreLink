import { Box, Button, Step, StepLabel, Stepper } from '@mui/material';
import { ChevronLeft, ChevronsRight, CircleX } from 'lucide-react';
import { useState } from 'react';
import FirstStage from './firstStage';

const steps = [
  "Load PDF",
  "Split In page",
  "Add Libretto",
  "Review",
  "Export",
];


export default function MainApp() {
  const [onboardingStep, setOnboardingStep] = useState(0);

  return (
    <Box sx={{
      display: 'flex',
      flex: 1,
      minHeight: 0,
      backgroundColor: 'background.default',
      flexDirection: 'column',
      gap: 2,
      py: 4,
      px: { xs: 2, md: 4 },
      overflow: 'auto',
    }}>
      <Box sx={{
        px: 1,
        pr: 3,
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}>
        <Stepper activeStep={onboardingStep} alternativeLabel nonLinear={true} >
          {steps.map((label) => (
            <Step key={label}
              sx={{
                width: '140px'
              }}
            >
              <StepLabel >{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'stretch' }}>
          <Button
            size="large"
            disabled={onboardingStep === 0}
            onClick={() => {
              if (onboardingStep > 0) {
                setOnboardingStep(prev => prev - 1)
              }
            } } variant="outlined">
            <ChevronLeft size={16} />
          </Button>
          <Button
            size="large"
            disabled={onboardingStep === 2 && !serverOnline}
            onClick={() => {
              if (onboardingStep < steps.length - 1) {
                setOnboardingStep(prev => prev + 1)
              }
              if (onboardingStep === steps.length - 1) {
                setSetting(prev => ({ ...prev, onboarding: false }))
              }
            }}
            variant="contained">
            { onboardingStep === steps.length - 1 ? <CircleX size={16} /> : <ChevronsRight size={16} /> }
          </Button>
        </Box>
      </Box>
      <FirstStage />
    </Box>
  )
}
