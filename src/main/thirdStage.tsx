import { useSettingsStoreSelector } from '@/context/settingsStore';
import PanelWrapper from '@/main/components/PanelWrapper';
import { Box, Typography } from '@mui/material';

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

function ScorePdfPreview({ label, file, pages: storedPages, color }: PdfPreviewProps) {

  return (<>
    <PanelWrapper
      label={label}
      file={file}
      color={color}
      sx={{flex: color === 'secondary' ? 2 : 0.5 }}
    >
      {(storedPages.length > 0) && (
        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: 'column' }}>
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
    </PanelWrapper>
  </>);
}

function LibrettoPdfPreview({ label, file, pages: storedPages, color }: PdfPreviewProps) {

  return (<>
    <PanelWrapper
      label={label}
      file={file}
      color={color}
      sx={{flex: color === 'secondary' ? 2 : 0.5 }}
    >
      {(storedPages.length > 0) && (
        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: 'column' }}>
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
    </PanelWrapper>
  </>);
}


export default function ThirdStage() {
  const scorePDF = useSettingsStoreSelector((s) => s.scorePDF)
  const librettoPDF = useSettingsStoreSelector((s) => s.librettoPDF)
  const scorePages = useSettingsStoreSelector((s) => s.scorePages)
  const librettoPages = useSettingsStoreSelector((s) => s.librettoPages)

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>

      <ScorePdfPreview
        label="Score"
        file={scorePDF ?? null}
        pages={scorePages}
        color="secondary"
      />
      <LibrettoPdfPreview
        label="Libretto"
        file={librettoPDF ?? null}
        pages={librettoPages}
        color="primary"
      />
    </Box>
  );
}
