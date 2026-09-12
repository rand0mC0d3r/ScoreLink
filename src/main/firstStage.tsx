import { alpha, Box, Button, Paper, Typography } from '@mui/material';
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



  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        flex: 1,
        minWidth: 0,
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
        bgcolor: theme => alpha(theme.palette[color].main, 0.15)
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography component="h2" variant="h6">
          {label}
        </Typography>
        <Button component="label" variant="contained" color={color}>
          Upload PDF
          <input hidden type="file" accept="application/pdf,.pdf" onChange={handleFileChange} />
        </Button>
      </Box>

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

      {file && (
        <Typography noWrap color="text.secondary" variant="body2" title={file.name}>
          {file.name}
        </Typography>
      )}
    </Paper>
  );
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
  const [pdf1, setPdf1] = useState<File | null>(null);
  const [pdf2, setPdf2] = useState<File | null>(null);

  const handleFileChange =
      (setFile: (file: File | null) => void) =>
        (event: ChangeEvent<HTMLInputElement>) => {
          setFile(event.target.files?.[0] ?? null);
        };

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
      <PdfPreview label="Libretto" file={pdf1} onChange={handleFileChange(setPdf1)} color="primary" />
      <PdfPreview label="Score" file={pdf2} onChange={handleFileChange(setPdf2)} color="secondary" />
    </Box>
  );
}
