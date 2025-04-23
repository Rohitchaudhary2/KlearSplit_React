import { Box, FormControl, MenuItem, Paper, Select, SelectChangeEvent, Stack, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { PieChart, BarChart, axisClasses } from '@mui/x-charts';
import classes from "./index.module.css"
import { handleBalanceAmounts, handleCashFlowFriends, handleCashFlowGroups, handleExpensesCount, handleMonthlyExpenses } from "./services";

interface PieChartData {
    id: number,
    value: number,
    label: string,
    color: string
}

const DashboardPage = () => {
    const firstDiv = useRef<HTMLDivElement | null>(null)
    const [width, setWidth] = useState(1000);
    const [loaders, setLoaders] = useState({
        expenseCount: true,
        balance: true,
        cashFlowPartners: true,
        cashFlowGroups: true,
        monthlyExpenses: true
    });
    const [expensesCount, setExpensesCount] = useState<PieChartData[]>([]);
    const [balanceAmount, setBalanceAmount] = useState(0);
    const [balanceAmounts, setBalanceAmounts] = useState<PieChartData[]>([]);
    const [topCashFlowPartners, setTopCashFlowPartners] = useState<PieChartData[]>([]);
    const [topCashFlowGroups, setTopCashFlowGroups] = useState<PieChartData[]>([]);
    const [monthlyExpenses, setMonthlyExpenses] = useState<number[]>([]);
    const pieChartColors = ["#C79FEF", "#578FCA", "#A1E3F9", "#D1F8EF", "#9370DB"];
    const [year, setYear] = useState(2025);
    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    useEffect(() => {
        const updateWidth = () => {
            if (firstDiv.current) {
                setWidth(firstDiv.current.offsetWidth);
            }
        };
        const getExpensesCount = async () => {
            const data = await handleExpensesCount();

            setLoaders((prev) => ({ ...prev, expenseCount: false }));
            if (!data) return;
            setExpensesCount(data.data.data.map((value: number, index: number) => ({
                id: index,
                value,
                label: ["0-1000", "1000-5000", "5000-10000", "10000-15000", "15000+"][index],
                color: pieChartColors[index]
            })));
        }
        const getBalance = async () => {
            const data = await handleBalanceAmounts();
            setLoaders((prev) => ({ ...prev, balance: false }));
            if (!data) return;

            setBalanceAmounts(data.data.data.map((value: number, index: number) => ({
                id: index,
                value,
                label: ["Amount Lent", "Amount Borrowed"][index],
                color: ["#27AE60", "#E74C3C"][index]
            })));

            setBalanceAmount(
                Math.round((data.data.data[0] - data.data.data[1]) * 100) / 100
            );

        }
        const getCashFlowFriends = async () => {
            const data = await handleCashFlowFriends();
            setLoaders((prev) => ({ ...prev, cashFlowPartners: false }));
            if (!data) return;

            const response: { amount: number; friend: string }[] = Object.values(data.data.data);

            setTopCashFlowPartners(response.map((val: { amount: number, friend: string }, index: number) => ({
                id: index,
                value: val.amount,
                label: val.friend,
                color: pieChartColors[index]
            })));
        }
        const getCashFlowGroups = async () => {
            const data = await handleCashFlowGroups();
            setLoaders((prev) => ({ ...prev, cashFlowGroups: false }));
            if (!data) return;

            const response: { amount: number; group: string }[] = Object.values(data.data.data);

            setTopCashFlowGroups(response.map((val: { amount: number, group: string }, index: number) => ({
                id: index,
                value: val.amount,
                label: val.group,
                color: pieChartColors[index]
            })));
        }
        getExpensesCount()
        getBalance()
        getCashFlowFriends()
        getCashFlowGroups()

        updateWidth();

        // Add event listener for window resize
        window.addEventListener("resize", updateWidth);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener("resize", updateWidth);
        };
    }, [])
    useEffect(() => {
        const getMonthlyexpenses = async () => {
            const data = await handleMonthlyExpenses(year);
            setLoaders((prev) => ({ ...prev, monthlyExpenses: false }));
            if (!data) return;
            setMonthlyExpenses(data.data.data);
        }
        getMonthlyexpenses();
    }, [year])
    const handleYearChange = async (e: SelectChangeEvent) => {
        setYear(parseInt(e.target.value))
    }
    return (
        <>
            <Box className="flex flex-wrap gap-4 justify-center" p={3}>
                <div className="grow" ref={firstDiv}>
                    <Paper sx={{ minHeight: 250, position: "relative" }} elevation={5}>
                        {loaders.expenseCount && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    background: 'rgba(255, 255, 255, 1)',
                                    zIndex: 10,
                                }}
                            >
                                <section className={classes["dots-container"]}>
                                    <div className={classes.dot}></div>
                                    <div className={classes.dot}></div>
                                    <div className={classes.dot}></div>
                                    <div className={classes.dot}></div>
                                    <div className={classes.dot}></div>
                                </section>
                            </Box>
                        )}
                        <Stack sx={{ alignItems: "center" }}>
                            <Typography variant="h6" sx={{ paddingTop: 1, color: "#3674B5" }} >Number of Expenses by Amount Range</Typography>
                            <PieChart
                                margin={{ left: -20 }}
                                series={[
                                    {
                                        data: expensesCount
                                    },
                                ]}
                                width={400}
                                height={200}
                                slotProps={{
                                    legend: {
                                        padding: { right: 20, bottom: 5 },
                                        position: {
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        },
                                        itemMarkWidth: 20,
                                        itemMarkHeight: 12,
                                        markGap: 5,
                                        itemGap: 10,
                                        labelStyle: {
                                            fontSize: 10,

                                        },
                                    }
                                }}
                            />
                        </Stack>
                    </Paper>
                </div>
                <div className="grow">
                    <Paper sx={{ minHeight: 250, position: "relative" }} elevation={5}>
                        {loaders.balance && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    background: 'rgba(255, 255, 255, 1)',
                                    zIndex: 10,
                                }}
                            >
                                <section className={classes["dots-container"]}>
                                    <div className={classes.dot}></div>
                                    <div className={classes.dot}></div>
                                    <div className={classes.dot}></div>
                                    <div className={classes.dot}></div>
                                    <div className={classes.dot}></div>
                                </section>
                            </Box>
                        )}
                        <Stack sx={{ alignItems: "center" }}>
                            <Typography variant="h6" sx={{ paddingTop: 1, color: (balanceAmount < 0) ? "#E74C3C" : "#27AE60" }} >Balance Amount: {balanceAmount}</Typography>
                            <PieChart
                                margin={{ left: -20 }}
                                series={[
                                    {
                                        data: balanceAmounts,
                                        innerRadius: 45,
                                        outerRadius: 100,
                                        paddingAngle: 2,
                                        cornerRadius: 5
                                    },
                                ]}
                                width={400}
                                height={200}
                                slotProps={{
                                    legend: {
                                        padding: { right: 20, bottom: 5 },
                                        position: {
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        },
                                        itemMarkWidth: 20,
                                        itemMarkHeight: 12,
                                        markGap: 5,
                                        itemGap: 10,
                                        labelStyle: {
                                            fontSize: 10,

                                        },
                                    }
                                }}
                            />
                        </Stack>
                    </Paper></div>
                <div className="grow"><Paper sx={{ minHeight: 250, position: "relative" }} elevation={5}>
                    {loaders.cashFlowPartners && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'rgba(255, 255, 255, 1)',
                                zIndex: 10,
                            }}
                        >
                            <section className={classes["dots-container"]}>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                            </section>
                        </Box>
                    )}
                    <Stack sx={{ alignItems: "center" }}>
                        <Typography variant="h6" sx={{ paddingTop: 1, color: "#3674B5" }} >Top Cash Flow Partners</Typography>

                        <PieChart
                            margin={{ left: -20 }}
                            series={[
                                {
                                    data: topCashFlowPartners
                                },
                            ]}
                            width={400}
                            height={200}
                            slotProps={{
                                legend: {
                                    padding: { right: 20, bottom: 5 },
                                    position: {
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    },
                                    itemMarkWidth: 20,
                                    itemMarkHeight: 12,
                                    markGap: 5,
                                    itemGap: 10,
                                    labelStyle: {
                                        fontSize: 10,

                                    },
                                }
                            }}
                        />
                    </Stack>
                </Paper></div>
                <div><Paper sx={{ minHeight: 250, position: "relative", minWidth: { width }, maxWidth: { width } }} elevation={5}>
                    {loaders.cashFlowGroups && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'rgba(255, 255, 255, 1)',
                                zIndex: 10,
                            }}
                        >
                            <section className={classes["dots-container"]}>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                            </section>
                        </Box>
                    )}
                    <Stack sx={{ alignItems: "center" }}>
                        <Typography variant="h6" sx={{ paddingTop: 1, color: "#3674B5" }} >Top Cash Flow Groups </Typography>

                        <PieChart
                            margin={{ left: -20 }}
                            series={[
                                {
                                    data: topCashFlowGroups
                                },
                            ]}
                            width={400}
                            height={200}
                            slotProps={{
                                legend: {
                                    padding: { right: 20, bottom: 5 },
                                    position: {
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    },
                                    itemMarkWidth: 20,
                                    itemMarkHeight: 12,
                                    markGap: 5,
                                    itemGap: 10,
                                    labelStyle: {
                                        fontSize: 10,

                                    },
                                }
                            }}
                        />
                    </Stack>
                </Paper></div>
                <div className="flex-1"><Paper sx={{ minHeight: 250, position: "relative" }} elevation={5}>
                    {loaders.monthlyExpenses && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'rgba(255, 255, 255, 1)',
                                zIndex: 10,
                            }}
                        >
                            <section className={classes["dots-container"]}>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                                <div className={classes.dot}></div>
                            </section>
                        </Box>
                    )}
                    <Stack sx={{ alignItems: "end" }}>
                        <div className="flex justify-center items-center">
                            <Typography variant="body2" sx={{ paddingTop: 1, color: "#3674B5" }} >Monthly Expenses for</Typography>
                            <FormControl sx={{ paddingTop: 1, paddingX: 1 }} size="small">
                                <Select
                                    id="year-select"
                                    value={year.toString()}
                                    onChange={handleYearChange}
                                    sx={{ fontSize: "0.875rem", lineHeight: 1.43, fontWeight: 400, "& .MuiSelect-select": { paddingY: "0px !important" } }}
                                >
                                    {years.map((year) => <MenuItem key={year} value={year} sx={{ fontSize: "0.875rem" }}>{year}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </div>
                        <BarChart
                            series={[
                                {
                                    data: monthlyExpenses, label: 'Monthly Expense', color: "#9370DB"
                                }]
                            }
                            height={210}
                            slotProps={{ legend: { hidden: true } }}
                            xAxis={[{ data: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'], scaleType: 'band', sx: { ".MuiChartsAxis-line": { stroke: "#3674B5" }, ".MuiChartsAxis-tick": { stroke: "#3674B5" } } }]}
                            yAxis={[{
                                label: "Expense(in rupees)",
                                scaleType: "linear",
                                sx: { ".MuiChartsAxis-line": { stroke: "#3674B5" }, ".MuiChartsAxis-tick": { stroke: "#3674B5" } }
                            }]}
                            {
                            ...{
                                sx: {
                                    [`.${axisClasses.left} .${axisClasses.label}`]: {
                                        transform: 'translate(-24px, 0)',
                                    },
                                },
                            }
                            }
                            margin={{ top: 10, bottom: 30, left: Math.max(...monthlyExpenses).toString().length * 2 + 30, right: 10 }}
                        />
                    </Stack>
                </Paper></div>
            </Box>
        </>
    )
}

export default DashboardPage