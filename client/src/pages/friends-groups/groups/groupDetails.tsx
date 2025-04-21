import { Box, Button, Divider, Typography } from "@mui/material"
import { GroupData, GroupMemberData } from "./index.model"
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import Avatar from "@mui/joy/Avatar/Avatar";
import { Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreateGroup from "./createGroup";
import Settlement from "./settlement";
import { toast } from "sonner";
import axiosInstance from "../../../utils/axiosInterceptor";
import { API_URLS } from "../../../constants/apiUrls";

interface GroupDetailsProps {
    handleGroupDetailsClose: () => void,
    group: GroupData,
    groupMembers: GroupMemberData[],
    currentMember: GroupMemberData,
}

const GroupDetails: React.FC<GroupDetailsProps> = ({ handleGroupDetailsClose, group, groupMembers, currentMember }) => {
    const user = useSelector((store: RootState) => store.auth.user);
    const [open, setOpen] = useState(false);
    const [groupData, setGroupData] = useState<GroupData>(group);
    const [settlementOpen, setSettlementOpen] = useState(false);
    const [settlementAmount, setSettlementAmount] = useState(0);
    const [payer, setPayer] = useState<GroupMemberData>();
    const [debtor, setDebtor] = useState<GroupMemberData>();
    useEffect(() => {
        if (payer) {
            setSettlementOpen(true);
        }
    }, [payer])
    const handleUpdateGroup = (updatedGroup: GroupData) => {
        setGroupData((prev) => ({ ...prev, ...updatedGroup }));
        setOpen(false);
    }
    const handleSettlementSubmit = async (settlementAmount: number) => {
        try {
            const res = await axiosInstance.post(
                `${API_URLS.addGroupSettlements}/${group.group_id}`,
                {
                    payer_id: payer?.group_membership_id,
                    debtor_id: debtor?.group_membership_id,
                    settlement_amount: settlementAmount
                }
            );

            console.log(res.data.data);
        } catch (error) {
            toast.error("Failed to add group settlement, please try again later");
        }
        handleSettlementClose();
    }
    const handleSettlementClose = () => {
        setPayer(undefined);
        setDebtor(undefined);
        setSettlementOpen(false);
    }
    const handleSettlementOpen = (member: GroupMemberData) => {
        setSettlementAmount(Math.abs(parseFloat(member.balance_with_user)));
        if (parseFloat(member.balance_with_user) == 0) {
            toast.warning("You are all settled up!")
        } else if (parseFloat(member.balance_with_user) < 0) {
            setPayer(member);
            setDebtor(currentMember);
        } else {
            setPayer(currentMember);
            setDebtor(member);
        }
    }
    const handleClose = () => setOpen(false);
    return (
        <>
            {
                open &&
                <CreateGroup
                    open={open}
                    group={groupData}
                    handleClose={handleClose}
                    handleUpdateGroup={handleUpdateGroup}
                />
            }
            {
                settlementOpen &&
                <Settlement
                    handleSettlementClose={handleSettlementClose}
                    handleSettlement={handleSettlementSubmit}
                    settlement_amount={settlementAmount}
                    open={settlementOpen}
                    payer={payer!}
                    debtor={debtor!}
                />
            }
            <Box className="flex flex-col h-[84vh]">
                <Box className="flex flex-wrap gap-2 justify-between content-center items-center p-3">
                    <Box className="flex gap-2 max-w-[45vw]">
                        <Avatar alt="Remy Sharp" src={groupData.image_url ?? "/static/images/avatar/1.jpg"} sx={{ width: 80, height: 80 }} />
                        <Box className="grow">
                            <Typography variant="h6">{groupData.group_name} <Edit className="cursor-pointer" onClick={() => setOpen(true)} /></Typography>
                            <Typography variant="body2">{groupData.group_description}</Typography>
                        </Box>
                    </Box>
                    <Box className="flex gap-2">
                        <Typography variant="h5">Your Balance: </Typography>
                        <Typography variant="h5" sx={{ color: parseFloat(groupData.balance_amount) < 0 ? 'red' : 'green' }}>{Math.abs(parseFloat(groupData.balance_amount))}</Typography>
                    </Box>
                </Box>
                <Divider />
                <Box className="grow overflow-y-auto">
                    <table className="table-auto w-full border-collapse table-hover table-bordered bg-[white]">
                        <thead style={{ borderBottom: "2px solid black" }} className="bg-[white] text-black sticky top-0 z-10 p-0 m-0">
                            <tr className="text-center">
                                <th className="px-2 py-1 text-sm text-left">Member</th>
                                <th className="px-2 py-1 text-sm">Role</th>
                                <th className="px-2 py-1 text-sm">Balance with You</th>
                                <th className="px-2 py-1 text-sm">Balance in Group</th>
                                <th className="px-2 py-1 text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                groupMembers.map((member) => (
                                    <tr key={member.group_membership_id} className="text-center text-sm max-w-[13vw] break-words">
                                        <td className="px-2 self-start py-1">
                                            <Box className="flex gap-2 content-center items-center">
                                                <Avatar alt="Remy Sharp" src={member.image_url ?? "/static/images/avatar/1.jpg"} sx={{ width: 32, height: 32 }} />
                                                {member.first_name} {member.last_name}
                                            </Box>
                                        </td>

                                        {/* Expense Name */}
                                        <td className="px-2 py-1">
                                            {member.role}
                                        </td>

                                        {/* Total Amount */}
                                        <td className="px-2 py-1" style={{ color: parseFloat(member.balance_with_user) > 0 ? 'red' : 'green' }}>
                                            {Math.abs(parseFloat(member.balance_with_user))}
                                        </td>

                                        {/* Payer Name */}
                                        <td className="px-2 py-1" style={{ color: parseFloat(member.total_balance) < 0 ? 'red' : 'green' }}>
                                            {Math.abs(parseFloat(member.total_balance))}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-2 py-1 flex justify-center items-center space-x-2">
                                            <Button variant="outlined" size="small" onClick={() => handleSettlementOpen(member)}>Settle</Button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </Box>
                <Divider />
                <Box className="flex justify-end gap-2 items-center py-2 px-3">
                    {/* <Button onClick={downloadExpenses}>
                    <Download />
                </Button> */}
                    <Button variant="contained" onClick={handleGroupDetailsClose}>
                        Close
                    </Button>
                </Box>
            </Box>
            {/* <Button variant="contained" onClick={handleGroupDetailsClose}>Close</Button> */}
        </>
    )
}

export default GroupDetails