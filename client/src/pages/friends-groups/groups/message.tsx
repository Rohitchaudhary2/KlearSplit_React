import { ListItemAvatar, Avatar } from "@mui/material";
import React from "react";

const MessageItem: React.FC<{
  message: {
    text: string;
    createdAt: string
  };
  isCurrentUser: boolean;
  name: string;
  imageUrl: string;
  currentUserImageUrl: string
}> = ({ message, isCurrentUser, name, imageUrl, currentUserImageUrl }) => {
  return (
    <li className={`flex mb-1 px-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar for Other Users */}
      {!isCurrentUser && (
        // <img
        //   src={imageUrl || "/profile.png"}
        //   alt="avatar"
        //   className="rounded-full inline-flex self-end mr-3 shadow-md"
        //   width="32"
        // />
        <ListItemAvatar className="rounded-full inline-flex self-end mr-3 shadow-md" sx={{ minWidth: 32 }}>
          <Avatar alt="Avatar" src={imageUrl ?? `assets/image.png`} sx={{ width: 40, height: 40 }} />
        </ListItemAvatar>
      )}

      {/* Message Bubble */}
      <div
        className="max-w-[45vw] rounded-2xl border-2 border-white/5 backdrop-blur-lg bg-black/20 shadow-lg text-sm p-1"
      >
        {/* Header */}
        <div
          className={`flex px-4 ${isCurrentUser ? "justify-end" : "justify-start"} border-b border-white/30 bg-transparent`}
        >
          <p className="font-bold mb-0">{isCurrentUser ? "You" : name}</p>
        </div>

        {/* Message Content */}
        <div className="px-3 py-1 w-full break-words">
          <p className="mb-0 w-full">{message.text}</p>

          {/* Timestamp */}
          <div className="flex justify-end items-center text-xs text-black/70">
            <span>{message.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Avatar for Current User */}
      {isCurrentUser && (
        // <img
        //   src={currentUserImageUrl || "/profile.png"}
        //   alt="avatar"
        //   className="rounded-full inline-flex self-end ml-3 shadow-md"
        //   width="32"
        // />
        <ListItemAvatar className="rounded-full inline-flex self-end ml-3 shadow-md" sx={{ minWidth: 32 }}>
          <Avatar alt="Avatar" src={currentUserImageUrl ?? `assets/image.png`} sx={{ width: 40, height: 40 }} />
        </ListItemAvatar>
      )}
    </li>
  );
};

export default MessageItem;
