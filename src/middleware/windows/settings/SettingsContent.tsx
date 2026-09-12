import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import AICostsPopover from '@/middleware/windows/settings/AICostsPopover';
import BYOKPopover from '@/middleware/windows/settings/BYOKPopover';
import LayoutPopover from '@/middleware/windows/settings/LayoutPopover';
import { Box } from '@mui/material';
import { Astroid, Shapes } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsContent() {
  const { t } = useTranslation()
  const { setSetting } = useSettings()
  const activeSettingsTab = useSettingsStoreSelector((state) => state.activeSettingsTab);

  const sections = useMemo(() => [
    { key: 'layout', titleKey: 'settingsInterfaceTitle', component: <LayoutPopover />, icon: <Shapes size={16} />, guidance: t('layoutGuidance') },
    { key: 'byok', group: 'ai', titleKey: 'settingsByokTitle', component: <BYOKPopover />, icon: <Astroid size={16} />, guidance: t('settingsByokGuidance') },
    { key: 'costs', group: 'ai', titleKey: 'settingsByokCosts', component: <AICostsPopover />, icon: <Astroid size={16} />, guidance: t('settingsByokGuidanceCosts') },
  ], [t])

  useEffect(() => {
    if (!activeSettingsTab && sections.length > 0) {
      setSetting((prev) => ({ ...prev, activeSettingsTab: sections[0].key }))

    }
  }, [activeSettingsTab, sections, setSetting]);



  return (<>
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, height: "100%" }} id="settings-content">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: '0 0 250px' }}>
        sidebar
      </Box>

      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, overflow: 'auto'  }}>
       hello
      </Box>
    </Box>
  </>)
}
