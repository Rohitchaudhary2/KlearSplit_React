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
import { AddMemberResponse, ExpenseParticipant, GroupData, GroupExpenseData, GroupExpenseResponse, GroupMemberData, GroupMessageData, GroupSettlementData } from "./index.model";
import { useSocket } from "../shared/search-bar/socket";
import { format } from "date-fns";
import classes from './index.module.css'
import GroupDetails from "./groupDetails";
import SettlementCard from "./settlementDisplay";
import { useNavigate } from "react-router-dom";
import { onAcceptRejectRequest, onAddExpense, onGetCombined, onGetExpensesSettlements, onGetGroupData, onGetGroups, onGetMessages, onLeaveGroup } from "./services";

const GroupsPage = () => {
  const [activeButton, setActiveButton] = useState("groups");
  const messageContainer = useRef<HTMLDivElement | null>(null);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [groupInvites, setGroupInvites] = useState<GroupData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [query, setQuery] = useState("");
  const [filteredGroupInvites, setFilteredGroupInvites] = useState<GroupData[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupData[]>([]);
  const [messages, setMessages] = useState<GroupMessageData[]>([]);
  const [expenses, setExpenses] = useState<(GroupExpenseData | GroupSettlementData)[]>([]);
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

  const navigate = useNavigate()
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
    if (groupInvites.length || groups.length) {
      const searchParams = new URLSearchParams(location.search);
      const id = searchParams.get('id');
      const success = searchParams.get('success');
      const AllGroups = [...groupInvites, ...groups];
      const group = AllGroups.find((group) => group.group_id === id);
      setselectedGroup(group);
      if (success === "true") {
        toast.success("Payment successful");
      }
      if (success === "false") {
        toast.error("Transaction failed")
      }
      navigate(location.pathname, { replace: true });
    }
  }, [groupInvites, groups])
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
  useEffect(() => {
    const getGroups = async () => {
      const res = await onGetGroups();
      if (!res) return;
      setGroupInvites(res.data.data.invitedGroups);
      setGroups(res.data.data.acceptedGroups);
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

        const [messagesRes, expensesRes, combinedRes] = await Promise.all([
          onGetMessages({ pageSize, timestamp: timestampMessages }, selectedGroup.group_id),
          onGetExpensesSettlements({ pageSize, timestamp: timestampExpenses }, selectedGroup.group_id),
          onGetCombined({ pageSize, timestamp: timestampCombined }, selectedGroup.group_id)
        ]);

        if (!messagesRes || !expensesRes || !combinedRes) {
          setLoading(() => false);
          return;
        }

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
        setLoading(() => false);
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
              const res = await onGetCombined({ pageSize, timestamp: timestampCombined }, selectedGroup.group_id);
              if (!res) {
                setLoading(false);
                return;
              }
              const combined = sortBycreatedAt(res.data.data);

              if (combined.length < 20) setAllCombinedLoaded(true);
              if (combined.length) setTimestampCombined(combined[0].createdAt);

              const combinedWithName = combined.map((item) => {
                if ("group_message_id" in item) {
                  const sender = getFullNameAndImage(
                    groupMembers!.find(
                      (member) => item.sender_id === member.group_membership_id
                    )
                  );
                  return {
                    ...item,
                    senderName: sender.fullName,
                    senderImage: sender.imageUrl
                  };
                } else if ("group_expense_id" in item) {
                  if (item.payer_id === currentMember?.group_membership_id) {
                    item.payer = getFullNameAndImage(currentMember);
                  } else {
                    const payer = groupMembers!.find(
                      (member) => item.payer_id === member.group_membership_id
                    );
                    item.payer = getFullNameAndImage(payer);
                  }
                  return item;
                } else {
                  const debtor = groupMembers!.find(
                    (member) => item.debtor_id === member.group_membership_id
                  );
                  item.debtor = getFullNameAndImage(debtor);
                  return item;
                }
              });

              setCombined((prev) => [...combinedWithName, ...prev]);
              setScrollHeight(scrollHeight);
              setLoading(false);
            }
            break;
          }
          case "Messages": {
            if (!allMessagesLoaded && messages.length) {
              setLoading(() => true)
              const res = await onGetMessages({ pageSize, timestamp: timestampMessages }, selectedGroup.group_id)
              if (!res) {
                setLoading(false);
                return;
              }
              const messages = res.data.data.sort(
                (a: GroupMessageData, b: GroupMessageData) =>
                  a.createdAt < b.createdAt ? -1 : 1
              );

              if (messages.length < 20) setAllMessagesLoaded(true);
              if (messages.length) setTimestampMessages(messages[0].createdAt);

              const messagesWithName = messages.map((message: GroupMessageData) => {
                const sender = getFullNameAndImage(
                  groupMembers!.find(
                    (member) => message.sender_id === member.group_membership_id
                  )
                );
                return {
                  ...message,
                  senderName: sender.fullName,
                  senderImage: sender.imageUrl
                };
              });

              setMessages((prev) => [...messagesWithName as GroupMessageData[], ...prev]);
              setScrollHeight(scrollHeight);
              setLoading(false);
            }
            break;
          }
          case "Expenses": {
            if (!allExpensesLoaded && expenses.length) {
              setLoading(true);
              const res = await onGetExpensesSettlements({ pageSize, timestamp: timestampExpenses }, selectedGroup.group_id);
              if (!res) {
                setLoading(false);
                return;
              }

              const expenses = res.data.data.sort(
                (a: GroupExpenseData | GroupSettlementData, b: GroupExpenseData | GroupSettlementData) =>
                  a.createdAt < b.createdAt ? -1 : 1
              );

              if (expenses.length < 20) setAllExpensesLoaded(true);
              if (expenses.length) setTimestampExpenses(expenses[0].createdAt);

              expenses.forEach((expense: GroupExpenseData | GroupSettlementData) => {
                if (expense.payer_id === currentMember?.group_membership_id) {
                  expense.payer = getFullNameAndImage(currentMember);
                } else {
                  const payer = groupMembers!.find(
                    (member) => expense.payer_id === member.group_membership_id
                  );
                  expense.payer = getFullNameAndImage(payer);
                }

                if ("group_settlement_id" in expense) {
                  const debtor = groupMembers!.find(
                    (member) => expense.debtor_id === member.group_membership_id
                  );
                  expense.debtor = getFullNameAndImage(debtor);
                }
              });

              setExpenses((prev) => [...expenses as GroupExpenseData[], ...prev]);
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
    const res = await onAcceptRejectRequest(status, conversationId);
    if (!res) return;

    if (res.data.success) {
      const acceptedRequest = groupInvites.find((request) => request.group_id === conversationId);

      // Remove the accepted request from the invites list
      setGroupInvites(groupInvites.filter((request) => request.group_id !== conversationId));

      // Add the accepted request to the groups list
      setGroups([...groups, { ...acceptedRequest!, status: "ACCEPTED" }]);

      toast.success(`Request ${status} successfully`);
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
    setGroupDetailsOpen(false);
    if (group) {
      const res = await onGetGroupData(group.group_id);
      if (!res) return;

      const filteredMembers = filterMembers(res.data.data);
      setGroupMembers(filteredMembers);

      const currentMember = filteredMembers.find(
        (member) => user?.user_id === member.member_id
      );
      setCurrentMember(currentMember);
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
    setLoaders((prev) => ({ ...prev, addExpense: true }));
    const res = await onAddExpense(expenseInfo, selectedGroup!.group_id);
    if (!res) {
      setLoaders((prev) => ({ ...prev, addExpense: false }));
      return;
    }

    const debtorAmount = res.data.data.expenseParticipants.reduce(
      (acc: number, val: ExpenseParticipant) => acc + parseFloat(val.debtor_amount),
      0
    );

    const expenseData = { ...res.data.data.expense, total_debt_amount: JSON.stringify(debtorAmount) };

    if (expenseData.payer_id === currentMember?.group_membership_id) {
      expenseData.payer = getFullNameAndImage(currentMember);
    } else {
      const payer = groupMembers!.find(
        (member) => expenseData.payer_id === member.group_membership_id
      );
      expenseData.payer = getFullNameAndImage(payer);
    }

    const isUserPayer = currentMember?.group_membership_id === expenseData.payer_id;

    const updatedGroupMembers = groupMembers!.map((member) => {
      if (member.group_membership_id === expenseData.payer_id) {
        member.total_balance = JSON.stringify(
          Math.round((parseFloat(member.total_balance) + debtorAmount) * 100) / 100
        );
        const userDebtAmount = res.data.data.expenseParticipants.find(
          (participant) => participant.debtor_id === currentMember?.group_membership_id
        )?.debtor_amount ?? 0;
        member.balance_with_user = JSON.stringify(
          Math.round((+member.balance_with_user + +userDebtAmount) * 100) / 100
        );
      }

      res.data.data.expenseParticipants.forEach((participant) => {
        if (participant.debtor_id === member.group_membership_id) {
          if (isUserPayer) {
            member.balance_with_user = JSON.stringify(
              Math.round((+member.balance_with_user - +participant.debtor_amount) * 100) / 100
            );
          }
          member.total_balance = JSON.stringify(
            Math.round((+member.total_balance - +participant.debtor_amount) * 100) / 100
          );
        }
      })
      return member;
    })

    setGroupMembers(updatedGroupMembers);
    setCombined((prev) => [...prev, expenseData]);
    setExpenses((prev) => [...prev, expenseData]);

    selectedGroup!.balance_amount = JSON.stringify(
      Math.round((parseFloat(selectedGroup!.balance_amount) + (currentMember?.group_membership_id === res.data.data.expense.payer_id ? debtorAmount : -debtorAmount)) * 100) / 100
    );

    toast.success("Expense added successfully");
    setLoaders((prev) => ({ ...prev, addExpense: false }));
  }

  const handleSettlement = (settlement: GroupSettlementData) => {
    selectedGroup!.balance_amount = JSON.stringify(
      Math.round(
        (
          parseFloat(selectedGroup!.balance_amount) +
          (user?.user_id === settlement.payer_id
            ? parseFloat(settlement.settlement_amount)
            : -parseFloat(settlement.settlement_amount))
        ) * 100
      ) / 100
    );
    groupMembers!.map((member) => {
      if (member.group_membership_id === settlement.payer_id) {
        member.total_balance = JSON.stringify(
          Math.round((parseFloat(member.total_balance) + +settlement.settlement_amount) * 100) / 100
        );
        member.balance_with_user = JSON.stringify(
          Math.round((+member.balance_with_user + +settlement.settlement_amount) * 100) / 100
        );
      }
      return member;
    })

    setCombined((prev) => [...prev, settlement]);
    setExpenses((prev) => [...prev, settlement]);
  }

  const handleLeaveGroup = async (id: string) => {
    const res = await onLeaveGroup(id);
    if (!res) return;
    const updatedGroupInvites = groupInvites.filter((group) => group.group_id !== id);
    setGroupInvites(updatedGroupInvites)
    const updatedGroups = groups.filter((group) => group.group_id !== id);
    setGroups(updatedGroups)
    toast.success("Group left successfully!")
  }

  const handleUpdateExpense = (expenseData: GroupExpenseResponse["data"], previousExpenseData: GroupExpenseData) => {
    const debtorAmount = expenseData.expenseParticipants.reduce((acc: number, val) => {
      return acc += +val.debtor_amount;
    }, 0)

    Object.assign(expenseData.expense, { "total_debt_amount": debtorAmount });
    if (expenseData.expense.payer_id === currentMember?.group_membership_id) {
      expenseData.expense.payer = getFullNameAndImage(currentMember);
    } else {
      const payer = groupMembers!.find(
        (member) => expenseData.expense.payer_id === member.group_membership_id
      );
      expenseData.expense.payer = getFullNameAndImage(payer);
    }
    const wasUserPayer = currentMember?.group_membership_id === previousExpenseData.payer_id;
    const isUserPayer = currentMember?.group_membership_id === expenseData.expense.payer_id;

    const updatedGroupMembers = groupMembers!.map((member) => {
      if (member.group_membership_id === previousExpenseData.payer_id) {
        member.total_balance = JSON.stringify(
          Math.round((parseFloat(member.total_balance) - +previousExpenseData.total_debt_amount) * 100) / 100
        );
        const userDebtAmount = previousExpenseData.participants.find(
          (participant) => participant.debtor_id === currentMember?.group_membership_id
        )?.debtor_amount ?? 0;
        member.balance_with_user = JSON.stringify(
          Math.round((+member.balance_with_user - +userDebtAmount) * 100) / 100
        );
      }

      previousExpenseData.participants.forEach((participant) => {
        if (participant.debtor_id === member.group_membership_id) {
          if (wasUserPayer) {
            member.balance_with_user = JSON.stringify(
              Math.round((+member.balance_with_user + +participant.debtor_amount) * 100) / 100
            );
          }
          member.total_balance = JSON.stringify(
            Math.round((+member.total_balance + +participant.debtor_amount) * 100) / 100
          );
        }
      })
      if (member.group_membership_id === expenseData.expense.payer_id) {
        member.total_balance = JSON.stringify(
          Math.round((parseFloat(member.total_balance) + debtorAmount) * 100) / 100
        );
        const userDebtAmount = expenseData.expenseParticipants.find(
          (participant) => participant.debtor_id === currentMember?.group_membership_id
        )?.debtor_amount ?? 0;
        member.balance_with_user = JSON.stringify(
          Math.round((+member.balance_with_user + +userDebtAmount) * 100) / 100
        );
      }

      expenseData.expenseParticipants.forEach((participant) => {
        if (participant.debtor_id === member.group_membership_id) {
          if (isUserPayer) {
            member.balance_with_user = JSON.stringify(
              Math.round((+member.balance_with_user - +participant.debtor_amount) * 100) / 100
            );
          }
          member.total_balance = JSON.stringify(
            Math.round((+member.total_balance - +participant.debtor_amount) * 100) / 100
          );
        }
      })
      return member;
    })

    setGroupMembers(updatedGroupMembers);
    const balanceAmount = parseFloat(selectedGroup!.balance_amount) + (
      previousExpenseData.payer_id === currentMember?.group_membership_id ?
        - previousExpenseData.total_debt_amount :
        +(
          previousExpenseData.participants.find((participant) => participant.debtor_id === currentMember?.group_membership_id)?.debtor_amount ?? 0
        )
    ) + (
        expenseData.expense.payer_id === currentMember?.group_membership_id ?
          + debtorAmount :
          -(
            expenseData.expenseParticipants.find((participant) => participant.debtor_id === currentMember?.group_membership_id)?.debtor_amount ?? 0
          )
      )
    selectedGroup!.balance_amount = JSON.stringify(balanceAmount);
    const updatedExpenses = expenses.map((expense) => {
      if ("group_expense_id" in expense && expense.group_expense_id === expenseData.expense.group_expense_id) {
        return expenseData.expense;
      }
      return expense;
    })
    setExpenses(updatedExpenses);
    const updatedCombined = combined.map((item) => {
      if ("group_expense_id" in item && item.group_expense_id === expenseData.expense.group_expense_id) {
        return expenseData.expense;
      }
      return item;
    })
    setCombined(updatedCombined);
  }

  const handleDeleteExpense = (expenseData: GroupExpenseData) => {
    const balanceAmount = parseFloat(selectedGroup!.balance_amount) + (
      expenseData.payer_id === currentMember?.group_membership_id ?
        - expenseData.total_debt_amount :
        +(
          expenseData.participants.find((participant) => participant.debtor_id === currentMember?.group_membership_id)?.debtor_amount ?? 0
        )
    )
    selectedGroup!.balance_amount = JSON.stringify(balanceAmount);
    const wasUserPayer = currentMember?.group_membership_id === expenseData.payer_id;

    const updatedGroupMembers = groupMembers!.map((member) => {
      if (member.group_membership_id === expenseData.payer_id) {
        member.total_balance = JSON.stringify(
          Math.round((parseFloat(member.total_balance) - +expenseData.total_debt_amount) * 100) / 100
        );
        const userDebtAmount = expenseData.participants.find(
          (participant) => participant.debtor_id === currentMember?.group_membership_id
        )?.debtor_amount ?? 0;
        member.balance_with_user = JSON.stringify(
          Math.round((+member.balance_with_user - +userDebtAmount) * 100) / 100
        );
      }

      expenseData.participants.forEach((participant) => {
        if (participant.debtor_id === member.group_membership_id) {
          if (wasUserPayer) {
            member.balance_with_user = JSON.stringify(
              Math.round((+member.balance_with_user + +participant.debtor_amount) * 100) / 100
            );
          }
          member.total_balance = JSON.stringify(
            Math.round((+member.total_balance + +participant.debtor_amount) * 100) / 100
          );
        }
      })
      return member;
    })

    setGroupMembers(updatedGroupMembers);
    const updatedExpenses = expenses.filter((expense) => {
      if ("group_expense_id" in expense && expense.group_expense_id === expenseData.group_expense_id) {
        return false;
      }
      return true;
    })
    setExpenses(updatedExpenses);
    const updatedCombined = combined.filter((item) => {
      if ("group_expense_id" in item && item.group_expense_id === expenseData.group_expense_id) {
        return false;
      }
      return true;
    })
    setCombined(updatedCombined);
  }

  const handleGroupDetailsOpen = (open: boolean) => {
    setScrollHeight(0);
    setGroupDetailsOpen(open);
  }

  const handleCreateGroup = (group: GroupData) => setGroups((prev) => [...prev, group])

  const handleAddMembers = (members: AddMemberResponse["data"]) => {
    setGroupMembers((prev) => [...(prev ?? []), ...members.addedMembers]);
  }

  const handleSearch = (query: string) => {
    const updatedInvites = groupInvites.filter((group) => group.group_name.toLowerCase().includes(query));
    setFilteredGroupInvites(updatedInvites);
    const updatedGroups = groups.filter((group) => group.group_name.toLowerCase().includes(query));
    setFilteredGroups(updatedGroups);
    setQuery(query);
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
            <SearchBar handleSearch={handleSearch} handleCreateGroup={handleCreateGroup} placeholder="Search using group name..." />
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
                  (activeButton === "groups" ? (query ? filteredGroups : groups) : (query ? filteredGroupInvites : groupInvites)).map((group) => {
                    return (
                      <Fragment key={group.group_id}>
                        <ListItem disablePadding alignItems="flex-start" key={group.group_id} onClick={() => {
                          handleSelectGroupData(group);
                        }}>
                          <ListItemButton sx={{ paddingX: 1 }}>
                            <ListItemAvatar sx={{ minWidth: 32, paddingRight: 1 }}>
                              <Avatar alt="Avatar" src={group.image_url ?? "assets/image.png"} sx={{ width: 40, height: 40 }} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box className="flex justify-between content-center items-center">
                                  <Box>{group.group_name}</Box>
                                  <Box className="flex gap-2 items-center" sx={{ color: parseFloat(group.balance_amount) < 0 ? 'red' : 'green' }}>
                                    <Box sx={{ verticalAlign: "middle" }}>
                                      ₹{Math.abs(parseFloat(group.balance_amount))}
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
                    <GroupDetails group={selectedGroup} handleSettlement={handleSettlement} groupMembers={groupMembers!} currentMember={currentMember!} handleGroupDetailsClose={() => handleGroupDetailsOpen(false)} />
                    :
                    <>
                      <Box><Header
                        handleAddGroupMembers={handleAddMembers}
                        handleLeaveGroup={handleLeaveGroup}
                        handleUpdateExpense={handleUpdateExpense}
                        handleDeleteExpense={handleDeleteExpense}
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
                                imageUrl={message.senderImage ?? "assets/image.png"}
                                currentUserImageUrl={user?.image_url ?? "assets/image.png"}
                              />
                            )) : null
                        }
                        {
                          view === "Expenses" ?
                            expenses.map((item) => {
                              if ("group_expense_id" in item) {
                                return (
                                  <ExpenseItem
                                    key={item.group_expense_id}
                                    expense={item}
                                    isCurrentUserPayer={item.payer_id === currentMember?.group_membership_id}
                                    imageUrl={item.payer.imageUrl ?? "assets/image.png"}
                                    currentUserImageUrl={currentMember?.image_url ?? "assets/image.png"}
                                  // onRetryExpenseAddition={handleRetry}
                                  />
                                )
                              }

                              if ("group_settlement_id" in item) {
                                const payer = groupMembers!.find((member) => member.group_membership_id === item.payer_id);
                                const debtor = groupMembers!.find((member) => member.group_membership_id === item.debtor_id);
                                return (
                                  <SettlementCard key={item.group_settlement_id}
                                    isCurrentUserPayer={item.payer_id === currentMember?.group_membership_id}
                                    payerImageUrl={payer!.image_url ?? "assets/image.png"}
                                    payerName={`${payer!.first_name} ${payer!.last_name ?? ''}`}
                                    debtorName={`${debtor!.first_name} ${debtor!.last_name ?? ''}`}
                                    settlement={item}
                                    currentUserImageUrl={currentMember!.image_url ?? "image.png"}
                                  />
                                )
                              }
                            }
                            )
                            : null
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
                                    imageUrl={item.payer.imageUrl ?? "assets/image.png"}
                                    currentUserImageUrl={currentMember?.image_url ?? "assets/image.png"}
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
                                    imageUrl={item.senderImage ?? "assets/image.png"}
                                    currentUserImageUrl={user?.image_url ?? "assets/image.png"}
                                  />
                                )
                              }

                              if ("group_settlement_id" in item) {
                                const payer = groupMembers!.find((member) => member.group_membership_id === item.payer_id);
                                const debtor = groupMembers!.find((member) => member.group_membership_id === item.debtor_id);
                                return (
                                  <SettlementCard key={item.group_settlement_id}
                                    isCurrentUserPayer={item.payer_id === currentMember?.group_membership_id}
                                    payerImageUrl={payer!.image_url ?? "assets/image.png"}
                                    payerName={`${payer!.first_name} ${payer!.last_name ?? ''}`}
                                    debtorName={`${debtor!.first_name} ${debtor!.last_name ?? ''}`}
                                    settlement={item}
                                    currentUserImageUrl={currentMember?.image_url ?? "assets/image.png"}
                                  />
                                )
                              }
                            }
                            )
                            : null
                        }
                      </Box>
                      <Divider />
                      <Box><MessageInput isBlocked={selectedGroup.has_blocked} loader={loaders.addExpense} handleAddExpensesOpen={handleAddExpensesOpen} onSend={onSend} /></Box>
                    </>
                  :
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