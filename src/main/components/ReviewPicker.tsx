import SolidChip from '@/components/SolidChip';
import { useSettingsStoreSelector } from '@/context/settingsStore';
import PanelWrapper from '@/main/components/PanelWrapper';
import ReviewPage from '@/main/components/ReviewPage';
import { Box } from '@mui/material';

export default function ReviewPicker() {
  const scorePDF = useSettingsStoreSelector((s) => s.scorePDF)
  const scorePages = useSettingsStoreSelector((s) => s.scorePages)
  const activePage = useSettingsStoreSelector((s) => s.activePage)

  return (<>
    <PanelWrapper
      label="Review"
      file={scorePDF ?? null}
      color="secondary"
      tools={<SolidChip label={activePage === undefined ? '' : `Page ${activePage}`} variant="header" />}
      sx={{ flex: 1 }}
    >
      {(scorePages.length > 0) && (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          {(scorePages)
            .slice(0, 15)
            .map((page) => (
              <ReviewPage
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
