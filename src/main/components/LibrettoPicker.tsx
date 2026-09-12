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
