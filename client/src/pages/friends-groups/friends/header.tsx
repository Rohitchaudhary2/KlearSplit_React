import { ArrowBack, MoreVert } from "@mui/icons-material"
import { Avatar, Box, FormControl, IconButton, ListItemAvatar, Menu, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material"
import { useState } from "react";
import ViewExpenses from "./viewExpenses";
import Settlement from "./settlement";
import { Friend } from "./index.model";
import axiosInstance from "../../../utils/axiosInterceptor";
import { API_URLS } from "../../../constants/apiUrls";
import { toast } from "sonner";

const Header: React.FC<{friend: Friend, handleViewChange: (view: "All" | "Messages" | "Expenses") => void, view: string}> = ({friend, handleViewChange, view}) => {
  const isBlock = friend.block_status === "BOTH" || (friend.block_status === "friend1" && friend.status === "SENDER") || (friend.block_status === "friend2" && friend.status === "RECEIVER")
  const [blockStatus, setBlockStatus] = useState(isBlock ? "Unblock" : "Block");
  const isArchived = friend.archival_status === "BOTH" || (friend.archival_status === "friend1" && friend.status === "SENDER") || (friend.archival_status === "friend2" && friend.status === "RECEIVER")
  const [archiveStatus, setArchiveStatus] = useState(isArchived ? "Unarchive" : "Archive");
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
  const viewChange = (e: SelectChangeEvent) => handleViewChange(e.target.value as "All" | "Messages" | "Expenses");
  const viewExpenses = () => {
    setViewExpensesOpen(true);
  }
  const archive = async() => {
    const res = await axiosInstance.patch(`${API_URLS.archiveBlockRequest}/${friend.conversation_id}`, { type: "archived"}, {withCredentials: true})
    if (res.data.success) {
      toast.success(`${archiveStatus}d successfully`);
      setArchiveStatus(() => archiveStatus === "Archive" ? "Unarchive" : "Archive");
    }
  }
  const block = async() => {
    const res = await axiosInstance.patch(`${API_URLS.archiveBlockRequest}/${friend.conversation_id}`, { type: "blocked"}, {withCredentials: true})
    if (res.data.success) {
      toast.success(`${blockStatus}ed successfully`);
      setBlockStatus(() => blockStatus === "Block" ? "Unblock" : "Block");
    }
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
        <Typography variant="h6" textAlign="center">{friend.friend.first_name} {friend.friend.last_name}</Typography>
      </Box>
      <div>
        <Box className="flex gap-2">
          <FormControl fullWidth size="small">
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={view}
              onChange={viewChange}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Messages">Messages</MenuItem>
              <MenuItem value="Expenses">Expenses</MenuItem>
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
            {archiveStatus}
          </MenuItem>
          <MenuItem onClick={block}>
            {blockStatus}
          </MenuItem>
        </Menu>
      </div>
    </Box>
    </>
  )
}

export default Header