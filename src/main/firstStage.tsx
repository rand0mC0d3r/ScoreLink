import { persistPdfFile, useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import PanelWrapper from '@/main/components/PanelWrapper';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState, type ChangeEvent } from 'react';

type ExtractedPage = {
  pageNumber: number;
  url: string;
};

type PdfPreviewProps = {
  label: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function PdfPreview({ label, file, onChange, color }: PdfPreviewProps & { color: 'primary' | 'secondary' }) {
  const previewUrl = usePdfPreviewUrl(file);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);
  };

  return (<>
    <PanelWrapper
      label={label}
      file={file}
      color={color}
      tools={<>
        <Button component="label" variant="contained" color={color}>
          Upload PDF
          <input hidden type="file" accept="application/pdf,.pdf" onChange={handleFileChange} />
        </Button>
      </>}
    >
      {previewUrl ? (
        <Box
          component="iframe"
          title={`${label} preview`}
          src={previewUrl}
          sx={{ width: '100%', minHeight: 560, flex: 1, border: 0, borderRadius: 2, overflow: 'hidden', backgroundColor: 'background.default' }}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            minHeight: 560,
            flex: 1,
            placeItems: 'center',
            border: 1,
            borderColor: 'divider',
            backgroundColor: 'background.default',
          }}
        >
          <Typography color="text.secondary">Choose a PDF to preview it here.</Typography>
        </Box>
      )}
    </PanelWrapper>
  </>);
}

function usePdfPreviewUrl(file: File | null) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return previewUrl;
}

export default function FirstStage() {
  const { setSetting } = useSettings()
  const scorePDF = useSettingsStoreSelector((s) => s.scorePDF)
  const librettoPDF = useSettingsStoreSelector((s) => s.librettoPDF)

  const handleScoreChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    persistPdfFile('scorePDF', file);
    setSetting(prev => ({ ...prev, scorePDF: file }));
  };

  const handleLibrettoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    persistPdfFile('librettoPDF', file);
    setSetting(prev => ({ ...prev, librettoPDF: file }));
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
      <PdfPreview label="Score" file={scorePDF ?? null} onChange={handleScoreChange} color="secondary" />
      <PdfPreview label="Libretto" file={librettoPDF ?? null} onChange={handleLibrettoChange} color="primary" />
    </Box>
  );
}
