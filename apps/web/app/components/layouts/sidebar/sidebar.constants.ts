import {
  AnalyticsOutlined,
  CategoryOutlined,
  DashboardOutlined,
  GroupsOutlined,
  Inventory2Outlined,
  LocalOfferOutlined,
  PeopleAltOutlined,
  RequestQuoteOutlined,
  SettingsOutlined,
  ShoppingCartOutlined,
} from '@mui/icons-material';

import type { SidebarNavGroup } from './sidebar.types';

export const SIDEBAR_NAVIGATION: SidebarNavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: DashboardOutlined,
      },
    ],
  },
  {
    label: 'Sales',
    items: [
      {
        label: 'Deals',
        path: '/deals',
        icon: LocalOfferOutlined,
      },
      {
        label: 'Quotes',
        path: '/quotes',
        icon: RequestQuoteOutlined,
      },
      {
        label: 'Orders',
        path: '/orders',
        icon: ShoppingCartOutlined,
      },
    ],
  },
  {
    label: 'Catalog',
    items: [
      {
        label: 'Products',
        path: '/products',
        icon: Inventory2Outlined,
      },
      {
        label: 'Categories',
        path: '/categories',
        icon: CategoryOutlined,
      },
    ],
  },
  {
    label: 'Customers',
    items: [
      {
        label: 'Customers',
        path: '/customers',
        icon: PeopleAltOutlined,
      },
      {
        label: 'Users',
        path: '/users',
        icon: GroupsOutlined,
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        label: 'Analytics',
        path: '/analytics',
        icon: AnalyticsOutlined,
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Settings',
        path: '/settings',
        icon: SettingsOutlined,
      },
    ],
  },
];
