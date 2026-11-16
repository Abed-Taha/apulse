'use client';

import { Drawer, useMediaQuery, useTheme } from '@mui/material';

import { SidebarHeader } from './sidebar-header';
import { SidebarNavigation } from './sidebar-navigation';

import type { SidebarProps } from './sidebar.types';
import { SidebarWorkspaces } from './sidebar-workspaces';

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  workspaces,
  selectedWorkspaceId,
  onWorkspaceChange,
}: SidebarProps) {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const drawerContent = (
    <>
      <SidebarHeader collapsed={collapsed} onToggleCollapse={onToggleCollapse} />

      <SidebarNavigation collapsed={collapsed} onNavigate={isMobile ? onMobileClose : undefined} />

      <SidebarWorkspaces
        collapsed={collapsed}
        workspaces={workspaces}
        selectedWorkspaceId={selectedWorkspaceId}
        onWorkspaceChange={onWorkspaceChange}
      />
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: 'relative',
              height: '100%',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: EXPANDED_WIDTH,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
