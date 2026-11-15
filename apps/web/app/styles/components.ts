export const componentStyles = {
  navbar: {
    bgcolor: 'background.paper',
    color: 'text.primary',
    borderBottom: 1,
    borderColor: 'divider',
    maxWidth: '90%',
    borderRadius: 2,
    margin: '15px auto',
  },
  navbarToolbar: {
    minHeight: 64,
    px: { xs: 2, sm: 3 },
    display: 'flex',
    justifyContent: 'space-between',
  },
  navbarBrand: {
    color: 'text.primary',
    fontWeight: 700,
    letterSpacing: '-0.4px',
    textDecoration: 'none',
  },
  alignCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  actionButton: {
    color: 'text.secondary',
  },
} as const;
