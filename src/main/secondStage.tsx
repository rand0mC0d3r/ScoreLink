import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import PanelWrapper from '@/main/components/PanelWrapper';
import { Box, Typography } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import { useEffect } from 'react';

type ExtractedPage = {
  pageNumber: number;
  url: string;
};

type PdfPreviewProps = {
  label: string;
  file: File | null;
  pages: ExtractedPage[];
  color: 'primary' | 'secondary';
};

function PdfPreview({ label, file, pages: storedPages, color }: PdfPreviewProps) {

  return (<>
    <PanelWrapper
      label={label}
      file={file}
      color={color}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {(storedPages.length > 0) && (
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>
            {(storedPages)
              .slice(0, 5)
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
                    sx={{ width: '100%', height: 750, border: 0, backgroundColor: 'common.white' }}
                  />
                </Box>
              ))}
          </Box>
        )}
      </Box>
    </PanelWrapper>
  </>);
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

export default function SecondStage() {
  const { setSetting } = useSettings()
  const scorePDF = useSettingsStoreSelector((s) => s.scorePDF)
  const librettoPDF = useSettingsStoreSelector((s) => s.librettoPDF)
  const scorePages = useSettingsStoreSelector((s) => s.scorePages)
  const librettoPages = useSettingsStoreSelector((s) => s.librettoPages)

  useEffect(() => {
    let cancelled = false;

    const extractOrEmpty = async (file: File | undefined) => {
      if (!file) return [];

      try {
        return await extractPdfPages(file);
      } catch {
        return [];
      }
    };

    void Promise.all([extractOrEmpty(librettoPDF), extractOrEmpty(scorePDF)]).then(([librettoPages, scorePages]) => {
      if (cancelled) {
        [...librettoPages, ...scorePages].forEach((page) => URL.revokeObjectURL(page.url));
        return;
      }

      setSetting(prev => ({ ...prev, librettoPages, scorePages }));
    });

    return () => {
      cancelled = true;
    };
  }, [librettoPDF, scorePDF, setSetting]);

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
      <PdfPreview
        label="Score"
        file={scorePDF ?? null}
        pages={scorePages}
        color="secondary"
      />
      <PdfPreview
        label="Libretto"
        file={librettoPDF ?? null}
        pages={librettoPages}
        color="primary"
      />

    </Box>
  );
}
