import { useSettingsStoreSelector } from '@/context/settingsStore';
import ComposePDFPage from '@/main/components/ComposePDFPage';
import PanelWrapper from '@/main/components/PanelWrapper';
import { Box } from '@mui/material';

export default function PDFComposer() {
  const scorePDF = useSettingsStoreSelector((s) => s.scorePDF)
  const scorePages = useSettingsStoreSelector((s) => s.scorePages)

  return (<>
    <PanelWrapper
      label="Composer"
      file={scorePDF ?? null}
      color="secondary"
      sx={{ flex: 1 }}
    >
      {(scorePages.length > 0) && (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          {(scorePages)
            .slice(0, 15)
            .map((page) => (
              <ComposePDFPage
                key={page.pageNumber}
                pageNumber={page.pageNumber}
                previewWidth={288}
              />
            ))}
        </Box>
      )}
    </PanelWrapper>
  </>);
}
