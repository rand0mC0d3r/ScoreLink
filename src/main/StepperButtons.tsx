import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import { Box, Button, Divider, Stack, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronsRight, CircleX } from 'lucide-react';

const steps = [
  "Load PDF",
  "Split In page",
  "Add Libretto",
  "Review",
];

export default function StepperButtons() {
  const { setSetting } = useSettings()
  const pipelineStep = useSettingsStoreSelector((s) => s.pipelineStep)

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
    }}>

      <Stack direction={"row"} divider={<Divider orientation="vertical" flexItem />} spacing={2}>
        {steps.map((label, index) => (
          <Box key={label} sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
          }}>
            <Box sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: index <= pipelineStep ? 'primary.main' : 'text.disabled',
            }} />
            <Box sx={{ fontSize: 12, color: index <= pipelineStep ? 'text.primary' : 'text.disabled' }}>{label}</Box>
          </Box>
        ))}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'stretch' }}>
        <Tooltip title={pipelineStep === 0 ? "You are at the first step" : "Go to previous step"}>
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
        </Tooltip>

        <Tooltip title={pipelineStep === steps.length - 1 ? "You are at the last step" : "Go to next step"}>
          <Button
            size="large"
            disabled={pipelineStep === steps.length - 1}
            onClick={() => {
              if (pipelineStep < steps.length - 1) {
                setSetting(prev => ({ ...prev, pipelineStep: prev.pipelineStep + 1 }))
              }
            }}
            variant="contained">
            { pipelineStep === steps.length - 1 ? <CircleX size={16} /> : <ChevronsRight size={16} /> }
          </Button>
        </Tooltip>
      </Box>
    </Box>
  )
}
