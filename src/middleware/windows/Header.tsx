import { Box, Typography } from '@mui/material';

import SolidChip from '@/components/SolidChip';
import StepperButtons from '@/main/StepperButtons';
import DarkLightStatus from '@/middleware/tools/ActionTools/DarkLightStatus';
import FullscreenToggle from '@/middleware/tools/ActionTools/FullscreenToggle';
import SettingsWindowToggle from '@/middleware/tools/ActionTools/SettingsWindowToggle';
import StoreFileControls from '@/middleware/tools/ActionTools/StoreFileControls';

export default function Header() {
  return (
    <Box sx={{
      px: 4, py: 1.5, bgcolor: 'background.paper', display: 'flex',
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', gap: 2,
      zIndex: 10
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <img
          src="./smalllogo.png"
          alt="Logo"
          width={30}
          height={30}
          style={{ width: 30, height: 30 }}
          fetchPriority="high"
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: 17, lineHeight: 1 }}>ScoreLink</Typography>
            <SolidChip label="Beta" variant="header" />
          </Box>
          <Typography variant="caption" color="textDisabled" sx={{ lineHeight: 1 }}>Score · Libretto · Puff!</Typography>
        </Box>
      </Box>

      <StepperButtons />

      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <StoreFileControls />
        <SettingsWindowToggle />
        <DarkLightStatus />
        <FullscreenToggle />
      </Box>
    </Box>
  );
}
