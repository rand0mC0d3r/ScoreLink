import SolidChip from '@/components/SolidChip';
import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import PanelWrapper from '@/main/components/PanelWrapper';
import PDFPreviewPage, { type ExtractedPage } from '@/main/components/PDFPreviewPage';
import { Box } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import { useEffect, useRef } from 'react';

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
      tools={<SolidChip label={storedPages.length > 0 ? `${storedPages.length} pages` : ''} variant="header" />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {(storedPages.length > 0) && (
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', lg: 'repeat(auto-fill, minmax(450px, 1fr))' } }}>
            {(storedPages)
              .slice(0, 15)
              .map((page) => (
                <PDFPreviewPage
                  key={page.pageNumber}
                  label={label}
                  page={page}
                  scale={2}
                />
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
      const { width, height } = page.getSize();

      pages.push({
        pageNumber: pageNumber + 1,
        sizeKb: bytes.byteLength / 1024,
        widthPx: Math.round(width * 96 / 72),
        heightPx: Math.round(height * 96 / 72),
        url: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })),
      });
    }
  } catch (error) {
    pages.forEach((page) => URL.revokeObjectURL(page.url));
    throw error;
  }

  return pages;
}

const getFileSource = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

export default function SecondStage() {
  const { setSetting } = useSettings()
  const scorePDF = useSettingsStoreSelector((s) => s.scorePDF)
  const librettoPDF = useSettingsStoreSelector((s) => s.librettoPDF)
  const scorePages = useSettingsStoreSelector((s) => s.scorePages)
  const librettoPages = useSettingsStoreSelector((s) => s.librettoPages)
  const scorePagesSource = useSettingsStoreSelector((s) => s.scorePagesSource)
  const librettoPagesSource = useSettingsStoreSelector((s) => s.librettoPagesSource)
  const cachedPagesRef = useRef({ scorePages, librettoPages, scorePagesSource, librettoPagesSource });

  useEffect(() => {
    cachedPagesRef.current = { scorePages, librettoPages, scorePagesSource, librettoPagesSource };
  }, [scorePages, librettoPages, scorePagesSource, librettoPagesSource]);

  useEffect(() => {
    let cancelled = false;

    const extractOrCached = async (
      file: File | undefined,
      cachedPages: ExtractedPage[],
      cachedSource: string | undefined,
    ): Promise<{ pages: ExtractedPage[]; created: boolean }> => {
      if (!file) return { pages: [], created: false };

      if (cachedPages.length > 0 && cachedSource === getFileSource(file)) {
        return { pages: cachedPages, created: false };
      }

      try {
        return { pages: await extractPdfPages(file), created: true };
      } catch {
        return { pages: [], created: false };
      }
    };

    const { scorePages: cachedScorePages, librettoPages: cachedLibrettoPages, scorePagesSource: cachedScoreSource, librettoPagesSource: cachedLibrettoSource } = cachedPagesRef.current;

    void Promise.all([
      extractOrCached(librettoPDF, cachedLibrettoPages, cachedLibrettoSource),
      extractOrCached(scorePDF, cachedScorePages, cachedScoreSource),
    ]).then(([librettoResult, scoreResult]) => {
      if (cancelled) {
        if (librettoResult.created) librettoResult.pages.forEach((page) => URL.revokeObjectURL(page.url));
        if (scoreResult.created) scoreResult.pages.forEach((page) => URL.revokeObjectURL(page.url));
        return;
      }

      setSetting(prev => ({
        ...prev,
        librettoPages: librettoResult.pages,
        scorePages: scoreResult.pages,
        librettoPagesSource: librettoPDF ? getFileSource(librettoPDF) : undefined,
        scorePagesSource: scorePDF ? getFileSource(scorePDF) : undefined,
      }));
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
