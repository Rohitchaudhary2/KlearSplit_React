import { Avatar, Box, Button, ButtonGroup, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Stack, Typography } from "@mui/material"
import SearchBar from "../shared/search-bar"
import { Fragment, useEffect, useRef, useState } from "react";
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
import { useSocket } from "../shared/search-bar/socket";
import { format } from "date-fns";
import classes from './index.module.css'
import { useNavigate } from "react-router-dom";

const Friendspage = () => {
  const [activeButton, setActiveButton] = useState<"friends" | "friendRequests">("friends");
  const messageContainer = useRef<HTMLDivElement | null>(null);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
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
      try {
        const res = await axiosInstance.get(`${API_URLS.getFriends}`, {
          params: { status: "PENDING" },
          withCredentials: true
        });
        setFriendRequests(res.data.data);

      } catch (error) {
        toast.error("Something went wrong, please try again later!");
      } finally {
        setLoaders((prev) => ({ ...prev, friendRequests: false }));
      }
    }
    const friends = async () => {
      setLoaders((prev) => ({ ...prev, friends: true }));
      try {
        const res = await axiosInstance.get(API_URLS.getFriends, {
          params: { status: "ACCEPTED" },
          withCredentials: true
        });

        setFriends(res.data.data);

      } catch (error) {
        toast.error("Something went wrong, please try again later!");
      } finally {
        setLoaders((prev) => ({ ...prev, friends: false }));
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

        try {
          const [messagesRes, expensesRes, combinedRes] = await Promise.all([
            axiosInstance.get(`${API_URLS.getMessages}/${selectedFriend?.conversation_id}`, {
              params: { pageSize, timestamp: timestampMessages },
              withCredentials: true
            }),
            axiosInstance.get(`${API_URLS.getExpenses}/${selectedFriend.conversation_id}`, {
              params: { pageSize, timestamp: timestampExpenses },
              withCredentials: true
            }),
            axiosInstance.get(`${API_URLS.getCombined}/${selectedFriend.conversation_id}`, {
              params: { pageSize, timestamp: timestampCombined },
              withCredentials: true
            }),
          ]);

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

        } catch (error) {
          console.error("Error fetching data:", error);
          // Optionally show error state here
        } finally {
          setLoading(() => false); // Only done when all above are finished (or errored)
        }
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
              // const res = await axiosInstance.get(`${API_URLS.getCombined}/${selectedFriend?.conversation_id}`, {
              //   params: { pageSize, timestamp: timestampCombined },
              //   withCredentials: true
              // });
              // const combined = sortBycreatedAt(res.data.data);
              // if (combined.length < 20) setAllCombinedLoaded(true);
              // if (combined.length) setTimestampCombined(combined[0].createdAt);
              // setCombined((prev) => [...combined, ...prev]);
              // setScrollHeight(scrollHeight);
              // setLoading(() => false)
              try {
                const res = await axiosInstance.get(`${API_URLS.getCombined}/${selectedFriend?.conversation_id}`, {
                  params: { pageSize, timestamp: timestampCombined },
                  withCredentials: true
                });

                const combined = sortBycreatedAt(res.data.data);

                if (combined.length < 20) setAllCombinedLoaded(true);
                if (combined.length) setTimestampCombined(combined[0].createdAt);

                setCombined((prev) => [...combined, ...prev]);
                setScrollHeight(scrollHeight);
              } catch (error) {
                toast.error("Something went wrong, please try again later")
              } finally {
                setLoading(false);
              }
            }
            break;
          }
          case "Messages": {
            if (!allMessagesLoaded && messages.length) {
              setLoading(() => true)
              try {
                const res = await axiosInstance.get(`${API_URLS.getMessages}/${selectedFriend?.conversation_id}`, {
                  params: { pageSize, timestamp: timestampMessages },
                  withCredentials: true
                });

                const messages = sortBycreatedAt(res.data.data);

                if (messages.length < 20) setAllMessagesLoaded(true);
                if (messages.length) setTimestampMessages(messages[0].createdAt);

                setMessages((prev) => [...messages as Message[], ...prev]);
                setScrollHeight(scrollHeight);
              } catch (error) {
                toast.error("Something went wrong, please try again later");
              } finally {
                setLoading(false);
              }
            }
            break;
          }
          case "Expenses": {
            if (!allExpensesLoaded && expenses.length) {
              setLoading(true)
              try {
                const res = await axiosInstance.get(`${API_URLS.getExpenses}/${selectedFriend?.conversation_id}`, {
                  params: { pageSize, timestamp: timestampExpenses },
                  withCredentials: true
                });

                const expenses = sortBycreatedAt(res.data.data);

                if (expenses.length < 20) setAllExpensesLoaded(true);
                if (expenses.length) setTimestampExpenses(expenses[0].createdAt);

                setExpenses((prev) => [...expenses as Expense[], ...prev]);
                setScrollHeight(scrollHeight);
              } catch (error) {
                toast.error("Something went wrong, please try again later");
              } finally {
                setLoading(false);
              }
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
  const handleViewChange = (view: "All" | "Messages" | "Expenses") => {
    setView(view);
    setScrollHeight(0);
  }
  const handleSelectFriend = (friend: Friend) => {
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
    joinRoom(friend.conversation_id);
  }
  const handleBulkAddExpenses = (expenses: Expense[]) => {
    let balanceAmount = parseFloat(selectedFriend!.balance_amount);
    expenses.forEach((expense) => {
      expense.payer = expense.payer_id === user?.user_id ? "You" : `${selectedFriend?.friend.first_name} ${selectedFriend?.friend.last_name}`
      balanceAmount += (user?.user_id === expense.payer_id ? parseFloat(expense.debtor_amount) : -parseFloat(expense.debtor_amount))
    })
    setCombined((prev) => [...prev, ...expenses]);
    setExpenses((prev) => [...prev, ...expenses]);
    selectedFriend!.balance_amount = JSON.stringify(balanceAmount);
  }
  const addExpense = async (expenseInfo: FormData) => {
    setLoaders((prev) => ({ ...prev, addExpense: true }));
    try {
      const res = await axiosInstance.post(
        `${API_URLS.addExpense}/${selectedFriend?.conversation_id}`,
        expenseInfo,
        { withCredentials: true }
      );

      const expense = {
        ...res.data.data,
        payer: res.data.data.payer_id === user?.user_id
          ? "You"
          : `${selectedFriend?.friend.first_name} ${selectedFriend?.friend.last_name}`
      };

      setCombined((prev) => [...prev, expense]);
      setExpenses((prev) => [...prev, expense]);

      selectedFriend!.balance_amount = JSON.stringify(
        parseFloat(selectedFriend!.balance_amount) +
        (user?.user_id === res.data.data.payer_id
          ? parseFloat(res.data.data.debtor_amount)
          : -parseFloat(res.data.data.debtor_amount))
      );

      toast.success("Expense added successfully");
    } catch (error) {
      toast.error("Failed to add expense, please try again later");
    } finally {
      setLoaders((prev) => ({ ...prev, addExpense: false }));
    }

  }
  const handleSettlement = async (settlementAmount: number) => {
    try {
      const res = await axiosInstance.post(
        `${API_URLS.addExpense}/${selectedFriend?.conversation_id}`,
        { split_type: "SETTLEMENT", total_amount: settlementAmount },
        { withCredentials: true }
      );

      const settlement = {
        ...res.data.data,
        payer: res.data.data.payer_id === user?.user_id
          ? "You"
          : `${selectedFriend?.friend.first_name} ${selectedFriend?.friend.last_name}`
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
    } catch (error) {
      toast.error("Failed to add settlement, please try again later");
    } finally {
      setLoaders((prev) => ({ ...prev, addExpense: false }));
    }

  }
  const handleAddFriendRequests = (requests: Friend[]) => {
    setFriendRequests(requests)
  }
  return (
    <>
      {
        selectedFriend && user && <AddExpense id={selectedFriend!.conversation_id} handleBulkAddExpenses={handleBulkAddExpenses} friend={selectedFriend!.friend} open={addExpenseDialogOpen} handleAddExpense={addExpense} handleAddExpensesClose={handleAddExpensesClose} />
      }
      <Box className="grid gap-4 grid-cols-4 h-[89.5vh]">
        <Box className="p-4 pe-0 flex flex-col flex-wrap h-full col-span-4 md:col-span-1" hidden={false} sx={{ backgroundColor: "#A1E3F9" }}>
          <Box className="pb-4">
            <SearchBar handleAddFriendRequests={handleAddFriendRequests} placeholder="Search using email..." />
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
                  (activeButton === "friends" ? friends : friendRequests).map((friend) => {
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
                                  <Box>{friend.friend.first_name} {friend.friend.last_name}</Box>
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
                    <Box><Header handleSettlement={handleSettlement} friend={selectedFriend} view={view} handleViewChange={(view: "All" | "Messages" | "Expenses") => handleViewChange(view)} /></Box>
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
                              isCurrentUserPayer={expense.payer_id === user?.user_id}
                              imageUrl="vite.svg"
                              currentUserImageUrl="vite.svg"
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
                                  imageUrl="vite.svg"
                                  currentUserImageUrl="vite.svg"
                                  name={item.payer}
                                // onRetryExpenseAddition={handleRetry}
                                />
                              )
                            }

                            if ("message_id" in item) {
                              return (
                                <MessageItem
                                  message={{ text: item.message, createdAt: format(new Date(item.createdAt), "hh:mm a") }}
                                  isCurrentUser={item.sender_id === currentUser?.user_id}
                                  name={selectedFriend.friend.first_name}
                                  imageUrl="/vite.svg"
                                  currentUserImageUrl="/vite.svg"
                                />
                              )
                            }
                          }
                          )
                          : null
                      }
                    </Box>
                    <Divider />
                    <Box><MessageInput loader={loaders.addExpense} handleAddExpensesOpen={handleAddExpensesOpen} onSend={onSend} /></Box>
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