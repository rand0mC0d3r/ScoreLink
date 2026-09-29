import { Download, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import GenericToggleButton, { GenericToggleButtonProps } from '@/components/generics/GenericToggleButton';
import { exportSettingsStore, importSettingsStore } from '@/context/settingsStore';

const STORE_FILE_NAME = 'scorelink-store.scl';

export default function StoreFileControls() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadStore = () => {
    const blob = new Blob([exportSettingsStore()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = STORE_FILE_NAME;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadStore = async (file: File) => {
    try {
      importSettingsStore(await file.text());
    } catch {
      window.alert(t('storeImportError'));
    }
  };

  return (
    <>
      <GenericToggleButton
        item={{
          tooltip: t('storeExportTooltip'),
          icon: <Download />,
          onClick: downloadStore,
        } satisfies GenericToggleButtonProps}
        variant="standard"
      />
      <GenericToggleButton
        item={{
          tooltip: t('storeImportTooltip'),
          icon: <Upload />,
          onClick: () => fileInputRef.current?.click(),
        } satisfies GenericToggleButtonProps}
        variant="standard"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".scl,application/json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void loadStore(file);
        }}
      />
    </>
  );
}
