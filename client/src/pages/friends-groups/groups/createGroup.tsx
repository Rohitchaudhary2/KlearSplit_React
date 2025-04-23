import { ModalDialog } from "@mui/joy";
import {
    Modal,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    IconButton,
    SvgIcon,
    styled,
} from "@mui/material";
import Button from '@mui/joy/Button';
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Close } from "@mui/icons-material";
import SelectMembersDialog from "./selectMembers";
// import { createGroup } from "./services";
import { toast } from "sonner";
import { GroupData, SelectableUser } from "./index.model";
import CustomDialog from "../../../components/base/customModal";
import { onCreateGroup, onUpdateGroup } from "./services";

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

interface CreateGroupProps {
    open: boolean;
    handleCreateGroup?: (group: GroupData) => void;
    handleClose: () => void;
    group?: GroupData;
    handleUpdateGroup?: (group: GroupData) => void;
    setGroups?: React.Dispatch<React.SetStateAction<GroupData[]>>;
}

const CreateGroup: React.FC<CreateGroupProps> = ({
    open,
    group,
    handleCreateGroup,
    handleUpdateGroup,
    handleClose,
    setGroups,
}) => {
    const [membersDialogOpen, setMembersDialogOpen] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<SelectableUser[]>([]); // where MemberWithRole = User & { role: string }
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    useEffect(() => {
        if (group) {
            setGroupName(group.group_name);
            setGroupDescription(group.group_description);
        }
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImage(file);
    };

    const handleRemoveImage = () => {
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleAddMembers = () => {
        // open members dialog logic
        setMembersDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!groupName.trim()) return;
        // submit logic here
        const formData = new FormData();
        const groupDetails = handleGroupDetails();
        const membersData = handleMembersData();
        formData.append("group", JSON.stringify(groupDetails));
        formData.append("membersData", JSON.stringify(membersData));
        if (image) formData.append("image", image);
        if (group) {
            const formData = new FormData();
            formData.append("group_name", groupName as string);
            formData.append("group_description", groupDescription as string);
            if (image) formData.append("image", image);
            const res = await onUpdateGroup(formData, group.group_id)
            if (!res) return;
            handleUpdateGroup!(res.data.data);
            toast.success("Group Updated successfully!")
            handleClose()
            return;
        }
        const res = await onCreateGroup(formData);
        if (!res) return;
        const groupRes = res.data.data
        toast.success("Group created successfully");
        handleCreateGroup!({
            ...groupRes,
            status: "ACCEPTED",
            role: "CREATOR",
            has_archived: false,
            has_blocked: false,
            balance_amount: "0",
        } as GroupData)
        if (setGroups) {
            setGroups((prevGroups) => [
                {
                    ...groupRes,
                    status: "ACCEPTED",
                    role: "CREATOR",
                    has_archived: false,
                    has_blocked: false,
                    balance_amount: "0",
                } as GroupData,
                ...prevGroups,
            ]);
        }
        handleClose();
        // Reset state after submission
        setGroupName("");
        setGroupDescription("");
        setSelectedMembers([]);
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        // Close the dialog
        handleClose();
    };

    const handleGroupDetails = () => {
        const group = {
            group_name: groupName,
            group_description: groupDescription || "",
        };
        return cleanObject(group);
    };

    const handleMembersData = () => {
        const membersData = {
            members: selectedMembers.map((user) => user.user_id),
            admins: selectedMembers
                .filter((user) => user.role === "admin")
                .map((user) => user.user_id),
            coadmins: selectedMembers
                .filter((user) => user.role === "coadmin")
                .map((user) => user.user_id),
        };
        return cleanObject(membersData);
    };

    const cleanObject = (obj: Record<string, any>) => {
        return Object.fromEntries(
            Object.entries(obj).filter(
                ([_, value]) =>
                    value !== null &&
                    value !== undefined &&
                    !(typeof value === "string" && value.trim() === "") &&
                    !(Array.isArray(value) && value.length === 0)
            )
        );
    };

    const onCloseMembersDialog = () => {
        setMembersDialogOpen(false);
        setSelectedMembers([]);
        setGroupName("");
        setGroupDescription("");
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onClose = () => {
        setDialogOpen(true);
    };
    const handleConfirmDialogClose = (value: boolean) => {
        setDialogOpen(false);
        if (value) {
            setDialogOpen(false);
            handleClose();
            onCloseMembersDialog();
        }
    }

    return (
        <>
            <CustomDialog
                open={dialogOpen}
                onClose={(value: boolean) => handleConfirmDialogClose(value)}
                title="Confirmation"
                message={`Are you sure to cancel creating group? All the data entered will be lost.`}
            />
            <Modal open={open} onClose={handleClose}>
                <motion.div
                    initial={{ x: 0 }}
                    animate={membersDialogOpen ? { x: -200 } : { x: 0 }} // Slide to the left when second modal opens
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                        height: "100%",
                        zIndex: 10,
                    }}
                >
                    <ModalDialog
                        sx={{
                            backgroundColor: "white",
                            position: "fixed",
                            top: "10",
                            minWidth: "35%",
                            padding: 0,
                            border: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: 0,
                            zIndex: 10,
                        }}
                    >
                        <DialogTitle className="bg-[#3674B5] text-center text-white" sx={{ borderRadius: "7px 7px 0px 0px" }}>
                            Create Group
                        </DialogTitle>
                        <DialogContent className="flex flex-col gap-4 pt-4">
                            <TextField
                                required
                                label="Group Name"
                                margin="dense"
                                fullWidth
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                onBlur={() => setGroupName(groupName.trim())}
                            />
                            <TextField
                                label="Group Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={groupDescription}
                                onChange={(e) => setGroupDescription(e.target.value)}
                                onBlur={() => setGroupDescription(groupDescription.trim())}
                            />

                            <Button
                                component="label"
                                role={undefined}
                                tabIndex={-1}
                                variant="outlined"
                                color="neutral"
                                startDecorator={
                                    <SvgIcon>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                            />
                                        </svg>
                                    </SvgIcon>
                                }
                            >
                                {image ? image.name : "Upload Group Image"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                />
                                <VisuallyHiddenInput type="file" />
                            </Button>
                            <div className="flex flex-col items-center gap-2">
                                {image && (
                                    <Tooltip title="Remove Image" placement="top">
                                        <IconButton
                                            onClick={handleRemoveImage}
                                            color="error"
                                            size="small"
                                        >
                                            <Close />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                            {
                                !group &&
                                <>
                                    <Button
                                        variant="solid"
                                        color="primary"
                                        fullWidth
                                        onClick={handleAddMembers}
                                    >
                                        Add Members
                                    </Button>

                                    {selectedMembers.length > 0 && (
                                        <div className="mt-4 max-h-40 overflow-y-auto bg-gray-50 rounded p-2 text-sm">
                                            {selectedMembers.map((user, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between border-b py-1"
                                                >
                                                    <span>
                                                        {user.first_name} {user.last_name ?? ''}
                                                    </span>
                                                    <span className="text-gray-500">{user.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button type="submit" onClick={handleSubmit}>
                                Submit
                            </Button>
                        </DialogActions>
                    </ModalDialog>
                </motion.div>
            </Modal>

            <SelectMembersDialog
                open={membersDialogOpen}
                handleClose={() => setMembersDialogOpen(false)}
                selectedMembers={selectedMembers}
                onSave={setSelectedMembers}
            />
        </>
    );
};

export default CreateGroup;