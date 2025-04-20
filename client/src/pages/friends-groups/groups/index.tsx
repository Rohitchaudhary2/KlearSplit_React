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
import { Check, Clear, CurrencyRupee } from "@mui/icons-material";
import { toast } from "sonner";
import { ExpenseParticipant, GroupData, GroupExpenseData, GroupMemberData, GroupMessageData, GroupSettlementData } from "./index.model";
import { useSocket } from "../shared/search-bar/socket";
import { format } from "date-fns";
import classes from './index.module.css'
import GroupDetails from "./groupDetails";
import SettlementCard from "./settlementDisplay";

const GroupsPage = () => {
  const [activeButton, setActiveButton] = useState("groups");
  const messageContainer = useRef<HTMLDivElement | null>(null);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [groupInvites, setGroupInvites] = useState<GroupData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [messages, setMessages] = useState<GroupMessageData[]>([]);
  const [expenses, setExpenses] = useState<GroupExpenseData[]>([]);
  const [combined, setCombined] = useState<(GroupMessageData | GroupExpenseData | GroupSettlementData)[]>([]);
  const [loading, setLoading] = useState(false);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [allExpensesLoaded, setAllExpensesLoaded] = useState(false);
  const [allCombinedLoaded, setAllCombinedLoaded] = useState(false);
  const [view, setView] = useState<"All" | "Messages" | "Expenses">("All");
  const pageSize = 20;
  const [scrollHeight, setScrollHeight] = useState(0);
  const user = useSelector((store: RootState) => store.auth.user);
  const [currentMember, setCurrentMember] = useState<GroupMemberData>();
  const [groupMembers, setGroupMembers] = useState<GroupMemberData[]>();
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false);
  const [loaders, setLoaders] = useState({
    addExpense: false,
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

  const currentUser = useSelector((store: RootState) => store.auth.user)
  const [selectedGroup, setselectedGroup] = useState<GroupData>();
  const {
    joinRoom,
    sendGroupMessage,
    onNewGroupMessage,
    removeNewMessageListener,
    leaveRoom,
  } = useSocket()

  useEffect(() => {
    const handleNewMessage = (message: GroupMessageData) => {
      const sender = getFullNameAndImage(groupMembers!.find((member) =>
        message.sender_id === member.member_id
      ));
      message = {
        ...message,
        senderName: sender.fullName,
        senderImage: sender.imageUrl
      };
      setMessages((prevMessages) => [...prevMessages, message]);
      setCombined((prev) => [...prev, message]);
    };

    // Listen for new conversation messages
    onNewGroupMessage(handleNewMessage);

    // Cleanup the listener when the component unmounts or when switching rooms
    return () => {
      removeNewMessageListener();
    };
  }, [onNewGroupMessage, removeNewMessageListener, groupMembers]);

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
    const getGroups = async () => {
      const res = await axiosInstance.get(`${API_URLS.getGroups}`, {
        params: {
          status: "PENDING"
        },
        withCredentials: true
      });
      if (res.data.success) {
        setGroupInvites(res.data.data.invitedGroups);
        setGroups(res.data.data.acceptedGroups);
      }
    }
    getGroups();
    return () => {
      if (selectedGroup) {
        leaveRoom(selectedGroup.group_id);
      }
    }
  }, [])
  const sortBycreatedAt = (data: (GroupMessageData | GroupExpenseData | GroupSettlementData)[]) => {
    return data.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  }
  useEffect(() => {
    if (messageContainer.current) scrollToBottom()
  }, [messageContainer.current, messages, view, expenses, combined]);
  const getFullNameAndImage = (user: GroupMemberData | undefined) => {
    return {
      fullName: `${user?.first_name} ${user?.last_name ?? ""}`.trim(),
      imageUrl: user?.image_url,
    };
  }
  useEffect(() => {
    setScrollHeight(0);
    if (selectedGroup) {
      const fetchAllData = async () => {
        setLoading(() => true);

        try {
          const [messagesRes, expensesRes, combinedRes] = await Promise.all([
            axiosInstance.get(`${API_URLS.getGroupMessages}/${selectedGroup?.group_id}`, {
              params: { pageSize, timestamp: timestampMessages },
              withCredentials: true
            }),
            axiosInstance.get(`${API_URLS.fetchExpensesSettlements}/${selectedGroup.group_id}`, {
              params: { pageSize, timestamp: timestampExpenses },
              withCredentials: true
            }),
            axiosInstance.get(`${API_URLS.fetchGroupCombined}/${selectedGroup.group_id}`, {
              params: { pageSize, timestamp: timestampCombined },
              withCredentials: true
            }),
          ]);

          // Handle messages
          const messages = messagesRes.data.data.sort((a: GroupMessageData, b: GroupMessageData) => (a.createdAt < b.createdAt ? -1 : 1))
          if (messages.length < 20) setAllMessagesLoaded(true);
          if (messages.length) setTimestampMessages(messages[0].createdAt);
          const messagesWithName = messages.map((message: GroupMessageData) => {
            const sender = getFullNameAndImage(groupMembers!.find((member) =>
              message.sender_id === member.group_membership_id
            ));
            return {
              ...message,
              senderName: sender.fullName,
              senderImage: sender.imageUrl
            };
          });
          setMessages(messagesWithName as GroupMessageData[]);

          // Handle expenses
          const expenses = expensesRes.data.data.sort((a: GroupExpenseData | GroupSettlementData, b: GroupExpenseData | GroupSettlementData) => (a.createdAt < b.createdAt ? -1 : 1))
          if (expenses.length < 20) setAllExpensesLoaded(true);
          if (expenses.length) setTimestampExpenses(expenses[0].createdAt);
          expenses.forEach((expense: GroupExpenseData | GroupSettlementData) => {
            if (expense.payer_id === currentMember?.group_membership_id) {
              expense.payer = getFullNameAndImage(currentMember);
            } else {
              const payer = groupMembers!.find((member) => expense.payer_id === member.group_membership_id);
              expense.payer = getFullNameAndImage(payer);
            }
            if ("group_settlement_id" in expense) {
              const debtor = groupMembers!.find((member) => expense.debtor_id === member.group_membership_id);
              expense.debtor = getFullNameAndImage(debtor);
            }
          });
          setExpenses(expenses as GroupExpenseData[]);

          // Handle combined
          const combined = sortBycreatedAt(combinedRes.data.data);
          if (combined.length < 20) setAllCombinedLoaded(true);
          if (combined.length) setTimestampCombined(combined[0].createdAt);
          const combinedWithName = combined.map((item) => {
            if ("group_message_id" in item) {
              const sender = getFullNameAndImage(groupMembers!.find((member) =>
                item.sender_id === member.group_membership_id
              ));
              return {
                ...item,
                senderName: sender.fullName,
                senderImage: sender.imageUrl
              };
            } else if ("group_expense_id" in item) {
              if (item.payer_id === currentMember?.group_membership_id) {
                item.payer = getFullNameAndImage(currentMember);
              } else {
                const payer = groupMembers!.find((member) => item.payer_id === member.group_membership_id);
                item.payer = getFullNameAndImage(payer);
              }
              return item
            } else {
              const debtor = groupMembers!.find((member) => item.debtor_id === member.group_membership_id);
              item.debtor = getFullNameAndImage(debtor);
              return item;
            }
          })
          setCombined(combinedWithName);

        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(() => false); // Only done when all above are finished (or errored)
        }
      };
      fetchAllData();
    }
  }, [selectedGroup]);
  const handleScrollToTop = async () => {
    if (messageContainer.current && selectedGroup && !loading) {
      const { scrollTop, scrollHeight } = messageContainer.current;
      if (scrollTop === 0) {
        switch (view) {
          case "All": {
            if (!allCombinedLoaded && combined.length) {
              setLoading(() => true)
              const res = await axiosInstance.get(`${API_URLS.fetchGroupCombined}/${selectedGroup?.group_id}`, {
                params: { pageSize, timestamp: timestampCombined },
                withCredentials: true
              });
              const combined = sortBycreatedAt(res.data.data);
              if (combined.length < 20) setAllCombinedLoaded(true);
              if (combined.length) setTimestampCombined(combined[0].createdAt);
              const combinedWithName = combined.map((item) => {
                if ("group_message_id" in item) {
                  const sender = getFullNameAndImage(groupMembers!.find((member) =>
                    item.sender_id === member.group_membership_id
                  ));
                  return {
                    ...item,
                    senderName: sender.fullName,
                    senderImage: sender.imageUrl
                  };
                } else if ("group_expense_id" in item) {
                  if (item.payer_id === currentMember?.group_membership_id) {
                    item.payer = getFullNameAndImage(currentMember);
                  } else {
                    const payer = groupMembers!.find((member) => item.payer_id === member.group_membership_id);
                    item.payer = getFullNameAndImage(payer);
                  }
                  return item
                } else {
                  const debtor = groupMembers!.find((member) => item.debtor_id === member.group_membership_id);
                  item.debtor = getFullNameAndImage(debtor);
                  return item;
                }
              })
              setCombined((prev) => [...combinedWithName, ...prev]);
              setScrollHeight(scrollHeight);
              setLoading(() => false)
            }
            break;
          }
          case "Messages": {
            if (!allMessagesLoaded && messages.length) {
              setLoading(() => true)
              const res = await axiosInstance.get(`${API_URLS.getGroupMessages}/${selectedGroup?.group_id}`, {
                params: { pageSize, timestamp: timestampMessages },
                withCredentials: true
              });
              const messages = res.data.data.sort((a: GroupMessageData, b: GroupMessageData) => (a.createdAt < b.createdAt ? -1 : 1))
              if (messages.length < 20) setAllMessagesLoaded(true);
              if (messages.length) setTimestampMessages(messages[0].createdAt);
              const messagesWithName = messages.map((message: GroupMessageData) => {
                const sender = getFullNameAndImage(groupMembers!.find((member) =>
                  message.sender_id === member.group_membership_id
                ));
                return {
                  ...message,
                  senderName: sender.fullName,
                  senderImage: sender.imageUrl
                };
              });
              setMessages((prev) => [...messagesWithName as GroupMessageData[], ...prev])
              setScrollHeight(scrollHeight);
              setLoading(() => false)
            }
            break;
          }
          case "Expenses": {
            if (!allExpensesLoaded && expenses.length) {
              setLoading(true);
              const res = await axiosInstance.get(`${API_URLS.fetchExpensesSettlements}/${selectedGroup?.group_id}`, {
                params: { pageSize, timestamp: timestampExpenses },
                withCredentials: true
              });
              const expenses = res.data.data.sort((a: GroupExpenseData | GroupSettlementData, b: GroupExpenseData | GroupSettlementData) => (a.createdAt < b.createdAt ? -1 : 1))
              if (expenses.length < 20) setAllExpensesLoaded(true);
              if (expenses.length) setTimestampExpenses(expenses[0].createdAt);
              expenses.forEach((expense: GroupExpenseData | GroupSettlementData) => {
                if (expense.payer_id === currentMember?.group_membership_id) {
                  expense.payer = getFullNameAndImage(currentMember);
                } else {
                  const payer = groupMembers!.find((member) => expense.payer_id === member.group_membership_id);
                  expense.payer = getFullNameAndImage(payer);
                }
                if ("group_settlement_id" in expense) {
                  const debtor = groupMembers!.find((member) => expense.debtor_id === member.group_membership_id);
                  expense.debtor = getFullNameAndImage(debtor);
                }
              });
              setExpenses((prev) => [...expenses as GroupExpenseData[], ...prev]);
              setScrollHeight(scrollHeight)
              setLoading(false)
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
  }, [selectedGroup, allMessagesLoaded, allExpensesLoaded, allCombinedLoaded, view, timestampMessages, timestampExpenses, timestampCombined, loading]);

  const handleActiveButtonChange = (view: string) => setActiveButton(view);
  const onSend = async (message: string) => {
    const messageData = {
      group_id: selectedGroup?.group_id,
      sender_id: currentUser?.user_id,
      message,
    };
    sendGroupMessage(messageData);
  }
  const handleAddExpensesClose = () => setAddExpenseDialogOpen(false);
  const handleAddExpensesOpen = () => setAddExpenseDialogOpen(true);
  const handleAcceptRejectRequest = async (conversationId: string, status: string) => {
    const res = await axiosInstance.patch(`${API_URLS.acceptRejectRequest}/${conversationId}`, { status }, { withCredentials: true });
    if (res.data.success) {
      const acceptedRequest = groupInvites.find(request => request.group_id === conversationId);
      setGroupInvites(groupInvites.filter((request) => request.group_id !== conversationId));
      setGroups([...groups, { ...acceptedRequest!, "status": "ACCEPTED" }])
      toast.success(`Request ${status} successfully`)
    }
  }
  const handleViewChange = (view: "All" | "Messages" | "Expenses") => {
    setView(view);
    setScrollHeight(0);
  }
  const filterMembers = (members: GroupMemberData[]) => {
    const filteredMembers = members.map((member) => {
      if (member.member_id === user?.user_id) {
        member.first_name = "You";
        member.last_name = "";
      }
      switch (member.role) {
        case "ADMIN":
          return { ...member, role: "Admin" };
        case "COADMIN":
          return { ...member, role: "Co-Admin" };
        case "CREATOR":
          return { ...member, role: "Creator" };
        case "USER":
          return { ...member, role: "Member" };
        default:
          return member;
      }
    });
    return filteredMembers;
  }
  const handleSelectGroupData = async (group: GroupData | undefined) => {
    if (group) {
      const res = await axiosInstance.get(`${API_URLS.group}/${group.group_id}`, { withCredentials: true })
      if (res.data.success) {
        const filteredMembers = filterMembers(res.data.data);
        setGroupMembers(filteredMembers)
        const currentMember = filteredMembers.find((member) => user?.user_id === member.member_id);
        setCurrentMember(currentMember);
      }
    }
    if (group === selectedGroup) return;
    if (selectedGroup) {
      leaveRoom(selectedGroup.group_id);
    }
    setselectedGroup(group);
    setAllMessagesLoaded(false);
    setAllExpensesLoaded(false);
    setAllCombinedLoaded(false);
    setTimestampMessages(new Date().toISOString());
    setTimestampExpenses(new Date().toISOString());
    setTimestampCombined(new Date().toISOString());
    setMessages([]);
    setExpenses([]);
    setCombined([]);
    if (group) joinRoom(group.group_id);
  }
  const addExpense = async (expenseInfo: FormData) => {
    setLoaders((prev) => ({...prev, addExpense: true}));
    const res = await axiosInstance.post(`${API_URLS.addGroupExpense}/${selectedGroup?.group_id}`, expenseInfo, { withCredentials: true });
    if (res.data.success) {
      const debtorAmount = res.data.data.expenseParticipants.reduce((acc: number, val: ExpenseParticipant) => acc + parseFloat(val.debtor_amount), 0)      
      setCombined((prev) => [...prev, {...res.data.data.expense, "total_debt_amount": debtorAmount}]);
      setExpenses((prev) => [...prev, {...res.data.data.expense, "total_debt_amount": debtorAmount}]);
      selectedGroup!.balance_amount = JSON.stringify(Math.round((parseFloat(selectedGroup!.balance_amount) + (currentMember?.group_membership_id === res.data.data.expense.payer_id ? debtorAmount : -debtorAmount))*100) / 100);
      toast.success("Expense Added successfully")
    }
    setLoaders((prev) => ({...prev, addExpense: false}));
  }
  const handleSettlement = async (settlementAmount: number) => {
    const res = await axiosInstance.post(
      `${API_URLS.addExpense}/${selectedGroup?.group_id}`,
      { split_type: "SETTLEMENT", total_amount: settlementAmount },
      { withCredentials: true }
    )
    if (res.data.success) {
      setCombined((prev) => [...prev, res.data.data]);
      setExpenses((prev) => [...prev, res.data.data]);
      selectedGroup!.balance_amount = JSON.stringify(parseFloat(selectedGroup!.balance_amount) + (user?.user_id === res.data.data.payer_id ? parseFloat(res.data.data.debtor_amount) : -parseFloat(res.data.data.debtor_amount)));
      toast.success("Settlement added successfully")
    }
  }

  const handleGroupDetailsOpen = (open: boolean) => {
    setScrollHeight(0);
    setGroupDetailsOpen(open);
  }

  return (
    <>
      {
        selectedGroup &&
        currentMember &&
        <AddExpense
          group={selectedGroup}
          participants={groupMembers!}
          currentMember={currentMember!}
          open={addExpenseDialogOpen}
          handleAddExpense={addExpense}
          handleAddExpensesClose={handleAddExpensesClose}
        />
      }
      <Box className="grid gap-4 grid-cols-4 h-[89.5vh]">
        <Box className="p-4 pe-0 flex flex-col flex-wrap h-full col-span-4 md:col-span-1" hidden={false} sx={{ backgroundColor: "#A1E3F9" }}>
          <Box className="pb-4">
            <SearchBar placeholder="Search using group name..." />
          </Box>
          <Box className="grow flex flex-col rounded-lg shadow-md m-0 p-0 max-w-full" sx={{ backgroundColor: "white" }}>
            <Paper className="rounded-lg" elevation={5}>
              <ButtonGroup variant="outlined" fullWidth className="grid" aria-label="Basic button group">
                <Button onClick={() => handleActiveButtonChange("groups")} variant={activeButton === "groups" ? "contained" : "outlined"} className="w-1/2"
                  sx={{ borderRadius: "4px 0px 0px 0px" }}
                >Groups</Button>
                < Button onClick={() => handleActiveButtonChange("requests")} variant={activeButton === "requests" ? "contained" : "outlined"} className="w-1/2"
                  sx={{ borderRadius: "0px 4px 0px 0px" }}
                >
                  <Badge badgeContent={groupInvites.length} size="sm" badgeInset="-22%">
                    Requests
                  </Badge>
                </Button>
              </ButtonGroup>
              <List dense className="max-h-[70.2vh] min-h-[70.2vh] overflow-y-auto overflow-x-auto " sx={{ width: '100%', padding: 0, bgcolor: 'background.paper', borderRadius: "0px 0px 8px 8px" }}>
                <Divider />
                {
                  (activeButton === "groups" ? groups : groupInvites).map((group) => {
                    return (
                      <Fragment key={group.group_id}>
                        <ListItem disablePadding alignItems="flex-start" key={group.group_id} onClick={() => {
                          handleSelectGroupData(group);
                        }}>
                          <ListItemButton sx={{ paddingX: 1 }}>
                            <ListItemAvatar sx={{ minWidth: 32, paddingRight: 1 }}>
                              <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box className="flex justify-between content-center items-center">
                                  <Box>{group.group_name}</Box>
                                  <Box className="flex gap-2 items-center" sx={{ color: parseFloat(group.balance_amount) < 0 ? 'red' : 'green' }}>
                                    <Box sx={{ verticalAlign: "middle" }}>
                                      <CurrencyRupee sx={{ p: 0, m: 0 }} fontSize="inherit" />{Math.abs(parseFloat(group.balance_amount))}
                                    </Box>
                                    {(activeButton === "invites" && group.status === "RECEIVER") ? <>
                                      <button onClick={() => handleAcceptRejectRequest(group.group_id, "ACCEPTED")}><Check /></button>
                                      <button onClick={() => handleAcceptRejectRequest(group.group_id, "REJECTED")}><Clear /></button>
                                    </> : null}</Box>
                                </Box>
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
                selectedGroup && currentMember ?
                  groupDetailsOpen ?
                    <GroupDetails group={selectedGroup} groupMembers={groupMembers!} currentMember={currentMember!} handleGroupDetailsClose={() => handleGroupDetailsOpen(false)} />
                    :
                    <>
                      <Box><Header 
                      currentMember={currentMember!}
                      groupMembers={groupMembers!}
                      handleGroupDetailsOpen={() => handleGroupDetailsOpen(true)} handleBackButton={() => handleSelectGroupData(undefined)} group={selectedGroup} view={view} handleViewChange={(view: "All" | "Messages" | "Expenses") => handleViewChange(view)} /></Box>
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
                              <MessageItem key={message.group_message_id}
                                message={{ text: message.message, createdAt: format(new Date(message.createdAt), "hh:mm a") }}
                                isCurrentUser={message.sender_id === currentMember?.group_membership_id}
                                name={message.senderName}
                                imageUrl="/vite.svg"
                                currentUserImageUrl="/vite.svg"
                              />
                            )) : null
                        }
                        {
                          view === "Expenses" ?
                            expenses.map((expense) => (
                              <ExpenseItem
                                key={expense.group_expense_id}
                                expense={expense}
                                isCurrentUserPayer={expense.payer_id === currentMember?.group_membership_id}
                                imageUrl="vite.svg"
                                currentUserImageUrl="vite.svg"
                              // onRetryExpenseAddition={handleRetry}
                              />
                            )) : null
                        }
                        {
                          view === "All" ?
                            combined.map((item) => {
                              if ("group_expense_id" in item) {
                                return (
                                  <ExpenseItem
                                    key={item.group_expense_id}
                                    expense={item}
                                    isCurrentUserPayer={item.payer_id === currentMember?.group_membership_id}
                                    imageUrl="vite.svg"
                                    currentUserImageUrl="vite.svg"
                                  // onRetryExpenseAddition={handleRetry}
                                  />
                                )
                              }

                              if ("group_message_id" in item) {
                                return (
                                  <MessageItem key={item.group_message_id}
                                    message={{ text: item.message, createdAt: format(new Date(item.createdAt), "hh:mm a") }}
                                    isCurrentUser={item.sender_id === currentMember?.group_membership_id}
                                    name={item.senderName}
                                    imageUrl="/vite.svg"
                                    currentUserImageUrl="/vite.svg"
                                  />
                                )
                              }

                              if ("group_settlement_id" in item) {
                                const payer = groupMembers!.find((member) => member.group_membership_id === item.payer_id);
                                const debtor = groupMembers!.find((member) => member.group_membership_id === item.debtor_id);
                                return (
                                  <SettlementCard key={item.group_settlement_id}
                                    isCurrentUserPayer={item.payer_id === currentMember?.group_membership_id}
                                    payerImageUrl={payer!.image_url}
                                    payerName={`${payer!.first_name} ${payer!.last_name}`}
                                    debtorName={`${debtor!.first_name} ${debtor!.last_name}`}
                                    settlement={item}
                                    currentUserImageUrl={currentMember!.image_url ?? "image.png"}
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
                  // <Box className="flex flex-col justify-center content-center items-center h-100">
                  //   <Typography className="text-blue-700" align="center">Select a group to have chat with or to add expense</Typography>
                  // </Box>
                  <Box className="flex flex-col justify-center items-center h-full">
                    <Typography variant="h4" className="text-[#3674B5] text-center">
                      Select a group to chat with or add an expense
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

export default GroupsPage