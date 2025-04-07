import { Avatar, Box, Button, ButtonGroup, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Stack, Typography } from "@mui/material"
import SearchBar from "../shared/search-bar"
import { useEffect, useRef, useState } from "react";
import Header from "./header";
import MessageInput from "./input";
import MessageItem from "./message";
import ExpenseItem from "./expense";
import Badge from '@mui/joy/Badge';
import AddExpense from "./addExpense";
import axiosInstance from "../../../utils/axiosInterceptor";
import { API_URLS } from "../../../constants/apiUrls";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import { Check, Clear } from "@mui/icons-material";
import { toast } from "sonner";
import { Expense, Friend, Message } from "./index.model";
import { useSocket } from "./socket";
import { format } from "date-fns";

const Friendspage = () => {
  const [activeButton, setActiveButton] = useState("friends");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageContainer = useRef<HTMLDivElement | null>(null);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [combined, setCombined] = useState<(Message | Expense)[]>([]);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [allExpensesLoaded, setAllExpensesLoaded] = useState(false);
  const [allCombinedLoaded, setAllCombinedLoaded] = useState(false);
  const [view, setView] = useState<"All" | "Messages" | "Expenses">("All");
  const pageSize = 20;

  const [timestampMessages, setTimestampMessages] = useState<string>(
    new Date().toISOString()
  );
  const [timestampExpenses, setTimestampExpenses] = useState<string>(
    new Date().toISOString()
  );
  const [timestampCombined, setTimestampCombined] = useState<string>(
    new Date().toISOString()
  );

  const currentUser = useSelector((store: RootState) => store.auth.user)
  const [selectedFriend, setSelectedFriend] = useState<Friend>();
  const {
    joinRoom,
    sendConversationMessage,
    onNewConversationMessage,
    removeNewMessageListener,
    leaveRoom,
  } = useSocket()

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    // Listen for new conversation messages
    onNewConversationMessage(handleNewMessage);

    // Cleanup the listener when the component unmounts or when switching rooms
    return () => {
      removeNewMessageListener();
    };
  }, [onNewConversationMessage, removeNewMessageListener]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  };
  useEffect(() => {
    const getFriendRequests = async () => {
      const res = await axiosInstance.get(`${API_URLS.getFriends}`, {
        params: {
          status: "PENDING"
        },
        withCredentials: true
      });
      if (res.data.success) {
        setFriendRequests(res.data.data);
      }
    }
    const friends = async () => {
      const res = await axiosInstance.get(`${API_URLS.getFriends}`, {
        params: {
          status: "ACCEPTED"
        },
        withCredentials: true
      });
      if (res.data.success) {
        setFriends(res.data.data);
      }
    }
    getFriendRequests();
    friends();
    return () => {
      if (selectedFriend) {
        leaveRoom(selectedFriend.conversation_id);
      }
    }
  }, [])
  useEffect(() => {
    scrollToBottom()
  }, [messageContainer.current, messages, view])
  useEffect(() => {
    if(selectedFriend) {
      const fetchMessages = async() => {
        const res = await axiosInstance.get(`${API_URLS.getMessages}/${selectedFriend?.conversation_id}`, {
          params: { pageSize, timestamp: timestampMessages },
          withCredentials: true
        });
        
        setMessages(res.data.data)
      }
      const fetchExpenses = async() => {
        const res = await axiosInstance.get(`${API_URLS.getExpenses}/${selectedFriend.conversation_id}`, {
          params: { pageSize, timestamp: timestampExpenses },
          withCredentials: true
        });
        setExpenses(res.data.data)
      }
      const fetchCombined = async() => {
        const res = await axiosInstance.get(`${API_URLS.getCombined}/${selectedFriend.conversation_id}`, {
          params: { pageSize, timestamp: timestampCombined },
          withCredentials: true
        });
        setCombined(res.data.data)
      }
      fetchMessages();
      fetchExpenses();
      fetchCombined();
    }
  }, [selectedFriend]);

  const handleActiveButtonChange = (view: string) => setActiveButton(view);
  const onSend = async(message: string) => {
    const messageData = {
      conversation_id: selectedFriend?.conversation_id,
      sender_id: currentUser?.user_id,
      message,
    };
    sendConversationMessage(messageData);
  }
  const handleAddExpensesClose = () => setAddExpenseDialogOpen(false);
  const handleAddExpensesOpen = () => setAddExpenseDialogOpen(true);
  const handleAcceptRejectRequest = async (conversationId: string, status: string) => {
    const res = await axiosInstance.patch(`${API_URLS.acceptRejectRequest}/${conversationId}`, { status }, { withCredentials: true });
    if (res.data.success) {
      const acceptedRequest = friendRequests.find(request => request.conversation_id === conversationId);
      setFriendRequests(friendRequests.filter((request) => request.conversation_id !== conversationId));
      setFriends([...friends, { ...acceptedRequest!, "status": "ACCEPTED" }])
      toast.success(`Request ${status} successfully`)
    }
  }
  const handleViewChange = (view: "All" | "Messages" | "Expenses") => setView(view);
  return (
    <>
      <AddExpense open={addExpenseDialogOpen} handleAddExpensesClose={handleAddExpensesClose} />
      <Box className="grid gap-4 grid-cols-4 h-[89.5vh]">
        <Box className="p-4 pe-0 flex flex-col flex-wrap h-full col-span-4 md:col-span-1" hidden={false} sx={{ backgroundColor: "#A1E3F9" }}>
          <Box className="pb-4">
            <SearchBar placeholder="Search using email..." />
          </Box>
          <Box className="grow flex flex-col rounded-lg shadow-md m-0 p-0 max-w-full" sx={{ backgroundColor: "white" }}>
            <Paper className="rounded-lg" elevation={5}>
              <ButtonGroup variant="outlined" fullWidth className="grid" aria-label="Basic button group">
                <Button onClick={() => handleActiveButtonChange("friends")} variant={activeButton === "friends" ? "contained" : "outlined"} className="w-1/2"
                  sx={{ borderRadius: "4px 0px 0px 0px" }}
                >Friends</Button>
                < Button onClick={() => handleActiveButtonChange("requests")} variant={activeButton === "requests" ? "contained" : "outlined"} className="w-1/2"
                  sx={{ borderRadius: "0px 4px 0px 0px" }}
                >
                  <Badge badgeContent={friendRequests.length} size="sm" badgeInset="-22%">
                    Requests
                  </Badge>
                </Button>
              </ButtonGroup>
              <List dense className="max-h-[70.2vh] min-h-[70.2vh] overflow-y-auto overflow-x-auto " sx={{ width: '100%', padding: 0, bgcolor: 'background.paper', borderRadius: "0px 0px 8px 8px" }}>
                <Divider />
                {
                  (activeButton === "friends" ? friends : friendRequests).map((friend) => {
                    return (
                      <>
                        <ListItem disablePadding alignItems="flex-start" key={friend.conversation_id} onClick={() => {
                          setSelectedFriend(friend);
                          joinRoom(friend.conversation_id)
                        }}>
                          <ListItemButton sx={{ paddingX: 1 }}>
                            <ListItemAvatar sx={{ minWidth: 32, paddingRight: 1 }}>
                              <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box className="flex justify-between">
                                  <Box>{friend.friend.first_name} {friend.friend.last_name}</Box>
                                  <Box className="flex gap-2">{friend.balance_amount} {(activeButton === "requests" && friend.status === "RECEIVER") ? <>
                                    <button onClick={() => handleAcceptRejectRequest(friend.conversation_id, "ACCEPTED")}><Check /></button>
                                    <button onClick={() => handleAcceptRejectRequest(friend.conversation_id, "REJECTED")}><Clear /></button>
                                  </> : null}</Box>
                                </Box>
                              }
                              secondary={
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{ color: 'text.primary', display: 'inline' }}
                                >
                                  {friend.friend.email}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                        <Divider />
                      </>
                    )
                  })
                }
              </List>
            </Paper>
          </Box>
        </Box>
        <Box className="col-span-4 md:col-span-3 p-4 ps-0 h-full">
          <Paper className="h-full" elevation={5}>
            <Stack className="flex flex-col h-full bg-[white] rounded-lg">
              {
                selectedFriend ?
                  <>
                    <Box><Header friend={selectedFriend} view={view} handleViewChange={(view: "All" | "Messages" | "Expenses") => handleViewChange(view)}/></Box>
                    <Divider />
                    <Box ref={messageContainer} className="h-[67vh] overflow-auto">
                      {
                        view === "Messages" ?
                        messages.map((message) => (
                          <MessageItem
                        message={{ text: message.message, createdAt: format(new Date(message.createdAt), "hh:mm a")}}
                        isCurrentUser={message.sender_id === currentUser?.user_id}
                        name={selectedFriend.friend.first_name}
                        imageUrl="/vite.svg"
                        currentUserImageUrl="/vite.svg"
                      />
                        )) : null
                      }
                      {
                        view === "Expenses" ?
                        expenses.map((expense) => (
                          <ExpenseItem
                            key={expense.friend_expense_id}
                            expense={expense}
                            isCurrentUserPayer={expense.payer === "You"}
                            imageUrl="vite.svg"
                            currentUserImageUrl="vite.svg"
                            name={expense.payer}
                          // onRetryExpenseAddition={handleRetry}
                          />
                        )) : null
                      }
                      
                      <Box ref={messagesEndRef} />
                    </Box>
                    <Divider />
                    <Box><MessageInput handleAddExpensesOpen={handleAddExpensesOpen} onSend={onSend} /></Box>
                  </>
                  : 
                  <Box className="flex flex-col justify-center content-center items-center h-100">
                    <Typography align="center">Select a friend to have chat with or to add expense</Typography>
                  </Box>
              }
            </Stack>
          </Paper>
        </Box>
      </Box>
    </>
  )
}

export default Friendspage