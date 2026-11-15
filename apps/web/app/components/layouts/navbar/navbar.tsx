'use client';

import { AppBar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';

import { SettingsOutlined } from '@mui/icons-material';
import { ThemeSwitcher } from '@/app/hooks/theme-switcher';
import { AuthenticatedUser } from '@shared/index';
import { componentStyles } from '@/app/styles/components';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onSettingsClick: () => void;
  user?: AuthenticatedUser | null;
  onProfileClick?: () => void;
}

export function Navbar({ onSettingsClick, user }: NavbarProps) {
  const navigate = useNavigate();

  const navigateLogin = () => navigate('/login');
  // const navigateProfile = () => navigate('/profile');
  // const getInitials = (name: string) =>
  //   name
  //     .trim()
  //     .split(/\s+/)
  //     .map((part) => part[0])
  //     .slice(0, 2)
  //     .join('')
  //     .toUpperCase();

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
              {/* <Tooltip title={user.firstName}>
                <Button onClick={navigateProfile}
                >
                  <Avatar
                    src={''}
                    alt={'user.firtName'}
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(user.firstName)}
                  </Avatar> 
                </Button>
              </Tooltip> */}
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
