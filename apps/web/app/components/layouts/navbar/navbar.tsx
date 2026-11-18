'use client';

import { AppBar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';

import { SettingsOutlined } from '@mui/icons-material';
import { ThemeSwitcher } from '@/app/hooks/theme-switcher';
import { AuthenticatedUser } from '@shared/index';
import { componentStyles } from '@/app/styles/components';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '@/app/hooks/useLogout';
import { AvatarProfile } from '../../ui/avatarProfile';

interface NavbarProps {
  onSettingsClick: () => void;
  user?: AuthenticatedUser | null;
  onProfileClick?: () => void;
}

export function Navbar({ onSettingsClick, user }: NavbarProps) {
  const navigate = useNavigate();

  const navigateProfile = () => navigate('/profile');
  const navigateLogin = () => navigate('/login');

  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  return (
    <AppBar position="static" elevation={0} color="transparent" sx={componentStyles.navbar}>
      <Toolbar disableGutters sx={componentStyles.navbarToolbar}>
        {/* Branding */}
        <Typography component="a" href="/" variant="h6" sx={componentStyles.navbarBrand}>
          Apulse
        </Typography>

        {/* Actions */}
        <Box sx={componentStyles.alignCenter}>
          <ThemeSwitcher />

          {user ? (
            <>
              <Tooltip title="Settings">
                <IconButton
                  onClick={onSettingsClick}
                  sx={componentStyles.actionButton}
                  aria-label="Settings"
                  size="medium"
                >
                  <SettingsOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title={user.name}>
                <Button onClick={navigateProfile}>
                  <AvatarProfile imageKey={user.avatar} name={user.name} />
                </Button>
              </Tooltip>
              <Button onClick={() => logout()} disabled={isLoggingOut}>
                {isLoggingOut ? 'Signing out...' : 'Logout'}
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={navigateLogin}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
