import SolidChip from '@/components/SolidChip';
import { alpha, Box, Paper, Typography } from '@mui/material';

type PanelWrapperProps = {
  label: string;
  file: File | null;
  color: 'primary' | 'secondary';
  children: React.ReactNode;
  tools?: React.ReactNode;
  sx?: Record<string, any>;
};

export default function PanelWrapper({ label, file, color, children, tools, sx }: PanelWrapperProps) {

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        flex: 1,
        minWidth: 0,
        flexDirection: 'column',
        gap: 1.5,
        p: 2.5,
        borderRadius: 4,
        boxShadow: 2,
        overflow: 'auto',
        bgcolor: theme => alpha(theme.palette[color].main, 0.1),
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography component="h2" variant="h6" color="textPrimary">
          {label}
        </Typography>
        {file && (
          <SolidChip
            fontSize={14}
            height={28}
            minWidth={300}
            label={file.name}
            variant="header"
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
          {tools}
        </Box>
      </Box>
      <Box sx={{ overflow: 'auto' }}>
        {children}
      </Box>
    </Paper>
  );
}
