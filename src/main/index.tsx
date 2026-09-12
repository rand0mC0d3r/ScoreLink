import { useSettings } from '@/context/settingsStore';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function MainApp() {
  const { setSetting } = useSettings()
  const { t } = useTranslation()

  return (
    <Box sx={{
      display: 'flex',
      flex: 1,
      backgroundColor: 'divider',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      py: 4,
    }}>

    </Box>
  )
}
