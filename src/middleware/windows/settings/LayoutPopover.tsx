import SettingsSection from '@/components/SettingsSection';
import DarkLightStatus from '@/middleware/tools/ActionTools/DarkLightStatus';
import LocaleToggle from '@/middleware/tools/MixedTools/LocaleToggle';
import ThemeMenu from '@/middleware/tools/PopoverTools/ThemeMenu';
import SettingsComponentRow from '@/middleware/windows/settings/components/SettingsComponentRow';
import { Languages, PaintBucket } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

const groups = [
  {
    titleKey: 'layoutLocale',
    controls: [
      { key: 'locale', labelKey: 'layoutLocale', type: 'component', toolbarComponentId: <LocaleToggle /> },
    ],
    icon: <Languages />,
  },
  {
    titleKey: 'layoutThemeSection',
    controls: [
      { key: 'theme', labelKey: 'layoutTheme', type: 'component', toolbarComponentId: <ThemeMenu /> },
      { key: 'darkLightStatusAA', labelKey: 'toggleThemeName', type: 'component', toolbarComponentId: <DarkLightStatus /> },
    ],
    icon: <PaintBucket />,
  },
]

export default function LayoutPopover() {
  const { t } = useTranslation()

  return <>
    {groups.map((group) => (
      <SettingsSection key={group.titleKey} title={t(group.titleKey)} icon={group.icon} >
        {group.controls
          .map((control) => (
            <Fragment key={control.key}>
              {control.type === 'component' && <SettingsComponentRow label={t(control.labelKey)}>
                {control.toolbarComponentId}
              </SettingsComponentRow>}
            </Fragment>
          ))}
      </SettingsSection>
    ))}
  </>
}
