import { Box, Typography } from '@mui/material';

import SolidChip from '@/components/SolidChip';
import DarkLightStatus from '@/middleware/tools/ActionTools/DarkLightStatus';
import FullscreenToggle from '@/middleware/tools/ActionTools/FullscreenToggle';
import SettingsWindowToggle from '@/middleware/tools/ActionTools/SettingsWindowToggle';
import TutorialToggle from '@/middleware/tools/ActionTools/TutorialToggle';
import ExtendedMenu from '@/middleware/tools/PopoverTools/ExtendedMenu';

export default function Header() {
  return (
    <Box sx={{
      px: 4, py: 1.5, bgcolor: 'background.paper', display: 'flex',
      flexDirection: 'row', justifyContent: 'space-between',
      zIndex: 10
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <img
          src="./couchLogoMini.png"
          alt="Logo"
          width={45}
          height={30}
          style={{ width: 45, height: 30 }}
          fetchPriority="high"
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: 17, lineHeight: 1 }}>ScoreLink</Typography>
            <SolidChip label="Beta" variant="header" />
          </Box>
          <Typography variant="caption" color="textDisabled" sx={{ lineHeight: 1 }}>Load · Drag · Recompose</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <SettingsWindowToggle />
        <DarkLightStatus />
        <FullscreenToggle />
        <TutorialToggle />
        <ExtendedMenu />
      </Box>
    </Box>
  );
}
