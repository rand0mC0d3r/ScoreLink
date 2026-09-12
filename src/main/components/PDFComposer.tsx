import { getReflowPreviewSegments, useSettingsStoreSelector } from '@/context/settingsStore';
import PanelWrapper from '@/main/components/PanelWrapper';
import { Alert, Box, CircularProgress } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import { useEffect, useState } from 'react';

type SourcePage = {
  pageNumber: number;
  widthPx: number;
  heightPx: number;
};

const pointsFromPixels = (pixels: number) => pixels * 72 / 96;
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

async function composePdf(
  scorePDF: File,
  librettoPDF: File | undefined,
  scorePages: SourcePage[],
  librettoPages: SourcePage[],
) {
  const scoreSource = await PDFDocument.load(await scorePDF.arrayBuffer());
  const librettoSource = librettoPDF
    ? await PDFDocument.load(await librettoPDF.arrayBuffer())
    : undefined;
  const output = await PDFDocument.create();
  let outputPage: ReturnType<typeof output.addPage> | undefined;
  let cursorY = 0;

  const startNewPage = () => {
    outputPage = output.addPage([A4_WIDTH, A4_HEIGHT]);
    cursorY = A4_HEIGHT;
  };

  for (const scorePage of scorePages) {
    const segments = getReflowPreviewSegments(scorePage.pageNumber);

    if (
      segments.length === 1
      && segments[0].type === 'score'
      && segments[0].cropStart === 0
      && segments[0].cropEnd === 100
    ) {
      outputPage = undefined;
      const [originalPage] = await output.copyPages(scoreSource, [scorePage.pageNumber - 1]);
      output.addPage(originalPage);
      continue;
    }

    for (const segment of segments) {
      const sourcePage = segment.type === 'score'
        ? scorePage
        : librettoPages.find((page) => page.pageNumber === segment.sourcePageNumber);
      const sourceDocument = segment.type === 'score' ? scoreSource : librettoSource;

      if (!sourcePage || !sourceDocument || segment.cropStart === undefined || segment.cropEnd === undefined) {
        continue;
      }

      const sourcePdfPage = sourceDocument.getPage(sourcePage.pageNumber - 1);
      const sourceWidth = pointsFromPixels(sourcePage.widthPx);
      const sourceHeight = pointsFromPixels(sourcePage.heightPx);
      let cropTop = sourceHeight * (1 - segment.cropStart / 100);
      const segmentBottom = sourceHeight * (1 - segment.cropEnd / 100);

      while (cropTop - segmentBottom > 0) {
        if (!outputPage || cursorY <= 0) startNewPage();

        const availableHeight = cursorY;
        const remainingHeight = (cropTop - segmentBottom) * A4_WIDTH / sourceWidth;
        const drawnHeight = Math.min(availableHeight, remainingHeight);
        const sourceChunkHeight = drawnHeight * sourceWidth / A4_WIDTH;
        const cropBottom = Math.max(segmentBottom, cropTop - sourceChunkHeight);
        const embedded = await output.embedPage(sourcePdfPage, {
          left: 0,
          bottom: cropBottom,
          right: sourceWidth,
          top: cropTop,
        });

        cursorY -= drawnHeight;
        outputPage.drawPage(embedded, {
          x: 0,
          y: cursorY,
          width: A4_WIDTH,
          height: drawnHeight,
        });
        cropTop = cropBottom;

        if (cursorY <= 0) {
          outputPage = undefined;
          cursorY = 0;
        }
      }
    }
  }

  return output.save();
}

export default function PDFComposer() {
  const scorePDF = useSettingsStoreSelector((s) => s.scorePDF)
  const librettoPDF = useSettingsStoreSelector((s) => s.librettoPDF)
  const scorePages = useSettingsStoreSelector((s) => s.scorePages)
  const librettoPages = useSettingsStoreSelector((s) => s.librettoPages)
  const [composedPdfUrl, setComposedPdfUrl] = useState<string>();
  const [composeError, setComposeError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let nextUrl: string | undefined;

    if (!scorePDF || scorePages.length === 0) {
      setComposedPdfUrl(undefined);
      return;
    }

    setComposeError(false);
    void composePdf(scorePDF, librettoPDF, scorePages, librettoPages)
      .then((bytes) => {
        if (cancelled) return;
        nextUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        setComposedPdfUrl(nextUrl);
      })
      .catch(() => {
        if (!cancelled) setComposeError(true);
      });

    return () => {
      cancelled = true;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [librettoPDF, librettoPages, scorePDF, scorePages]);

  return (<>
    <PanelWrapper
      label="Composer"
      file={scorePDF ?? null}
      color="secondary"
      sx={{ flex: 0.6 }}
    >
      {composedPdfUrl && (
        <Box
          component="iframe"
          title="Composed score PDF"
          src={`${composedPdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
          sx={{ width: '100%', minHeight: 920, border: 0, backgroundColor: 'background.default' }}
        />
      )}
      {!composedPdfUrl && !composeError && scorePages.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {composeError && <Alert severity="error">The composed PDF could not be created.</Alert>}
      {/* {scorePages.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', mt: 2 }}>
          {scorePages.slice(0, 15).map((page) => (
            <ComposePDFPage
              key={page.pageNumber}
              pageNumber={page.pageNumber}
              previewWidth={288}
            />
          ))}
        </Box>
      )} */}
    </PanelWrapper>
  </>);
}
