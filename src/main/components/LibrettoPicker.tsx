import { useSettingsStoreSelector } from '@/context/settingsStore';
import LibrettoPage from '@/main/components/LibrettoPage';
import PanelWrapper from '@/main/components/PanelWrapper';
import PDFPreviewPage, { type ExtractedPage } from '@/main/components/PDFPreviewPage';
import { Box } from '@mui/material';

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
            .slice(0, 15)
            .map((page) => (
              <PDFPreviewPage
                key={page.pageNumber}
                label={label}
                page={page}
                scale={1}
              />
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
    </PanelWrapper>
  </>);
}


export default function LibrettoPicker() {
  const librettoPDF = useSettingsStoreSelector((s) => s.librettoPDF)
  const librettoPages = useSettingsStoreSelector((s) => s.librettoPages)

  return (<>
    <PanelWrapper
      label="Libretto"
      file={librettoPDF ?? null}
      color="primary"
      sx={{flex: 0.5 }}
    >
      {(librettoPages.length > 0) && (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          {(librettoPages)
            .slice(0, 15)
            .map((page) => (
              <LibrettoPage
                key={page.pageNumber}
                label="Libretto"
                page={page}
                scale={2}
              />
            ))}
        </Box>
      )}
    </PanelWrapper>
  </>);
}
