import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import { alpha, Box, Button, Divider, Stack, Tooltip } from '@mui/material';
import { ChevronsLeft, ChevronsRight, FileDown, FileUp, Merge, Scissors } from 'lucide-react';

const steps = [
  "Load PDF",
  "Split In page",
  "Add Libretto",
  "Review",
];

const iconsSteps = [
  <FileUp size={16} />,
  <Scissors size={16} />,
  <Merge size={16} />,
  <FileDown size={16} />,

]

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

      <Stack direction={"row"} divider={<Divider orientation="vertical" flexItem />} spacing={1}>
        {steps.map((label, index) => (
          <Box key={label} sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            p: 0.5,
            px: 2,
            borderRadius: 2,
            bgcolor: theme => index <= pipelineStep ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
          }}>
            <Box sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: index <= pipelineStep ? 'primary.main' : 'text.disabled',
            }} />
            {iconsSteps[index]}
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
            <ChevronsLeft size={16} />
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
            <ChevronsRight size={16} />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  )
}
