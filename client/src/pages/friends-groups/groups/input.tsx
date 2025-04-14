import { useState } from "react";
import { TextField, IconButton, Box, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const MessageInput: React.FC<{handleAddExpensesOpen: () => void, onSend: (message: string) => void}> = ({ handleAddExpensesOpen, onSend }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() === "") return; // Prevent sending empty messages
    onSend(message); // Pass the message to the parent component
    setMessage(""); // Clear input after sending
  };

  return (
    <Box className="flex items-center gap-2 p-2 rounded-lg" sx={{ backgroundColor: "#fff" }}>
        <Button variant="contained" onClick={handleAddExpensesOpen}>
            Add Expense
        </Button>
        <Box className="flex grow">
            <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            size="small"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()} // Send on Enter key press
            />
            <IconButton color="primary" onClick={handleSend}>
                <SendIcon />
            </IconButton>
        </Box>
    </Box>
  );
};

export default MessageInput;
