import { motion } from "framer-motion";
import { ModalDialog } from "@mui/joy";
import {
  Modal,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Button,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useCallback, useState } from "react";
import debounce from "../../../utils/debounce";
import { SelectableUser, SearchedUser } from "./index.model";
import { Close } from "@mui/icons-material";
import { API_URLS } from "../../../constants/apiUrls";
import axiosInstance from "../../../utils/axiosInterceptor";

interface Props {
  open: boolean;
  handleClose: () => void;
  selectedMembers: SelectableUser[];
  onSave: (members: SelectableUser[]) => void;
}

const SelectMembersDialog: React.FC<Props> = ({
  open,
  handleClose,
  selectedMembers,
  onSave,
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [members, setMembers] = useState<SelectableUser[]>(selectedMembers);

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) return setSearchResults([]);
      setLoading(true);
      try {
        const results = await axiosInstance.get(`${API_URLS.getUsers}/${q}`, { params: { fetchAll: true } });
        setSearchResults(results.data.data);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedSearch(val);
  };

  const handleSelectUser = (user: SearchedUser) => {
    if (members.find((m) => m.email === user.email)) return;
    setMembers([...members, { ...user, role: "member" }]);
    setQuery("");
    setSearchResults([]);
  };

  const updateRole = (email: string, role: string) => {
    setMembers(
      members.map((m) =>
        m.email === email
          ? { ...m, role: role as "member" | "admin" | "coadmin" }
          : m
      )
    );
  };

  const removeUser = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
  };

  const handleSave = () => {
    onSave(members);
    setMembers([]);
    setQuery("");
    setSearchResults([]);
    setLoading(false);
    handleClose();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <motion.div
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: 300, opacity: 1 }}
          exit={{ x: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            height: "100%",
            width: "100%",
            zIndex: 9,
          }}
        >
          <ModalDialog
            layout="center"
            sx={{
              backgroundColor: "white",
              position: "fixed",
              top: "10",
              // minHeight: "50%",
              minWidth: "25%",
              maxWidth: "600px",
              padding: 0,
              border: "none",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              zIndex: 9,
            }}
          >
            <DialogTitle className="bg-blue-600 text-white text-center text-lg">
              Select Members
            </DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Search Users"
                value={query}
                onChange={handleSearchChange}
                margin="dense"
              />
              <div className="max-h-40 overflow-y-auto mt-2 bg-gray-100 rounded-md p-2">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <CircularProgress size={24} />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user, idx) => (
                    <div
                      key={idx}
                      className="p-2 hover:bg-gray-200 cursor-pointer rounded"
                      onClick={() => handleSelectUser(user)}
                    >
                      {user.first_name} {user.last_name} ({user.email})
                    </div>
                  ))
                ) : (
                  <div
                    className="p-2 hover:bg-gray-200 cursor-pointer rounded"
                  >No Data Found</div>
                )}
              </div>

              <h3 className="text-center mt-4">Selected Members</h3>
              <div className="max-h-40 overflow-y-auto mt-2 space-y-2">
                {members.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start border p-2 rounded-md"
                  >
                    <div className="flex-1">
                      <div>
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-gray-600 text-sm">
                        ({user.email})
                      </div>
                    </div>
                    <TextField
                      select
                      size="small"
                      label="Role"
                      value={user.role}
                      onChange={(e) => updateRole(user.email, e.target.value)}
                    >
                      <MenuItem value="member">Member</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="coadmin">Co-admin</MenuItem>
                    </TextField>
                    <IconButton
                      onClick={() => removeUser(user.email)}
                      className="ml-2"
                      size="small"
                    >
                      <Close className="text-red-500"/>
                    </IconButton>
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="error">
                Cancel
              </Button>
              <Button onClick={handleSave} variant="contained">
                Add
              </Button>
            </DialogActions>
          </ModalDialog>
        </motion.div>
      </Modal>
    </>
  );
};

export default SelectMembersDialog;