import { useSettingsStoreSelector } from '@/context/settingsStore';
import PanelWrapper from '@/main/components/PanelWrapper';
import ScorePage from '@/main/components/ScorePage';
import { Box } from '@mui/material';

export default function ScorePicker() {
  const scorePDF = useSettingsStoreSelector((s) => s.scorePDF)
  const scorePages = useSettingsStoreSelector((s) => s.scorePages)

  return (<>
    <PanelWrapper
      label="Score"
      file={scorePDF ?? null}
      color="secondary"
      sx={{ flex: 1.25 }}
    >
      {(scorePages.length > 0) && (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          {(scorePages)
            .slice(0, 15)
            .map((page) => (
              <ScorePage
                key={page.pageNumber}
                label="Score"
                page={page}
                scale={1}
              />
            ))}
        </Box>
      )}
    </PanelWrapper>
  </>);
}
