import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import { Box, Button, Paper, Typography } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
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

function PdfPreview({ label, file, onChange }: PdfPreviewProps) {
  const previewUrl = usePdfPreviewUrl(file);
  const [pages, setPages] = useState<ExtractedPage[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  useEffect(() => {
    return () => pages.forEach((page) => URL.revokeObjectURL(page.url));
  }, [pages]);

  const clearPages = () => {
    setPages([]);
    setExtractionError(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearPages();
    onChange(event);
  };

  const handleExtract = async () => {
    if (!file) return;

    clearPages();
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const extractedPages = await extractPdfPages(file);
      setPages(extractedPages);
    } catch {
      setExtractionError('This file could not be read as a PDF.');
    } finally {
      setIsExtracting(false);
    }
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
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography component="h2" variant="h6">
          {label}
        </Typography>
        <Button component="label" variant="contained">
          Upload PDF
          <input hidden type="file" accept="application/pdf,.pdf" onChange={handleFileChange} />
        </Button>
      </Box>

      {previewUrl ? (
        <Box
          component="iframe"
          title={`${label} preview`}
          src={previewUrl}
          sx={{ width: '100%', minHeight: 560, flex: 1, border: 0, backgroundColor: 'background.default' }}
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, borderTop: 1, borderColor: 'divider', pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography component="h3" variant="subtitle1">
            Extracted pages
          </Typography>
          <Button variant="outlined" disabled={!file || isExtracting} onClick={handleExtract}>
            {isExtracting ? 'Extracting...' : 'Extract PDF'}
          </Button>
        </Box>

        {extractionError && <Typography color="error" variant="body2">{extractionError}</Typography>}

        {pages.length > 0 && (
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>
            {pages
              .filter((_, i) => i < 5) // Example filter: only include even-indexed pages
              .map((page) => (
                <Box
                  key={page.pageNumber}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                    minWidth: 0,
                    p: 1,
                    border: 1,
                    borderColor: 'divider',
                    backgroundColor: 'background.default',
                  }}
                >
                  <Typography variant="body2">Page {page.pageNumber}</Typography>
                  <Box
                    component="iframe"
                    title={`${label} page ${page.pageNumber}`}
                    src={`${page.url}#toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
                    sx={{ width: '100%', height: 360, border: 0, backgroundColor: 'common.white' }}
                  />
                </Box>
              ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

async function extractPdfPages(file: File): Promise<ExtractedPage[]> {
  const sourceDocument = await PDFDocument.load(await file.arrayBuffer());
  const pages: ExtractedPage[] = [];

  try {
    for (const [pageNumber] of sourceDocument.getPages().entries()) {
      const pageDocument = await PDFDocument.create();
      const [page] = await pageDocument.copyPages(sourceDocument, [pageNumber]);
      pageDocument.addPage(page);
      const bytes = await pageDocument.save();

      pages.push({
        pageNumber: pageNumber + 1,
        url: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })),
      });
    }
  } catch (error) {
    pages.forEach((page) => URL.revokeObjectURL(page.url));
    throw error;
  }

  return pages;
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

export default function SecondStage() {
  const { setSetting } = useSettings()
  const scorePDF = useSettingsStoreSelector((s) => s.scorePDF)
  const librettoPDF = useSettingsStoreSelector((s) => s.librettoPDF)

  const handleScoreChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSetting(prev => ({ ...prev, scorePDF: event.target.files?.[0] ?? undefined }));
  };

  const handleLibrettoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSetting(prev => ({ ...prev, librettoPDF: event.target.files?.[0] ?? undefined }));
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
      <PdfPreview label="Libretto" file={librettoPDF ?? null} onChange={handleLibrettoChange} color="primary" />
      <PdfPreview label="Score" file={scorePDF ?? null} onChange={handleScoreChange} color="secondary" />
    </Box>
  );
}
