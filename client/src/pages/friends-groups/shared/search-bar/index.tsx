import { Group, PersonAdd, Search } from "@mui/icons-material";
import { Paper } from "@mui/material";
import React, { useState } from "react";
import AddFriend from "../../friends/addFriend";
import CreateGroup from "../../groups/createGroup";

const SearchBar: React.FC<{ placeholder: string; }> = ({ placeholder }) => {
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const handleAddFriendClose = () => setAddFriendOpen(false);
  const handleCreateGroupClose = () => setCreateGroupOpen(false);

    return (
        <>
        <AddFriend open={addFriendOpen} handleAddFriendClose={handleAddFriendClose}/>
        <CreateGroup open={createGroupOpen} handleClose={handleCreateGroupClose}/>
            <div className="flex justify-between items-center gap-3">
                <Paper elevation={5}>
                <div className="flex justify-between items-center shadow px-3 py-2 bg-white rounded-lg">
                    <input
                        type="text"
                        placeholder={placeholder}
                        className="w-full outline-none bg-transparent"
                    />
                    <button type="submit" className="text-gray-600 hover:text-blue-600 hover:cursor-pointer">
                        <Search />
                    </button>
                </div>
                </Paper>

                <div>
                    <Paper elevation={5}>
                    <button
                        className="shadow bg-white hover:cursor-pointer text-white-800 px-3 py-2 rounded"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        onClick={() => {
                            placeholder === "Search using group name..." ? setCreateGroupOpen(true) : setAddFriendOpen(true)
                        }}
                    >
                        {placeholder === "Search using group name..." ? <Group/> : <PersonAdd />}
                    </button>
                    </Paper>
                </div>
            </div>

        </>

    )
}

export default SearchBar