import AICostsPopover from '@/middleware/windows/settings/AICostsPopover';
import BYOKPopover from '@/middleware/windows/settings/BYOKPopover';
import LayoutPopover from '@/middleware/windows/settings/LayoutPopover';
import { Box } from '@mui/material';

export default function SettingsContent() {

  return (<>
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, height: "100%" }} id="settings-content">
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, overflow: 'auto'  }}>
        <LayoutPopover />
        <BYOKPopover />
        <AICostsPopover />
      </Box>
    </Box>
  </>)
}
