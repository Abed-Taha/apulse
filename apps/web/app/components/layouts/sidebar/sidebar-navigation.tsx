'use client';

import { List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';

import {
  DashboardOutlined,
  PeopleOutlined,
  Inventory2Outlined,
  ShoppingCartOutlined,
  BarChartOutlined,
} from '@mui/icons-material';

import { useLocation, useNavigate } from 'react-router-dom';
import { componentStyles } from '@/app/styles/components';

const iconMap = {
  dashboard: DashboardOutlined,
  users: PeopleOutlined,
  package: Inventory2Outlined,
  'shopping-cart': ShoppingCartOutlined,
  chart: BarChartOutlined,
};

interface SidebarNavigationProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

type SidebarIcon = 'dashboard' | 'users' | 'package' | 'shopping-cart' | 'chart';

interface SidebarNavigationItem {
  label: string;
  path: string;
  icon: SidebarIcon;
}

export const sidebarNavigation: SidebarNavigationItem[] = [
  { label: 'test', path: '/test', icon: 'dashboard' },
];

export function SidebarNavigation({ collapsed, onNavigate }: SidebarNavigationProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <List sx={{ px: 1, py: 2 }}>
      {sidebarNavigation.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const active = pathname === item.path;

        return (
          <Tooltip
            key={item.path}
            title={collapsed ? item.label : ''}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItemButton
              selected={active}
              onClick={() => {
                navigate(item.path);
                onNavigate?.();
              }}
              sx={{
                minHeight: 44,
                justifyContent: collapsed ? 'center' : 'initial',
                px: collapsed ? 1 : 2,
                mb: 0.5,
                borderRadius: 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: 'center',
                }}
              >
                <Icon sx={componentStyles.actionButton} />
              </ListItemIcon>

              {!collapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          </Tooltip>
        );
      })}
    </List>
  );
}
