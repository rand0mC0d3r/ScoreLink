import SolidChip from '@/components/SolidChip';
import { useSettingsStoreSelector } from '@/context/settingsStore';
import LibrettoPage from '@/main/components/LibrettoPage';
import PanelWrapper from '@/main/components/PanelWrapper';
import { Box } from '@mui/material';



export default function LibrettoPicker() {
  const librettoPDF = useSettingsStoreSelector((s) => s.librettoPDF)
  const librettoPages = useSettingsStoreSelector((s) => s.librettoPages)

  return (<>
    <PanelWrapper
      label="Libretto"
      tools={<>
        <SolidChip label={librettoPages.length > 0 ? `${librettoPages.length} pages` : ''} variant="header" />
      </>}
      file={librettoPDF ?? null}
      color="primary"
      sx={{flex: 0.55, minWidth: '720px', alignItems: 'stretch', justifyContent: 'stretch'}}
    >
      {(librettoPages.length > 0) && (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', flex: 1, width: '100%' }}>
          {(librettoPages)
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
