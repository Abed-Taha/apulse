import type { SvgIconComponent } from '@mui/icons-material';

export interface SidebarNavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
}

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  workspaces: Workspace[];
  selectedWorkspaceId?: string;
  onWorkspaceChange: (workspace: Workspace) => void;
}
