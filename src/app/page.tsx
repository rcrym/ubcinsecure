"use client";
import React from "react";
import ReportButton from "@/components/ReportButton";
import ReportsGraph from "@/components/ReportsGraph";
import { useEffect, useState } from "react";

import { analytics } from "@/firebaseConfig";
import { logEvent } from "@firebase/analytics";
import { GiGoose } from "react-icons/gi";
export default function Home() {
    const [isDown, setIsDown] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("VIEW");
        analytics && logEvent(analytics, "page_view");
    }, []);
    return (
        <div className="bg-white dark:bg-gray-950 flex flex-col justify-center items-center h-screen px-5">
            {/* <UptimeTracker/> */}
            <div className="flex justify-center items-baseline  mb-10">
                <span className="text-5xl mb-10 dark:text-white text-gray-800 mr-3 translate-y-0.5">
                    <GiGoose />
                </span>

                <h1 className="text-3xl dark:text-white text-gray-800">
                    Is ubcsecure down?{" "}
                    {loading ? (
                        <span className="text-gray-600 animate-pulse">Hmm</span>
                    ) : isDown ? (
                        <span className="text-red-500">Yes.</span>
                    ) : (
                        <span className="text-green-500">No.</span>
                    )}
                </h1>
            </div>

            <ReportsGraph
                isDown={isDown}
                setIsDown={setIsDown}
                loading={loading}
                setLoading={setLoading}
            />
            {loading ? (
                <div className="w-[200px] h-[40px] dark:bg-gray-900 bg-gray-100 rounded-[5px]" />
            ) : (
                <ReportButton />
            )}
        </div>
    );
}
