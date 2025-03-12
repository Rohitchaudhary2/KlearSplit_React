import { Box, Paper, Stack, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { PieChart, BarChart } from '@mui/x-charts';

const DashboardPage = () => {
    const firstDiv = useRef<HTMLDivElement | null>(null)
    const fifthDiv = useRef<HTMLDivElement | null>(null)
    const [width, setWidth] = useState(0);
    const balanceAmount = -1000;
    const colors = ["#3674B5", "#578FCA","#A1E3F9", "#D1F8EF", "#5B9279", "#27AE60", "#2E7D32","#C62828","#E74C3C", "#FFB400", "#8E44AD","#6A0DAD"]
    useEffect(() => {
        console.log("jhgf");
        
        setWidth(firstDiv.current!.offsetWidth)
    }, [firstDiv.current?.offsetWidth])
    return (
        <>
            <Box className="flex flex-wrap gap-4 justify-center" p={3}>

                <div className="grow" ref={firstDiv}>
                    <Paper sx={{ minHeight: 250 }} elevation={5}>
                        <Stack sx={{ alignItems: "center" }}>
                            <Typography variant="h6" sx={{ paddingTop: 1, color: "#3674B5" }} >Number of Expenses by Amount Range</Typography>

                            <PieChart
                                margin={{ left: -20 }}
                                series={[
                                    {
                                        data: [
                                            { id: 0, value: 10, label: '0-1000', color: "#C79FEF" },
                                            { id: 1, value: 15, label: '1000-5000', color: "#578FCA" },
                                            { id: 2, value: 20, label: '5000-10000', color: "#A1E3F9" },
                                            { id: 3, value: 20, label: '10000-15000', color: "#D1F8EF" },
                                            { id: 4, value: 20, label: '15000+', color: "#9370DB" },
                                        ],
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
                                            fill: '#3674B5',
                                        },
                                    }
                                }}
                            />
                        </Stack>
                    </Paper>
                </div>
                <div className="grow">
                    <Paper sx={{ minHeight: 250 }} elevation={5}>
                        <Stack sx={{ alignItems: "center" }}>
                            <Typography variant="h6" sx={{ paddingTop: 1, color: (balanceAmount < 0) ? "#E74C3C" : "#27AE60"}} >Balance Amount: {balanceAmount}</Typography>
                            <PieChart
                                margin={{ left: -20 }}
                                series={[
                                    {
                                        data: [
                                            { id: 0, value: 10, label: 'Amount Lent', color: "#27AE60" },
                                            { id: 1, value: 15, label: 'Amount Borrowed', color: "#E74C3C" }
                                        ],
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
                                            fill: '#3674B5',
                                        },
                                    }
                                }}
                            />
                        </Stack>
                    </Paper></div>
                <div className="grow"><Paper sx={{ minHeight: 250   }} elevation={5}>
                    <Stack sx={{ alignItems: "center" }}>
                        <Typography variant="h6" sx={{ paddingTop: 1, color: "#3674B5" }} >Top Cash Flow Partners</Typography>

                        <PieChart
                            margin={{ left: -20 }}
                            series={[
                                {
                                    data: [
                                        { id: 0, value: 10, label: 'Friend 1', color: "#C79FEF" },
                                        { id: 1, value: 15, label: '1000-5000', color: "#578FCA" },
                                        { id: 2, value: 20, label: '5000-10000', color: "#A1E3F9" },
                                        { id: 3, value: 20, label: '10000-15000', color: "#D1F8EF" },
                                        { id: 4, value: 20, label: '15000+', color: "#9370DB" },
                                    ],
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
                                        fill: '#3674B5',
                                    },
                                }
                            }}
                        />
                    </Stack>
                </Paper></div>
                <div><Paper sx={{ minHeight: 250, minWidth: { width }, maxWidth: { width } }} elevation={5}>
                    <Stack sx={{ alignItems: "center" }}>
                        <Typography variant="h6" sx={{ paddingTop: 1, color: "#3674B5" }} >Top Cash Flow Groups </Typography>

                        <PieChart
                            margin={{ left: -20 }}
                            series={[
                                {
                                    data: [
                                        { id: 0, value: 10, label: '0-1000', color: "#C79FEF" },
                                        { id: 1, value: 15, label: '1000-5000', color: "#578FCA" },
                                        { id: 2, value: 20, label: '5000-10000', color: "#A1E3F9" },
                                        { id: 3, value: 20, label: '10000-15000', color: "#D1F8EF" },
                                        { id: 4, value: 20, label: '15000+', color: "#9370DB" },
                                    ],
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
                                        fill: '#3674B5',
                                    },
                                }
                            }}
                        />
                    </Stack>
                </Paper></div>
                <div className="grow" ref={fifthDiv}><Paper sx={{minHeight: 250 }} elevation={5}>
                <Stack sx={{ alignItems: "center" }}>
                <Typography variant="h6" sx={{ paddingTop: 1, color: "#3674B5" }} >Monthly Expense </Typography>
                    <BarChart
                        series={[
                            {
                                data: [35, 44, 24, 34, 100, 45, 98, 45, 25, 26, 74, 12], label: 'Monthly Expense', color: "#9370DB" }]
                            }
                        height = {210}
                        slotProps={{ legend: { hidden: true } }}
                        width={Math.min(Math.max(fifthDiv.current?.offsetWidth ?? 0, firstDiv.current?.offsetWidth ?? 0), width * 2)}
                        xAxis = { [{ data: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'], scaleType: 'band' }]}
                        margin = {{ top: 10, bottom: 30, left: 40, right: 10 }}
                    />
                </Stack>
                </Paper></div>
            </Box>
        </>
    )
}

export default DashboardPage