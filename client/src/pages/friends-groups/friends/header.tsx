import { ArrowBack, MoreVert } from "@mui/icons-material"
import { Avatar, Box, FormControl, IconButton, ListItemAvatar, Menu, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material"
import { useState } from "react";
import { toast } from "sonner";
import ViewExpenses from "./viewExpenses";
import Settlement from "./settlement";

const Header = () => {
  const [view, setView] = useState("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [viewExpensesOpen, setViewExpensesOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const settlement = () => {
    setSettlementOpen(true);
  }
  const handleSettlementClose = () => setSettlementOpen(false);
  const handleViewChange = (e: SelectChangeEvent) => setView(e.target.value);
  const viewExpenses = () => {
    setViewExpensesOpen(true);
  }
  const archive = () => {
    console.log("archive");
  }
  const block = () => {
    console.log("block");
  }
  const handleViewExpensesClose = () => setViewExpensesOpen(false);
  return (
    <>
    <Settlement open={settlementOpen} handleSettlementClose={handleSettlementClose}/>
    <Box className="flex justify-between p-2 content-center">
      <ViewExpenses open={viewExpensesOpen} handleViewExpensesClose={handleViewExpensesClose}/>
      <Box className="flex justify-between gap-2 items-center">
        <ArrowBack />
        <ListItemAvatar sx={{ minWidth: 32 }}>
          <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
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
          <MenuItem onClick={settlement}>
            Settle up
          </MenuItem>
          <MenuItem onClick={viewExpenses}>
            View Expenses
          </MenuItem>
          <MenuItem onClick={archive}>
            Archive
          </MenuItem>
          <MenuItem onClick={block}>
            Block
          </MenuItem>
        </Menu>
      </div>
    </Box>
    </>
  )
}

export default Header