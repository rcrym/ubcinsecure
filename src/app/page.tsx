"use client";
import ReportButton from "@/components/ReportButton";
import ReportsGraph from "@/components/ReportsGraph";
import { UptimeTracker } from "@/components/Uptime";
import Image from "next/image";
import { useState } from "react";
import { Text } from "@geist-ui/react";
import Head from "next/head";

export default function Home() {
    const [isDown, setIsDown] = useState(false);
    return (
        <div className="bg-white dark:bg-gray-950 flex flex-col justify-center items-center h-screen px-5">
            {/* <UptimeTracker/> */}

            <h1 className="text-3xl mb-10 dark:text-white text-gray-800">
                Is ubcsecure down?{" "}
                {isDown ? (
                    <span className="text-red-500">Yes.</span>
                ) : (
                    <span className="text-green-500">No.</span>
                )}
            </h1>

            <ReportsGraph setIsDown={setIsDown} />
            <ReportButton />
        </div>
    );
}
