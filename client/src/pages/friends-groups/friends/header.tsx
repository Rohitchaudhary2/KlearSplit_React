import { ArrowBack, MoreVert } from "@mui/icons-material"
import { Avatar, Box, FormControl, IconButton, ListItemAvatar, Menu, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material"
import { useState } from "react";
import ViewExpenses from "./viewExpenses";
import Settlement from "./settlement";
import { Expense, Friend } from "./index.model";
import { toast } from "sonner";
import { onAcceptRejectRequest } from "./services";

const Header: React.FC<{ friend: Friend, handleUpdateExpense: (expense: Expense) => void, handleDeleteExpense: (expense: Expense) => void, handleSelectFriend: (friend: Friend | undefined) => void, handleViewChange: (view: "All" | "Messages" | "Expenses") => void, handleSettlement: (settlementAmount: number) => void, view: string }> = ({ friend, handleUpdateExpense, handleDeleteExpense, handleSelectFriend, handleViewChange, handleSettlement, view }) => {
  const isBlock = friend.block_status === "BOTH" || (friend.block_status === "FRIEND1" && friend.status === "SENDER") || (friend.block_status === "FRIEND2" && friend.status === "RECEIVER")
  const [blockStatus, setBlockStatus] = useState(isBlock ? "Unblock" : "Block");
  const isArchived = friend.archival_status === "BOTH" || (friend.archival_status === "FRIEND1" && friend.status === "SENDER") || (friend.archival_status === "FRIEND2" && friend.status === "RECEIVER")
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
    if (parseFloat(friend.balance_amount) === 0) {
      toast.info("You are all settled up!");
      return;
    }
    setSettlementOpen(true);
  }
  const handleSettlementClose = () => setSettlementOpen(false);
  const viewChange = (e: SelectChangeEvent) => handleViewChange(e.target.value as "All" | "Messages" | "Expenses");
  const viewExpenses = () => {
    setViewExpensesOpen(true);
  }
  const archive = async () => {
    try {
      if(+friend.balance_amount !== 0) {
        toast.warning("Settle up before this action")
        return;
      }
      await onAcceptRejectRequest("archived", friend.conversation_id)

      toast.success(`${archiveStatus}d successfully`);
      setArchiveStatus(() => archiveStatus === "Archive" ? "Unarchive" : "Archive");
    } catch (error) {
      toast.error(`Failed to ${archiveStatus.toLowerCase()}, please try again later`);
    }
  }
  const block = async () => {
    try {
      if(+friend.balance_amount !== 0) {
        toast.warning("Settle up before this action")
        return;
      }
      await onAcceptRejectRequest("blocked", friend.conversation_id)

      toast.success(`${blockStatus}ed successfully`);
      setBlockStatus(() => blockStatus === "Block" ? "Unblock" : "Block");
    } catch (error) {
      toast.error(`Failed to ${blockStatus.toLowerCase()}, please try again later`);
    }

  }
  const handleViewExpensesClose = () => setViewExpensesOpen(false);
  const addSettlement = (settlementAmount: number) => {
    handleSettlement(settlementAmount)
  }
  return (
    <>
      <Settlement handleSettlement={addSettlement} selectedFriend={friend} open={settlementOpen} handleSettlementClose={handleSettlementClose} />
      <Box className="flex justify-between p-2 content-center">
        <ViewExpenses handleUpdateExpense={handleUpdateExpense} handleDeleteExpense={handleDeleteExpense} friend={friend} open={viewExpensesOpen} handleViewExpensesClose={handleViewExpensesClose} />
        <Box className="flex justify-between gap-2 items-center">
          <ArrowBack className="cursor-pointer" onClick={() => handleSelectFriend(undefined)} />
          <ListItemAvatar sx={{ minWidth: 32 }}>
            <Avatar alt="Avatar" src={friend.friend.image_url ?? `assets/image.png`} sx={{ width: 40, height: 40 }} />
          </ListItemAvatar>
          <Typography variant="h6" textAlign="center">{friend.friend.first_name} {friend.friend.last_name ?? ''}</Typography>
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