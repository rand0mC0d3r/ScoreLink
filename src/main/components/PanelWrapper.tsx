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
        p: 2,
        overflow: 'auto',
        bgcolor: theme => alpha(theme.palette[color].main, 0.15),
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography component="h2" variant="h6">
          {label}
        </Typography>
        {file && (
          <Typography noWrap color="text.secondary" variant="body2" title={file.name}>
            {file.name}
          </Typography>
        )}
        {tools}
      </Box>
      {children}
    </Paper>
  );
}
