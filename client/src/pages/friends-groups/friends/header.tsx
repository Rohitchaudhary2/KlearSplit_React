import { ArrowBack, MoreVert } from "@mui/icons-material"
import { Avatar, Box, FormControl, IconButton, ListItemAvatar, Menu, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material"
import { useState } from "react";

const Header = () => {
    const options = [
        'None',
        'Atria',
        'Callisto',
        'Dione',
        'Ganymede',
        'Hangouts Call',
        'Luna',
        'Oberon',
        'Phobos',
        'Pyxis',
        'Umbriel',
      ];
      const [view, setView] = useState("All");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleViewChange = (e: SelectChangeEvent) => setView(e.target.value);
  return (
    <Box className="flex justify-between p-2 content-center">
        <Box className="flex justify-between gap-2 items-center">
            <ArrowBack/>
            <ListItemAvatar sx={{minWidth: 32 }}>
                            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 32,  height: 32 }} />
                          </ListItemAvatar>
            <Typography variant="h6" textAlign="center">Rohit Chaudhary</Typography>
        </Box>
        <div>
      <Box className="flex gap-2">
      <FormControl fullWidth size="small">
        <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={view}
            onChange={handleViewChange}
        >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Messages">Messages</MenuItem>
            <MenuItem value="expenses">Expenses</MenuItem>
        </Select>
        </FormControl>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      </Box>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options.map((option) => (
          <MenuItem key={option} selected={option === 'Pyxis'} onClick={handleClose}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
    </Box>
  )
}

export default Header