"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AreaChart, Badge, Card, Title } from "@tremor/react";
import { onValue, ref, query, orderByChild, startAt } from "firebase/database";
import { database } from "../firebaseConfig";
import { Report } from "../types/types";
import { RiRecordCircleFill } from "@remixicon/react";

import { AnimatedCounter } from "react-animated-counter";
interface ReportsGraphProps {
    setIsDown: Dispatch<SetStateAction<boolean>>;
}

const ReportsGraph: React.FC<ReportsGraphProps> = ({ setIsDown }) => {
    type Datapoint = {
        time: string;
        Reports: number;
    };
    const [data, setData] = useState<Datapoint[]>([]);

    const [reportsInLastHalfHour, setReportsInLastHalfHour] = useState<
        number | null
    >(null);
    const [baseline, setBaseline] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    function format12HourTime(date: Date): string {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        let minutesStr = minutes.toString().padStart(2, "0");

        let date2 = new Date(date.getTime() - 30 * 60 * 1000);
        let hours2 = date2.getHours();
        let minutes2 = date2.getMinutes();
        let ampm2 = hours2 >= 12 ? "PM" : "AM";
        hours2 = hours2 % 12;
        hours2 = hours2 ? hours2 : 12; // the hour '0' should be '12'
        let minutesStr2 = minutes2.toString().padStart(2, "0");

        let formattedTime = `${hours}:${minutesStr} ${ampm}`;
        return formattedTime;
    }
    function floorToNearestHalfHour(timestamp: number): number {
        const millisecondsPerHalfHour = 30 * 60 * 1000; // Milliseconds in half an hour
        const floored =
            Math.floor(timestamp / millisecondsPerHalfHour) *
            millisecondsPerHalfHour;
        return floored;
    }
    function ceilToNearestHalfHour(timestamp: number): number {
        const millisecondsPerHalfHour = 30 * 60 * 1000; // Milliseconds in half an hour
        const ceiled =
            Math.ceil(timestamp / millisecondsPerHalfHour) *
            millisecondsPerHalfHour;
        return ceiled;
    }

    useEffect(() => {
        const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000; // 12 hours ago
        const reportsRef = query(
            ref(database, "reports"),
            orderByChild("timestamp"),
            startAt(twelveHoursAgo)
        );

        // for (let i = 12 * 60; i >= 0; i--) {
        //     //             // For each 10-minute interval in the last 12 hours
        //     // const time = new Date(twelveHoursAgo + i * 60 * 60 * 1000);
        //     const time = new Date(Date.now() - i * 60 * 1000);
        //     const formattedTime = format12HourTime(time);
        //     console.log(formattedTime);
        //     //             // Initialize data points for each 10-minute interval
        //     //             dataPoints.push({
        //     //                 time: formattedTime,
        //     //                 Reports: 0,
        //     //             });
        // }
        console.log("RERENDER");
        onValue(reportsRef, (snapshot) => {
            console.log("new value");
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
                        Date.now() - (report.timestamp as Report["timestamp"]) <
                        30 * 60 * 1000
                ).length
            );

            // For each report, increment the matching time interval in dataPoints
            reportsArray.forEach((report: any) => {
                const reportTime = new Date(
                    ceilToNearestHalfHour(report.timestamp)
                );
                const formattedReportTime = format12HourTime(reportTime);
                console.log(formattedReportTime);
                let dataPointToIncrementIndex = dataPoints.findIndex(
                    (item) => item.time == formattedReportTime
                );
                if (dataPointToIncrementIndex) {
                    dataPoints[dataPointToIncrementIndex].Reports++;
                }
            });

            // Remove the dataPoint that is the current interval
            dataPoints.pop();

            // Calculate baseline
            let sum = dataPoints.reduce((acc, dataPoint) => {
                return acc + dataPoint.Reports;
            }, 0);
            let average = sum / dataPoints.length;
            setBaseline(average);

            // Add baseline to all points in dataPoints
            dataPoints = dataPoints.map((dataPoint) => ({
                Baseline: Math.floor(average),
                ...dataPoint,
            }));

            // Set and display the dataPoints
            if (dataPoints.length !== 0) {
                setData(dataPoints);
                setLoading(false);
            }
        });
    }, [setIsDown]);

    useEffect(() => {
        if (baseline && reportsInLastHalfHour) {
            // Set ubcsecure is down if the number of reports in the last half hour
            // is greater than the baseline number of reports
            setIsDown(reportsInLastHalfHour > baseline);
        }
    }, [reportsInLastHalfHour, setIsDown, baseline]);

    return (
        <Card className="w-full max-w-6xl mb-5">
            <div className="flex items-center">
                <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mr-2">
                    Issues Reported in Last 30 Minutes
                </h3>

                <Badge color={"#0070f3"} icon={RiRecordCircleFill}>
                    live
                </Badge>
            </div>

            {reportsInLastHalfHour !== null && (
                <div className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
                    <AnimatedCounter
                        decimalPrecision={0}
                        includeCommas
                        value={reportsInLastHalfHour}
                        color="text-tremor-content-strong"
                        incrementColor="text-tremor-content-strong"
                        fontSize="30px"
                    />
                </div>
            )}
            {(reportsInLastHalfHour == null || loading) && (
                <div className="h-[30px]">1</div>
            )}

            {!loading ? (
                <AreaChart
                    className="h-72 bg-white dark:bg-gray-900"
                    data={data}
                    index="time"
                    categories={["Reports", "Baseline"]}
                    colors={["#0070f3", "gray"]}
                    yAxisWidth={30}
                    showAnimation
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
