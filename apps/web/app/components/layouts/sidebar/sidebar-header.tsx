'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { ViewSidebarOutlined } from '@mui/icons-material';
import { componentStyles } from '@/app/styles/components';

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarHeader({ collapsed, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <Box
      sx={{
        height: 64,
        minHeight: 64,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {!collapsed && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            A
          </Box>

          <Typography variant="h6">Apulse</Typography>
        </Box>
      )}

      <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <IconButton
          size="small"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ViewSidebarOutlined sx={componentStyles.actionButton} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
