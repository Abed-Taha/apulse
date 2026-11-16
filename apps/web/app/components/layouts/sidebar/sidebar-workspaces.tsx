'use client';

import { useState } from 'react';

import {
  Box,
  ButtonBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';

import { Check, ExpandMore, WorkspacesOutlined } from '@mui/icons-material';

import type { Workspace } from './sidebar.types';

interface SidebarWorkspacesProps {
  collapsed: boolean;
  workspaces: Workspace[];
  selectedWorkspaceId?: string;
  onWorkspaceChange: (workspace: Workspace) => void;
}

export function SidebarWorkspaces({
  collapsed,
  workspaces,
  selectedWorkspaceId,
  onWorkspaceChange,
}: SidebarWorkspacesProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);

  const hasWorkspaces = workspaces.length > 0;
  const menuOpen = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (workspace: Workspace) => {
    onWorkspaceChange(workspace);
    handleClose();
  };

  return (
    <Box
      sx={{
        px: collapsed ? 1 : 2,
        py: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {!collapsed && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 1, px: 1 }}
        >
          WORKSPACES
        </Typography>
      )}

      {!hasWorkspaces ? (
        <Tooltip title="No workspaces available" placement="right">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 1.5,
              px: collapsed ? 0 : 1.5,
              py: 1.25,
              color: 'text.disabled',
            }}
          >
            <WorkspacesOutlined fontSize="small" />

            {!collapsed && <Typography variant="body2">No workspaces available</Typography>}
          </Box>
        </Tooltip>
      ) : (
        <>
          <Tooltip
            title={collapsed ? (selectedWorkspace?.name ?? 'Select workspace') : ''}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ButtonBase
              onClick={handleOpen}
              aria-label="Select workspace"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              sx={{
                width: '100%',
                minHeight: 44,
                display: 'flex',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 1.5,
                px: collapsed ? 0 : 1.5,
                py: 1,
                borderRadius: 1.5,
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <WorkspacesOutlined color="action" />

              {!collapsed && (
                <>
                  <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <Typography variant="body2" noWrap>
                      {selectedWorkspace?.name ?? 'Select workspace'}
                    </Typography>

                    {selectedWorkspace?.description && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {selectedWorkspace.description}
                      </Typography>
                    )}
                  </Box>

                  <ExpandMore fontSize="small" />
                </>
              )}
            </ButtonBase>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: collapsed ? 'right' : 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 220,
                  maxWidth: 280,
                },
              },
            }}
          >
            {workspaces.map((workspace) => {
              const isSelected = workspace.id === selectedWorkspaceId;

              return (
                <MenuItem
                  key={workspace.id}
                  selected={isSelected}
                  onClick={() => handleSelect(workspace)}
                >
                  <ListItemIcon>
                    {isSelected ? (
                      <Check fontSize="small" color="primary" />
                    ) : (
                      <WorkspacesOutlined fontSize="small" />
                    )}
                  </ListItemIcon>

                  <ListItemText
                    primary={workspace.name}
                    secondary={workspace.description}
                    slotProps={{
                      primary: { noWrap: true },
                      secondary: { noWrap: true },
                    }}
                  />
                </MenuItem>
              );
            })}
          </Menu>
        </>
      )}
    </Box>
  );
}
