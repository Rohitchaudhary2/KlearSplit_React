import { Avatar, Box, Button, ButtonGroup, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Stack, Typography } from "@mui/material"
import SearchBar from "../shared/search-bar"
import { useEffect, useRef, useState } from "react";
import Header from "./header";
import MessageInput from "./input";
import MessageItem from "./message";
import ExpenseItem from "./expense";
import Badge from '@mui/joy/Badge';
import AddExpense from "./addExpense";

const Friendspage = () => {
  const [activeButton, setActiveButton] = useState("friends");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageContainer = useRef<HTMLDivElement | null>(null);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  };
  useEffect(() => {
    scrollToBottom()
  }, [messageContainer.current])

  const handleViewChange = (view: string) => setActiveButton(view);
  const onSend = (message: string) => {
    console.log(message);
  }
  const handleAddExpensesClose = () => setAddExpenseDialogOpen(false);
  const handleAddExpensesOpen = () => setAddExpenseDialogOpen(true);
  const expenses = [
    {
      expense_id: "exp123",
      expense_name: "Dinner",
      total_amount: "$45",
      debtor_amount: "$15",
      createdAt: "10:30 PM",
      payer: "John Doe",
      payerImage: "/profile.png",
    updatedAt: "string",
    payer_id: "kjh"
    },
    {
      expense_id: "adding456",
      expense_name: "Movie Tickets",
      total_amount: "$30",
      debtor_amount: "$10",
      createdAt: "8:15 PM",
      payer: "Jane Doe",
      payerImage: "/profile.png",
    updatedAt: "string",
    payer_id: "kjh"
    },
    {
      expense_id: "error789",
      expense_name: "Groceries",
      total_amount: "$75",
      debtor_amount: "$25",
      createdAt: "6:00 PM",
      payer: "You",
      payerImage: "/profile.png",
    updatedAt: "string",
    payer_id: "kjh"

    },
  ];
  return (
    <>
    <AddExpense open={addExpenseDialogOpen} handleAddExpensesClose={handleAddExpensesClose}/>
      <Box className="grid gap-4 grid-cols-4 h-[89.5vh]">
        <Box className="p-4 pe-0 flex flex-col flex-wrap h-full col-span-4 md:col-span-1" hidden={false} sx={{ backgroundColor: "#A1E3F9" }}>
          <Box className="pb-4">
            <SearchBar placeholder="Search using email..." />
          </Box>
          <Box className="grow flex flex-col rounded-lg shadow-md m-0 p-0 max-w-full" sx={{ backgroundColor: "white" }}>
            <Paper className="rounded-lg" elevation={5}>
              <ButtonGroup variant="outlined" fullWidth className="grid" aria-label="Basic button group">
                <Button onClick={() => handleViewChange("friends")} variant={activeButton === "friends" ? "contained" : "outlined"} className="w-1/2"
                  sx={{ borderRadius: "4px 0px 0px 0px" }}
                >Friends</Button>
                < Button onClick={() => handleViewChange("requests")} variant={activeButton === "requests" ? "contained" : "outlined"} className="w-1/2"
                  sx={{ borderRadius: "0px 4px 0px 0px" }}
                >
                <Badge badgeContent={4} size="sm" badgeInset="-22%">
                  Requests
                </Badge>
                  </Button>
              </ButtonGroup>
              <List dense className="max-h-[70.2vh] overflow-y-auto overflow-x-auto " sx={{ width: '100%', padding: 0, bgcolor: 'background.paper', borderRadius: "0px 0px 8px 8px" }}>
                <Divider />
                {
                  [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                    return (
                      <>
                        <ListItem disablePadding alignItems="flex-start" key={index}>
                          <ListItemButton sx={{ paddingX: 1 }}>
                            <ListItemAvatar sx={{ minWidth: 32, paddingRight: 1 }}>
                              <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box className="flex justify-between">
                                  <Box>Rohit Chaudhary</Box>
                                  <Box>1000</Box>
                                </Box>
                              }
                              secondary={
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{ color: 'text.primary', display: 'inline' }}
                                >
                                  sdesdewdwsit@gmail.com
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
            <Box><Header /></Box>
            <Divider />
            <Box ref={messageContainer} className="h-[67vh] overflow-auto">
            <MessageItem
              message={{ text: "ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg", createdAt: "10:45 AM" }}
              isCurrentUser={false}
              name="John Doe"
              imageUrl="/vite.svg"
              currentUserImageUrl="/vite.svg"
            />
            <ul className="space-y-3">
          {expenses.map((expense, index) => (
            <ExpenseItem
              key={index}
              expense={expense}
              isCurrentUserPayer={expense.payer === "You"}
              imageUrl="vite.svg"
              currentUserImageUrl="vite.svg"
              name={expense.payer}
              // onRetryExpenseAddition={handleRetry}
            />
          ))}
        </ul>
            <MessageItem
              message={{ text: "I'm good, thanks!", createdAt: "10:46 AM" }}
              isCurrentUser={true}
              name="You"
              imageUrl="/vite.svg"
              currentUserImageUrl="/vite.svg"
            />
            <Box ref={messagesEndRef}/>
            </Box>
            <Divider />
            <Box><MessageInput handleAddExpensesOpen={handleAddExpensesOpen} onSend={onSend} /></Box>
          </Stack>
          </Paper>
        </Box>
      </Box>
    </>
  )
}

export default Friendspage