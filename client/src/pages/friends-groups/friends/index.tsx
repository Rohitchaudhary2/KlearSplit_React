import { Avatar, Box, Button, ButtonGroup, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Stack, Typography } from "@mui/material"
import SearchBar from "../shared/search-bar"
import { Fragment, useEffect, useRef, useState } from "react";
import Header from "./header";
import MessageInput from "./input";
import MessageItem from "./message";
import ExpenseItem from "./expense";
import Badge from '@mui/joy/Badge';
import AddExpense from "./addExpense";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import { Check, Clear } from "@mui/icons-material";
import { toast } from "sonner";
import { Expense, Friend, Message } from "./index.model";
import { useSocket } from "../shared/search-bar/socket";
import { format } from "date-fns";
import classes from './index.module.css'
import { useNavigate } from "react-router-dom";
import { onAcceptRejectRequest, onAddExpense, onAddSettlement, onGetCombined, onGetExpenses, onGetFriends, onGetMessages } from "./services";

const Friendspage = () => {
  const [activeButton, setActiveButton] = useState<"friends" | "friendRequests">("friends");
  const messageContainer = useRef<HTMLDivElement | null>(null);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriendRequests, setFilteredFriendRequests] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [combined, setCombined] = useState<(Message | Expense)[]>([]);
  const [loading, setLoading] = useState(false);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [allExpensesLoaded, setAllExpensesLoaded] = useState(false);
  const [allCombinedLoaded, setAllCombinedLoaded] = useState(false);
  const [view, setView] = useState<"All" | "Messages" | "Expenses">("All");
  const pageSize = 20;
  const [scrollHeight, setScrollHeight] = useState(0);
  const user = useSelector((store: RootState) => store.auth.user)
  const [loaders, setLoaders] = useState({
    addExpense: false,
    friendRequests: false,
    friends: false
  })
  const [timestampMessages, setTimestampMessages] = useState<string>(
    new Date().toISOString()
  );
  const [timestampExpenses, setTimestampExpenses] = useState<string>(
    new Date().toISOString()
  );
  const [timestampCombined, setTimestampCombined] = useState<string>(
    new Date().toISOString()
  );

  const navigate = useNavigate()
  const [selectedFriend, setSelectedFriend] = useState<Friend>();
  const {
    joinRoom,
    sendConversationMessage,
    onNewConversationMessage,
    removeNewMessageListener,
    leaveRoom,
  } = useSocket()
  useEffect(() => {
    if (friendRequests.length || friends.length) {
      const searchParams = new URLSearchParams(location.search);
      const id = searchParams.get('id');
      const success = searchParams.get('success');
      const AllFriends = [...friendRequests, ...friends];
      const friend = AllFriends.find((friend) => friend.conversation_id === id);
      setSelectedFriend(friend);
      if (success === "true") {
        toast.success("Payment successful");
      }
      if (success === "false") {
        toast.error("Transaction failed")
      }
      navigate(location.pathname, { replace: true });
    }
  }, [friendRequests, friends])

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setCombined((prev) => [...prev, message]);
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
    // messagesEndRef.current.scrollIntoView();
    if (!scrollHeight) {
      messageContainer.current!.scrollTop = messageContainer.current!.scrollHeight;
      setScrollHeight(messageContainer.current!.scrollTop);
    } else {
      messageContainer.current!.scrollTop += messageContainer.current!.scrollHeight - scrollHeight - 20;
    }
  };
  // useEffect(() => {
  //   if (messageContainer.current) messageContainer.current!.scrollTop += messageContainer.current!.scrollHeight - scrollHeight - 20;
  // }, [messages.length, expenses.length, combined.length])
  useEffect(() => {
    const getFriendRequests = async () => {
      setLoaders((prev) => ({ ...prev, friendRequests: true }))
      const res = await onGetFriends({ status: 'PENDING' });
      setLoaders((prev) => ({ ...prev, friendRequests: false }));
      if (!res) return;
      setFriendRequests(res.data.data);
    }
    const friends = async () => {
      setLoaders((prev) => ({ ...prev, friends: true }));
      const res = await onGetFriends({ status: "ACCEPTED" });
      setLoaders((prev) => ({ ...prev, friends: false }));
      if (!res) return;

      setFriends(res.data.data);
    }
    getFriendRequests();
    friends();
    return () => {
      if (selectedFriend) {
        leaveRoom(selectedFriend.conversation_id);
      }
    }
  }, [])
  const sortBycreatedAt = (data: (Message | Expense)[]) => {
    return data.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  }
  useEffect(() => {
    if (messageContainer.current) scrollToBottom()
  }, [messageContainer.current, messages, view, expenses, combined])
  useEffect(() => {
    setScrollHeight(0);
    if (selectedFriend) {
      const fetchAllData = async () => {
        setLoading(() => true);

        const [messagesRes, expensesRes, combinedRes] = await Promise.all([
          onGetMessages({ pageSize, timestamp: timestampMessages }, selectedFriend.conversation_id),
          onGetExpenses({ pageSize, timestamp: timestampExpenses }, selectedFriend.conversation_id),
          onGetCombined({ pageSize, timestamp: timestampCombined }, selectedFriend.conversation_id)
        ]);

        if (!messagesRes || !expensesRes || !combinedRes) {
          setLoading(() => false);
          return;
        }
        // Handle messages
        const messages = sortBycreatedAt(messagesRes.data.data);
        if (messages.length < 20) setAllMessagesLoaded(true);
        if (messages.length) setTimestampMessages(messages[0].createdAt);
        setMessages(messages as Message[]);

        // Handle expenses
        const expenses = sortBycreatedAt(expensesRes.data.data);
        if (expenses.length < 20) setAllExpensesLoaded(true);
        if (expenses.length) setTimestampExpenses(expenses[0].createdAt);
        setExpenses(expenses as Expense[]);

        // Handle combined
        const combined = sortBycreatedAt(combinedRes.data.data);
        if (combined.length < 20) setAllCombinedLoaded(true);
        if (combined.length) setTimestampCombined(combined[0].createdAt);
        setCombined(combined);
        setLoading(() => false);
      };
      fetchAllData();
    }
  }, [selectedFriend]);
  const handleScrollToTop = async () => {
    if (messageContainer.current && selectedFriend && !loading) {
      const { scrollTop, scrollHeight } = messageContainer.current;
      if (scrollTop === 0) {
        switch (view) {
          case "All": {
            if (!allCombinedLoaded && combined.length) {
              setLoading(() => true)
              const res = await onGetCombined({ pageSize, timestamp: timestampCombined }, selectedFriend.conversation_id)
              if (!res) {
                setLoading(false);
                return;
              }
              const combined = sortBycreatedAt(res.data.data);

              if (combined.length < 20) setAllCombinedLoaded(true);
              if (combined.length) setTimestampCombined(combined[0].createdAt);

              setCombined((prev) => [...combined, ...prev]);
              setScrollHeight(scrollHeight);
              setLoading(false);
            }
            break;
          }
          case "Messages": {
            if (!allMessagesLoaded && messages.length) {
              setLoading(() => true)
              const res = await onGetMessages({ pageSize, timestamp: timestampMessages }, selectedFriend.conversation_id)
              if (!res) {
                setLoading(false);
                return;
              }
              const messages = sortBycreatedAt(res.data.data);

              if (messages.length < 20) setAllMessagesLoaded(true);
              if (messages.length) setTimestampMessages(messages[0].createdAt);

              setMessages((prev) => [...messages as Message[], ...prev]);
              setScrollHeight(scrollHeight);
              setLoading(false);
            }
            break;
          }
          case "Expenses": {
            if (!allExpensesLoaded && expenses.length) {
              setLoading(true)
              const res = await onGetExpenses({ pageSize, timestamp: timestampExpenses }, selectedFriend.conversation_id)
              if (!res) {
                setLoading(false);
                return;
              }
              const expenses = sortBycreatedAt(res.data.data);

              if (expenses.length < 20) setAllExpensesLoaded(true);
              if (expenses.length) setTimestampExpenses(expenses[0].createdAt);

              setExpenses((prev) => [...expenses as Expense[], ...prev]);
              setScrollHeight(scrollHeight);
              setLoading(false);
            }
          }
        }
      }
    }
  };
  useEffect(() => {
    const box = messageContainer.current;

    // Add the scroll event listener
    if (box) {
      box.addEventListener('scroll', handleScrollToTop);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      if (box) {
        box.removeEventListener('scroll', handleScrollToTop);
      }
    };
  }, [selectedFriend, allMessagesLoaded, allExpensesLoaded, allCombinedLoaded, view, timestampMessages, timestampExpenses, timestampCombined, loading]);

  const handleActiveButtonChange = (view: "friends" | "friendRequests") => setActiveButton(view);
  const onSend = async (message: string) => {
    const messageData = {
      conversation_id: selectedFriend?.conversation_id,
      sender_id: user?.user_id,
      message,
    };
    sendConversationMessage(messageData);
  }
  const handleAddExpensesClose = () => setAddExpenseDialogOpen(false);
  const handleAddExpensesOpen = () => setAddExpenseDialogOpen(true);
  const handleAcceptRejectRequest = async (conversationId: string, status: string) => {
    const res = await onAcceptRejectRequest(status, conversationId);
    if (!res) return;

    if (res.data.success) {
      const acceptedRequest = friendRequests.find(
        request => request.conversation_id === conversationId
      );

      setFriendRequests(
        friendRequests.filter(request => request.conversation_id !== conversationId)
      );

      setFriends([
        ...friends,
        { ...acceptedRequest!, status: "ACCEPTED" }
      ]);

      toast.success(`Request ${status.toLowerCase()} successfully`);
    }
  }
  const handleViewChange = (view: "All" | "Messages" | "Expenses") => {
    setView(view);
    setScrollHeight(0);
  }
  const handleSelectFriend = (friend: Friend | undefined) => {
    if (friend === selectedFriend) return;
    if (selectedFriend) {
      leaveRoom(selectedFriend.conversation_id);
    }
    setSelectedFriend(friend);
    setAllMessagesLoaded(false);
    setAllExpensesLoaded(false);
    setAllCombinedLoaded(false);
    setTimestampMessages(new Date().toISOString());
    setTimestampExpenses(new Date().toISOString());
    setTimestampCombined(new Date().toISOString());
    setMessages([]);
    setExpenses([]);
    setCombined([]);
    if (friend) joinRoom(friend.conversation_id);
  }
  const handleBulkAddExpenses = (expenses: Expense[]) => {
    let balanceAmount = parseFloat(selectedFriend!.balance_amount);
    expenses.forEach((expense) => {
      expense.payer = expense.payer_id === user?.user_id ? "You" : `${selectedFriend?.friend.first_name} ${selectedFriend?.friend.last_name ?? ''}`
      balanceAmount += (user?.user_id === expense.payer_id ? parseFloat(expense.debtor_amount) : -parseFloat(expense.debtor_amount))
    })
    setCombined((prev) => [...prev, ...expenses]);
    setExpenses((prev) => [...prev, ...expenses]);
    selectedFriend!.balance_amount = JSON.stringify(balanceAmount);
  }
  const addExpense = async (expenseInfo: FormData) => {
    setLoaders((prev) => ({ ...prev, addExpense: true }));
    const res = await onAddExpense(expenseInfo, selectedFriend!.conversation_id);
    if (!res) {
      setLoaders((prev) => ({ ...prev, addExpense: false }));
      return;
    }

    const expense = {
      ...res.data.data,
      payer: res.data.data.payer_id === user?.user_id
        ? "You"
        : `${selectedFriend?.friend.first_name} ${selectedFriend?.friend.last_name ?? ''}`
    };

    setCombined((prev) => [...prev, expense]);
    setExpenses((prev) => [...prev, expense]);

    selectedFriend!.balance_amount = JSON.stringify(
      parseFloat(selectedFriend!.balance_amount) +
      (user?.user_id === res.data.data.payer_id
        ? parseFloat(res.data.data.debtor_amount)
        : -parseFloat(res.data.data.debtor_amount))
    );

    setLoaders((prev) => ({ ...prev, addExpense: false }));
    toast.success("Expense added successfully");
  }
  const handleSettlement = async (settlementAmount: number) => {
    const res = await onAddSettlement(settlementAmount, selectedFriend!.conversation_id);
    if (!res) {
      setLoaders((prev) => ({ ...prev, addExpense: false }));
      return;
    }
    const settlement = {
      ...res.data.data,
      payer: res.data.data.payer_id === user?.user_id
        ? "You"
        : `${selectedFriend?.friend.first_name} ${selectedFriend?.friend.last_name ?? ''}`
    };

    setCombined((prev) => [...prev, settlement]);
    setExpenses((prev) => [...prev, settlement]);

    selectedFriend!.balance_amount = JSON.stringify(
      parseFloat(selectedFriend!.balance_amount) +
      (user?.user_id === res.data.data.payer_id
        ? parseFloat(res.data.data.debtor_amount)
        : -parseFloat(res.data.data.debtor_amount))
    );

    toast.success("Settlement added successfully");
    setLoaders((prev) => ({ ...prev, addExpense: false }));
  }
  const handleAddFriendRequests = (requests: Friend[]) => {
    setFriendRequests(requests)
  }
  const handleUpdateExpense = (expenseData: Expense) => {
    const balanceAmount = parseFloat(selectedFriend!.balance_amount) + (
      expenseData.payer_id === user?.user_id ?
        parseFloat(expenseData.debtor_amount) :
        -parseFloat(expenseData.debtor_amount)
    )
    selectedFriend!.balance_amount = JSON.stringify(balanceAmount);
    const updatedExpenses = expenses.map((expense) => {
      if (expense.friend_expense_id === expenseData.friend_expense_id) {
        return expenseData;
      }
      return expense;
    })
    setExpenses(updatedExpenses);
    const updatedCombined = combined.map((item) => {
      if ("friend_expense_id" in item && item.friend_expense_id === expenseData.friend_expense_id) {
        return expenseData;
      }
      return item;
    })
    setCombined(updatedCombined);
  }
  const handleDeleteExpense = (expenseData: Expense) => {
    const balanceAmount = parseFloat(selectedFriend!.balance_amount) + (
      expenseData.payer_id === user?.user_id ?
        -parseFloat(expenseData.debtor_amount) :
        parseFloat(expenseData.debtor_amount)
    )
    selectedFriend!.balance_amount = JSON.stringify(balanceAmount);
    const updatedExpenses = expenses.filter((expense) => expense.friend_expense_id !== expenseData.friend_expense_id)
    setExpenses(updatedExpenses);
    const updatedCombined = combined.filter((item) => {
      if ("friend_expense_id" in item && item.friend_expense_id === expenseData.friend_expense_id) {
        return false;
      }
      return true;
    })
    setCombined(updatedCombined);
  }
  const handleSearch = (query: string) => {
    const updatedRequests = friendRequests.filter((friend) => friend.friend.email.includes(query));
    setFilteredFriendRequests(updatedRequests);
    const updatedFriends = friends.filter((friend) => friend.friend.email.includes(query));
    setFilteredFriends(updatedFriends);
    setQuery(query);
  }
  return (
    <>
      {
        selectedFriend && user && <AddExpense id={selectedFriend!.conversation_id} handleBulkAddExpenses={handleBulkAddExpenses} friend={selectedFriend!.friend} open={addExpenseDialogOpen} handleAddExpense={addExpense} handleAddExpensesClose={handleAddExpensesClose} />
      }
      <Box className="grid gap-4 grid-cols-4 h-[89.5vh]">
        <Box className="p-4 pe-0 flex flex-col flex-wrap h-full col-span-4 md:col-span-1" hidden={false} sx={{ backgroundColor: "#A1E3F9" }}>
          <Box className="pb-4">
            <SearchBar handleSearch={handleSearch} handleAddFriendRequests={handleAddFriendRequests} placeholder="Search using email..." />
          </Box>
          <Box className="grow flex flex-col rounded-lg shadow-md m-0 p-0 max-w-full" sx={{ backgroundColor: "white" }}>
            <Paper className="rounded-lg" elevation={5}>
              <ButtonGroup variant="outlined" fullWidth className="grid" aria-label="Basic button group">
                <Button onClick={() => handleActiveButtonChange("friends")} variant={activeButton === "friends" ? "contained" : "outlined"} className="w-1/2"
                  sx={{ borderRadius: "4px 0px 0px 0px" }}
                >Friends</Button>
                < Button onClick={() => handleActiveButtonChange("friendRequests")} variant={activeButton === "friendRequests" ? "contained" : "outlined"} className="w-1/2"
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
                  loaders[activeButton] && "Loading..."
                }
                {
                  !loaders[activeButton] && !(activeButton === "friends" ? friends : friendRequests).length && "No Data found!"
                }
                {
                  (activeButton === "friends" ? (query ? filteredFriends : friends) : (query ? filteredFriendRequests : friendRequests)).map((friend) => {
                    return (
                      < Fragment key={friend.conversation_id}>

                        <ListItem disablePadding alignItems="flex-start" key={friend.conversation_id} onClick={() => {
                          handleSelectFriend(friend);
                        }}>
                          <ListItemButton sx={{ paddingX: 1 }}>
                            <ListItemAvatar sx={{ minWidth: 32, paddingRight: 1 }}>
                              <Avatar alt="avatar" src={friend.friend.image_url ?? `assets/image.png`} sx={{ width: 40, height: 40 }} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box className="flex justify-between">
                                  <Box>{friend.friend.first_name} {friend.friend.last_name ?? ''}</Box>
                                  <Box className="flex gap-2" sx={{ color: parseFloat(friend.balance_amount) < 0 ? 'red' : 'green' }}>₹{Math.abs(parseFloat(friend.balance_amount))} {(activeButton === "friendRequests" && friend.status === "RECEIVER") ? <>
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
                      </Fragment>
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
                selectedFriend && user ?
                  <>
                    <Box><Header handleUpdateExpense={handleUpdateExpense} handleDeleteExpense={handleDeleteExpense} handleSelectFriend={handleSelectFriend} handleSettlement={handleSettlement} friend={selectedFriend} view={view} handleViewChange={(view: "All" | "Messages" | "Expenses") => handleViewChange(view)} /></Box>
                    <Divider />
                    <Box ref={messageContainer} className="h-[67vh] overflow-auto">
                      {loading && (
                        <div
                          className={classes.loader}
                        />
                      )}
                      {
                        view === "Messages" ?
                          messages.map((message) => (
                            <MessageItem
                              message={{ text: message.message, createdAt: format(new Date(message.createdAt), "hh:mm a") }}
                              isCurrentUser={message.sender_id === user?.user_id}
                              name={selectedFriend.friend.first_name}
                              imageUrl={selectedFriend.friend.image_url ?? "assets/image.png"}
                              currentUserImageUrl={user.image_url ?? "assets/image.png"}
                            />
                          )) : null
                      }
                      {
                        view === "Expenses" ?
                          expenses.map((expense) => (
                            <ExpenseItem
                              key={expense.friend_expense_id}
                              expense={expense}
                              isCurrentUserPayer={expense.payer_id === user?.user_id}
                              imageUrl={selectedFriend.friend.image_url ?? "assets/image.png"}
                              currentUserImageUrl={user.image_url ?? "assets/image.png"}
                              name={expense.payer}
                            // onRetryExpenseAddition={handleRetry}
                            />
                          )) : null
                      }
                      {
                        view === "All" ?
                          combined.map((item) => {
                            if ("friend_expense_id" in item) {
                              return (
                                <ExpenseItem
                                  key={item.friend_expense_id}
                                  expense={item}
                                  isCurrentUserPayer={item.payer_id === user?.user_id}
                                  imageUrl={selectedFriend.friend.image_url ?? "assets/image.png"}
                                  currentUserImageUrl={user.image_url ?? "assets/image.png"}
                                  name={item.payer}
                                // onRetryExpenseAddition={handleRetry}
                                />
                              )
                            }

                            if ("message_id" in item) {
                              return (
                                <MessageItem
                                  message={{ text: item.message, createdAt: format(new Date(item.createdAt), "hh:mm a") }}
                                  isCurrentUser={item.sender_id === user?.user_id}
                                  name={selectedFriend.friend.first_name}
                                  imageUrl={selectedFriend.friend.image_url ?? "assets/image.png"}
                                  currentUserImageUrl={user.image_url ?? "assets/image.png"}
                                />
                              )
                            }
                          }
                          )
                          : null
                      }
                    </Box>
                    <Divider />
                    <Box><MessageInput isBlocked={selectedFriend.block_status === "BOTH" || (selectedFriend.block_status === "FRIEND1" && selectedFriend.status === "SENDER") || (selectedFriend.block_status === "FRIEND2" && selectedFriend.status === "RECEIVER")} loader={loaders.addExpense} handleAddExpensesOpen={handleAddExpensesOpen} onSend={onSend} /></Box>
                  </>
                  :
                  <Box className="flex flex-col justify-center items-center h-full">
                    <Typography variant="h4" className="text-[#3674B5] text-center">
                      Select a friend to chat with or add an expense
                    </Typography>
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