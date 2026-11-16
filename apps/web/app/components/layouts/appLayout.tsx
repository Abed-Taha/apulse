'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

import { Navbar } from './navbar/navbar';
import { Sidebar } from './sidebar/sidebar';

import type { Workspace } from './sidebar/sidebar.types';
import { useAuth } from '@/context/AuthContext';

export function AppLayout({ sideBarOpen = true }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Populate these from the authenticated user's accessible workspaces.
  const [workspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>();

  const handleWorkspaceChange = (workspace: Workspace) => {
    setSelectedWorkspaceId(workspace.id);

    // Later: update the active workspace in your workspace context/API.
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {sideBarOpen && (
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceChange={handleWorkspaceChange}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <AppNavbar />

        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

function AppNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Navbar
      onSettingsClick={() => navigate('/settings')}
      user={user}
      onProfileClick={() => navigate('/profile')}
    />
  );
}
