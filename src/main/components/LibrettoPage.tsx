import SolidChip from '@/components/SolidChip';
import { useSettings, useSettingsStoreSelector } from '@/context/settingsStore';
import { Box, Button, IconButton, Slider, Tooltip, Typography } from '@mui/material';
import { RotateCcw, Save, ToggleLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';

export type ExtractedPage = {
  pageNumber: number;
  url: string;
  sizeKb: number;
  widthPx: number;
  heightPx: number;
};

const EMPTY_SAVED_SELECTIONS: [number, number][] = [];

export default function LibrettoPage({ label, page, scale = 1 }: { label: string; page: ExtractedPage; scale: number }) {
  const { setSetting } = useSettings();
  const activePage = useSettingsStoreSelector((settings) => settings.activePage);
  const activePageScrollPosition = useSettingsStoreSelector((settings) => settings.activePageScrollPosition);
  const [selection, setSelection] = useState<[number, number]>([20, 80]);
  const savedSelections = useSettingsStoreSelector((settings) => settings.librettoPageSelections[page.pageNumber] ?? EMPTY_SAVED_SELECTIONS);
  const [disabled, setDisabled] = useState(true);
  const pageWidth = page.widthPx / scale;
  const pageHeight = page.heightPx / scale;
  const dummyWidth = 88;
  const dummyHeight = pageHeight * dummyWidth / pageWidth;

  const saveSelection = () => {
    setSetting((settings) => ({
      ...settings,
      librettoPageSelections: {
        ...settings.librettoPageSelections,
        [page.pageNumber]: [...(settings.librettoPageSelections[page.pageNumber] ?? []), selection],
      },
    }));
  };

  const addReflowSelection = (librettoSelection: [number, number]) => {
    if (activePage === undefined) return;

    setSetting((settings) => ({
      ...settings,
      librettoReflowSelections: [
        ...settings.librettoReflowSelections,
        {
          type: 'librettoSection',
          scorePageNumber: activePage,
          scoreScrollPosition: activePageScrollPosition,
          librettoPageNumber: page.pageNumber,
          librettoSelection,
        },
      ],
    }));
  };

  const deleteSelection = (index: number) => {
    setSetting((settings) => {
      const pageSelections = [...(settings.librettoPageSelections[page.pageNumber] ?? [])];
      pageSelections.splice(index, 1);

      const librettoPageSelections = { ...settings.librettoPageSelections };
      if (pageSelections.length > 0) {
        librettoPageSelections[page.pageNumber] = pageSelections;
      } else {
        delete librettoPageSelections[page.pageNumber];
      }

      return { ...settings, librettoPageSelections };
    });
  };

  const renderSelectionOverlay = (selected: [number, number]) => (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: `${100 - selected[1]}%`,
        right: 0,
        left: 0,
        height: `${selected[1] - selected[0]}%`,
        backgroundColor: 'primary.main',
        opacity: 0.42,
      }}
    />
  );

  const renderSummarySelectionOverlay = () => (
    <>
      {savedSelections.map((savedSelection, index) => (
        <Box
          key={`${savedSelection[0]}-${savedSelection[1]}-${index}`}
          aria-hidden
          sx={{
            position: 'absolute',
            top: `${100 - savedSelection[1]}%`,
            right: 0,
            left: 0,
            height: `${savedSelection[1] - savedSelection[0]}%`,
            backgroundColor: 'primary.main',
            opacity: 0.1,
          }}
        />
      ))}
    </>
  );

  return (
    <Box
      key={page.pageNumber}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minWidth: 0,
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2,
        mb: 2,
      }}
    >

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1 }}>
            <Box sx={{ position: 'relative', width: pageWidth, height: pageHeight }}>
              <Box
                component="iframe"
                title={`${label} page ${page.pageNumber}`}
                src={`${page.url}#toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
                sx={{ display: 'block', width: '100%', height: '100%', border: 0, backgroundColor: 'background.default' }}
              />
              {!disabled && (
                <Box sx={{ pointerEvents: 'none' }}>
                  {renderSelectionOverlay(selection)}
                </Box>
              )}
              <Box sx={{ pointerEvents: 'none' }}>
                {renderSummarySelectionOverlay()}
              </Box>
            </Box>
            <Slider
              aria-label={`Selected area for page ${page.pageNumber}`}
              orientation="vertical"
              value={selection}
              disabled={disabled}
              min={0}
              max={100}
              onChange={(_, value) => {
                if (Array.isArray(value)) setSelection([value[0], value[1]]);
              }}
              sx={{ height: pageHeight, py: 0 }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, alignItems: 'center' }}>
            <SolidChip label={`${page.pageNumber}.`} fontSize={15} minWidth={50} height={30} variant="header" />
            <Button
              aria-label={`Save selection for page ${page.pageNumber}`}
              onClick={saveSelection}
              disabled={disabled}
              startIcon={<Save size={16} />}
              size="small"
              variant="outlined"
            >
            Save area
            </Button>
            <Button
              aria-label={`Enable / Disable selection for page ${page.pageNumber}`}
              onClick={() => setDisabled(!disabled)}
              startIcon={<ToggleLeft size={16} />}
              size="small"
              variant="outlined"
            >
            Enable / Disable area
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 1, width: 200 }}>
          {savedSelections?.map((savedSelection, index) => (
            <Box key={`${savedSelection[0]}-${savedSelection[1]}-${index}`}>
              <Typography variant="caption" color="text.secondary">Saved {index + 1}</Typography>
              <Box
                aria-label={`Saved selection ${index + 1} for page ${page.pageNumber}`}
                sx={{
                  position: 'relative',
                  width: dummyWidth,
                  height: dummyHeight,
                  border: 1,
                  borderRadius: 2,
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              >
                {renderSelectionOverlay(savedSelection)}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.25 }}>
                <Tooltip title="Load selection">
                  <IconButton
                    aria-label={`Load saved selection ${index + 1} for page ${page.pageNumber}`}
                    size="small"
                    onClick={() => setSelection([savedSelection[0], savedSelection[1]])}
                  >
                    <RotateCcw size={14} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete selection">
                  <IconButton
                    aria-label={`Delete saved selection ${index + 1} for page ${page.pageNumber}`}
                    size="small"
                    onClick={() => deleteSelection(index)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add selection">
                  <span>
                    <IconButton
                      aria-label={`Add saved selection ${index + 1} for page ${page.pageNumber}`}
                      size="small"
                      onClick={() => addReflowSelection(savedSelection)}
                      disabled={activePage === undefined}
                    >
                      <Save size={14} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
