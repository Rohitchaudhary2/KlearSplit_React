import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { API_URLS } from '../../constants/apiUrls';
import axiosInstance from '../../utils/axiosInterceptor';
import { RootState } from '../../store';

const pages = ["dashboard", 'friends', 'groups'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((store: RootState) => store.auth.user);
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async() => {
    const res = await axiosInstance.get(API_URLS.logout, {withCredentials: true});
    if(!res) {
      return;
    }
    dispatch(logout());
  }

  return (
    <>
        <AppBar position="sticky" 
    sx={{
        background: 'rgba(54, 116, 181)'
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/dashboard"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            KLEARSPLIT
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} component={Link}
                to={'/' + page.toLowerCase()} onClick={handleCloseNavMenu}>
                  <Typography sx={{ textAlign: 'center' }}>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/dashboard"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            KLEARSPLIT
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap:1 }}>
            {pages.map((page) => (
              <Button
              variant="text"
                key={page}
                component={Link}
                to={'/' + page.toLowerCase()}
                onClick={handleCloseNavMenu}
                // sx={{ my: 2, color: 'white', display: 'block' }}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  fontWeight: location.pathname.startsWith('/' + page.toLowerCase()) ? '700' : '400',
                  borderColor: 'rgba(255, 255, 255, 0.7)', // white with opacity
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 1)', // stronger on hover
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', // optional light background on hover
                  },
                  ...(location.pathname.startsWith('/' + page.toLowerCase()) && {
                    borderColor: 'rgba(255, 255, 255, 1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }),
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Profile Settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Avatar" src={user?.image_url ?? "assets/image.png"} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <Link to="/profile" ><Typography sx={{ textAlign: 'center' }}>Profile</Typography></Link>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <div onClick={handleLogout} ><Typography sx={{ textAlign: 'center' }}>Logout</Typography></div>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
    <Outlet />
    </>
  );
}
export default ResponsiveAppBar;