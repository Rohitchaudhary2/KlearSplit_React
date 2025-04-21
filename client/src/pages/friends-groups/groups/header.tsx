import { ArrowBack, MoreVert } from "@mui/icons-material"
import { Avatar, Box, FormControl, IconButton, ListItemAvatar, Menu, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material"
import { useState } from "react";
import ViewExpenses from "./viewExpenses";
import { AddMemberResponse, GroupData, GroupExpenseData, GroupExpenseResponse, GroupMemberData } from "./index.model";
import axiosInstance from "../../../utils/axiosInterceptor";
import { API_URLS } from "../../../constants/apiUrls";
import { toast } from "sonner";
import SelectMembersDialog from "./selectMembers";

const Header: React.FC<{
  handleAddGroupMembers: (members: AddMemberResponse["data"]) => void,
  handleLeaveGroup: (id: string) => void,
  handleUpdateExpense: (expenseData: GroupExpenseResponse["data"], previousExpenseData: GroupExpenseData) => void,
  handleDeleteExpense: (expenseData: GroupExpenseData) => void,
  group: GroupData, currentMember: GroupMemberData, groupMembers: GroupMemberData[], handleGroupDetailsOpen: () => void, handleBackButton: () => void, handleViewChange: (view: "All" | "Messages" | "Expenses") => void, view: string
}> = ({
  handleAddGroupMembers, handleLeaveGroup, handleUpdateExpense, handleDeleteExpense, group, currentMember, groupMembers, handleGroupDetailsOpen, handleBackButton, handleViewChange, view }) => {
    const [blockStatus, setBlockStatus] = useState(group.has_blocked ? "Unblock" : "Block");
    const [archivalStatus, setArchivalStatus] = useState(group.has_archived ? "Unarchive" : "Archive")
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [addMembersOpen, setAddMembersOpen] = useState(false);
    const open = Boolean(anchorEl);
    const [viewExpensesOpen, setViewExpensesOpen] = useState(false);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    const viewChange = (e: SelectChangeEvent) => handleViewChange(e.target.value as "All" | "Messages" | "Expenses");
    const viewExpenses = () => {
      setViewExpensesOpen(true);
    }
    const block = async () => {
      try {
        if (+group.balance_amount !== 0) {
          toast.warning("Settle up before this action")
          return;
        }
        await axiosInstance.patch(
          `${API_URLS.updateGroupMember}/${group.group_id}`,
          { has_blocked: !group.has_blocked },
          { withCredentials: true }
        );

        toast.success(`${blockStatus}ed successfully`);
        setBlockStatus(() => (blockStatus === "Block" ? "Unblock" : "Block"));
      } catch (error) {
        toast.error("Failed to update block status, please try again later");
      }
    }
    const archive = async () => {
      try {
        if (+group.balance_amount !== 0) {
          toast.warning("Settle up before this action")
          return;
        }
        await axiosInstance.patch(
          `${API_URLS.updateGroupMember}/${group.group_id}`,
          { has_archived: !group.has_archived },
          { withCredentials: true }
        );

        toast.success(`${archivalStatus}ed successfully`);
        setArchivalStatus(() => (archivalStatus === "Archive" ? "Unarchive" : "Archive"));
      } catch (error) {
        toast.error("Failed to update archival status, please try again later");
      }
    }
    const handleViewExpensesClose = () => setViewExpensesOpen(false);
    const onLeaveGroup = () => {
      handleLeaveGroup(group.group_id)
    }
    return (
      <>
        {/* <Settlement handleSettlement={addSettlement} selectedGroup={group} open={settlementOpen} handleSettlementClose={handleSettlementClose}/> */}
        <Box className="flex justify-between p-2 content-center">
          {
            viewExpensesOpen &&
            <ViewExpenses handleUpdateExpense={handleUpdateExpense} handleDeleteExpense={handleDeleteExpense} currentMember={currentMember} groupMembers={groupMembers} group={group} open={viewExpensesOpen} handleViewExpensesClose={handleViewExpensesClose} />
          }
          {
            addMembersOpen &&
            <SelectMembersDialog
              open={addMembersOpen}
              handleClose={() => setAddMembersOpen(false)}
              groupId={group.group_id}
              handleAddMembers={handleAddGroupMembers}
            />
          }
          <Box className="flex justify-between gap-2 items-center">
            <ArrowBack className="cursor-pointer" onClick={handleBackButton} />
            <ListItemAvatar sx={{ minWidth: 32 }}>
              <Avatar alt="Avatar" src={group.image_url ?? "assets/image.png"} sx={{ width: 40, height: 40 }} />
            </ListItemAvatar>
            <Typography className="cursor-pointer" onClick={handleGroupDetailsOpen} variant="h6" textAlign="center">{group.group_name}</Typography>
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
              <MenuItem onClick={handleGroupDetailsOpen}>
                Group Details
              </MenuItem>
              <MenuItem onClick={() => setAddMembersOpen(true)}>
                Add Members
              </MenuItem>
              <MenuItem onClick={handleGroupDetailsOpen}>
                Settle Up
              </MenuItem>
              <MenuItem onClick={viewExpenses}>
                View Expenses
              </MenuItem>
              <MenuItem onClick={block}>
                {blockStatus}
              </MenuItem>
              <MenuItem onClick={archive}>
                {archivalStatus}
              </MenuItem>
              <MenuItem onClick={onLeaveGroup}>
                Exit Group
              </MenuItem>
            </Menu>
          </div>
        </Box>
      </>
    )
  }

export default Header