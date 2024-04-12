"use client";
import { database } from "@/firebaseConfig";
import { Report } from "@/types/types";
import { RiRecordCircleFill } from "@remixicon/react";
import { AreaChart, Badge, Card, CustomTooltipProps } from "@tremor/react";
import { onValue, orderByChild, query, ref, startAt } from "firebase/database";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { AnimatedCounter } from "react-animated-counter";
import ThemeSwitcher from "./ThemeSwitcher";
import { ceilToNearestHalfHour, format12HourTime } from "@/utils/formatTime";
interface ReportsGraphProps {
    isDown: boolean;
    setIsDown: Dispatch<SetStateAction<boolean>>;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

const ReportsGraph: React.FC<ReportsGraphProps> = ({
    isDown,
    setIsDown,
    loading,
    setLoading,
}) => {
    type Datapoint = {
        time: string;
        Reports: number;
    };
    const [data, setData] = useState<Datapoint[]>([]);

    const [reportsInLastHalfHour, setReportsInLastHalfHour] = useState<
        number | null
    >(null);
    const [baseline, setBaseline] = useState<number | null>(null);
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const fetchData = () => {
            const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000; // 12 hours ago
            const reportsRef = query(
                ref(database, "reports"),
                orderByChild("timestamp"),
                startAt(twelveHoursAgo)
            );

            onValue(reportsRef, (snapshot) => {
                const rawData = snapshot.val() || {};

                // Set up x axis
                var dataPoints: Datapoint[] = [];
                for (let i = 12 * 60; i >= 0; i = i - 30) {
                    const time = new Date(
                        ceilToNearestHalfHour(Date.now()) - i * 60 * 1000
                    );
                    const formattedTime = format12HourTime(time);
                    dataPoints.push({
                        time: formattedTime,
                        Reports: 0,
                    });
                }

                // Turn Firebase snapshot val into array
                let reportsArray = Object.values(rawData);

                // Count the number of reports in the last half hour
                setReportsInLastHalfHour(
                    reportsArray.filter(
                        (report: any) =>
                            Date.now() -
                                (report.timestamp as Report["timestamp"]) <
                            30 * 60 * 1000
                    ).length
                );

                // For each report, increment the matching time interval in dataPoints
                reportsArray.forEach((report: any) => {
                    const reportTime = new Date(
                        ceilToNearestHalfHour(report.timestamp)
                    );
                    const formattedReportTime = format12HourTime(reportTime);

                    let dataPointToIncrementIndex = dataPoints.findIndex(
                        (item) => item.time == formattedReportTime
                    );
                    if (dataPointToIncrementIndex) {
                        dataPoints[dataPointToIncrementIndex].Reports++;
                        // dataPoints[Math.floor(Math.random() * dataPoints.length)].Reports+= Math.floor(Math.random() ** 9 * 10);
                    }
                });

                // Remove the dataPoint that is the current interval
                dataPoints.pop();

                // Calculate baseline
                // let sum = dataPoints.reduce((acc, dataPoint) => {
                //     return acc + dataPoint.Reports;
                // }, 0);
                // let average = sum / dataPoints.length;
                // let baselineCalced = Math.floor(average * 1.1 + 2);
                // setBaseline(baselineCalced);

                // Step 1: Calculate the mean
                let sum = dataPoints.reduce(
                    (acc: number, dataPoint: Datapoint) =>
                        acc + dataPoint.Reports,
                    0
                );
                let mean = sum / dataPoints.length;

                // Step 2: Calculate the standard deviation
                let varianceSum = dataPoints.reduce(
                    (acc: number, dataPoint: Datapoint) =>
                        acc + Math.pow(dataPoint.Reports - mean, 2),
                    0
                );
                let variance = varianceSum / dataPoints.length;
                let stdDeviation = Math.sqrt(variance);

                // Step 3: Set the baseline as mean + (multiplier * standard deviation) + adjustment factor
                // The multiplier can be adjusted based on desired sensitivity
                const multiplier = 1.3; // This is adjustable
                const minimum = 10;
                let baselineCalced = Math.max(
                    Math.floor(mean + multiplier * stdDeviation),
                    minimum
                );

                // Set the baseline
                setBaseline(baselineCalced);

                // Add baseline to all points in dataPoints
                dataPoints = dataPoints.map((dataPoint) => ({
                    Baseline: baselineCalced,
                    ...dataPoint,
                }));

                // Set and display the dataPoints
                if (dataPoints.length !== 0) {
                    setData(dataPoints);
                    setLoading(false);
                }
            });
        };

        // Call fetchData immediately to load data on component mount
        fetchData();
        // Set up an interval to fetch data every minute
        const intervalId = setInterval(fetchData, 5 * 1000);

        // Return a cleanup function that clears the interval
        return () => clearInterval(intervalId);
    }, [setIsDown, setLoading]);

    // useEffect(() => {

    //     // every 1 min fetch refresh
    // }, []);

    useEffect(() => {
        if (baseline && reportsInLastHalfHour) {
            // Set ubcsecure is down if the number of reports in the last half hour
            // is greater than the baseline number of reports
            setIsDown(reportsInLastHalfHour > baseline);
        }
    }, [reportsInLastHalfHour, setIsDown, baseline]);

    useEffect(() => {
        setIsOnline(window.navigator.onLine);

        const handleOnlineStatus = () => {
            setIsOnline(window.navigator.onLine);
        };

        window.addEventListener("online", handleOnlineStatus);
        window.addEventListener("offline", handleOnlineStatus);

        return () => {
            window.removeEventListener("online", handleOnlineStatus);
            window.removeEventListener("offline", handleOnlineStatus);
        };
    }, []);

    const customTooltip = (props: CustomTooltipProps) => {
        const { payload, active } = props;
        if (!active || !payload) return null;
        return (
            // <div className="w-56 rounded-tremor-default border border-tremor-border bg-tremor-background p-2 text-tremor-default shadow-tremor-dropdown">
            //     {payload.map((category: any, idx: number) => (
            //         <div key={idx} className="flex flex-1 space-x-2.5">
            //             <div
            //                 className={`flex w-1 flex-col bg-${category.color}-500 rounded`}
            //             />
            //             <div className="space-y-1">
            //                 <p className="text-tremor-content">
            //                     {category.dataKey}
            //                 </p>
            //                 <p className="font-medium text-tremor-content-emphasis">
            //                     {category.value} bpm
            //                 </p>
            //             </div>
            //         </div>
            //     ))}
            // </div>
            <div className="rounded-tremor-default text-tremor-default border bg-tremor-background shadow-tremor-dropdown border-tremor-border dark:bg-dark-tremor-background dark:shadow-dark-tremor-dropdown dark:border-dark-tremor-border">
                <div className="w-full border-tremor-border border-b px-4 py-2 dark:border-dark-tremor-border flex justify-between">
                    <span className="font-medium text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
                        {payload[0].payload.time}
                    </span>
                    {payload[0].value &&
                    payload[1].value &&
                    payload[0].value > payload[1].value ? (
                        <span className="text-red-500">Yes.</span>
                    ) : (
                        <span className="text-green-500">No.</span>
                    )}
                </div>

                <div className="px-4 py-2 space-y-1">
                    {payload.map((category, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between space-x-8"
                        >
                            <div className="flex items-center space-x-2">
                                {idx == 0 ? (
                                    <span className="shrink-0 rounded-tremor-full border-2 h-3 w-3 border-tremor-background shadow-tremor-card dark:border-dark-tremor-background dark:shadow-dark-tremor-card bg-[#0070f3]"></span>
                                ) : (
                                    <span className="shrink-0 rounded-tremor-full border-2 h-3 w-3 border-tremor-background shadow-tremor-card dark:border-dark-tremor-background dark:shadow-dark-tremor-card bg-gray-500"></span>
                                )}
                                <p className="text-right whitespace-nowrap text-tremor-content dark:text-dark-tremor-content">
                                    {category.dataKey}
                                </p>
                            </div>
                            <p className="font-medium tabular-nums text-right whitespace-nowrap text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
                                {category.value}
                            </p>
                        </div>
                    ))}
                    {/* <div className="flex items-center justify-between space-x-8">
                        <div className="flex items-center space-x-2">
                            <span className="shrink-0 rounded-tremor-full border-2 h-3 w-3 border-tremor-background shadow-tremor-card dark:border-dark-tremor-background dark:shadow-dark-tremor-card bg-gray-500"></span>
                            <p className="text-right whitespace-nowrap text-tremor-content dark:text-dark-tremor-content">
                                Baseline
                            </p>
                        </div>
                        <p className="font-medium tabular-nums text-right whitespace-nowrap text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
                            6
                        </p>
                    </div> */}
                </div>
            </div>
        );
    };

    return (
        <Card className="w-full max-w-6xl mb-5 bg-white dark:bg-gray-950">
            <div className="flex items-center">
                <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mr-2">
                    Issues Reported in Last 30 Minutes
                </h3>
                {loading || !isOnline ? (
                    <Badge className="invisible" icon={RiRecordCircleFill}>
                        live
                    </Badge>
                ) : (
                    <Badge color={"#0070f3"} icon={RiRecordCircleFill}>
                        live
                    </Badge>
                )}
                <div className="ml-auto">
                    <ThemeSwitcher />
                </div>
            </div>

            {!isDown && reportsInLastHalfHour !== null && (
                <div className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
                    <AnimatedCounter
                        decimalPrecision={0}
                        includeCommas
                        value={reportsInLastHalfHour}
                        color={"text-tremor-content-strong"}
                        incrementColor="text-tremor-content-strong"
                        decrementColor="text-tremor-content-strong"
                        fontSize="30px"
                    />
                </div>
            )}
            {isDown && reportsInLastHalfHour !== null && (
                <div className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
                    <AnimatedCounter
                        decimalPrecision={0}
                        includeCommas
                        value={reportsInLastHalfHour}
                        color={"#ef4444"}
                        incrementColor="text-tremor-content-strong"
                        decrementColor="text-tremor-content-strong"
                        fontSize="30px"
                    />
                </div>
            )}
            {!!(reportsInLastHalfHour == null || loading) && (
                <div className="h-[30px] invisible">0</div>
            )}

            {!loading ? (
                <AreaChart
                    className="h-72 bg-white dark:bg-gray-950"
                    data={data}
                    index="time"
                    categories={["Reports", "Baseline"]}
                    colors={["#0070f3", "gray"]}
                    yAxisWidth={30}
                    showAnimation
                    customTooltip={customTooltip}
                />
            ) : (
                <div className="h-72 w-full flex justify-center items-center">
                    <p className="text-gray-600 animate-pulse">Loading...</p>
                </div>
            )}
        </Card>
    );
};

export default ReportsGraph;
