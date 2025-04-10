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
    const [ctaVisible, setCtaVisible] = useState(false);

    useEffect(() => {
        analytics && logEvent(analytics, "page_view");
    }, []);

    useEffect(() => {
        if (!loading) {
            const timeout = setTimeout(() => {
                setCtaVisible(true);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [loading]);

    return (
        <div className="bg-white dark:bg-gray-950 flex flex-col justify-center items-center h-screen px-5">
            {/* <UptimeTracker/> */}
            <div className="flex justify-center items-baseline  mb-10">
                <span className="text-5xl mb-10 dark:text-white text-gray-800 mr-3 translate-y-1.5">
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

            <a
                href="https://chatubc.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                    analytics && logEvent(analytics, "chatubc_click");
                }}
                className={`group mt-6 px-6 py-2 flex items-center justify-between rounded-xl border text-sm sm:text-base font-medium ${
                    ctaVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{
                    borderColor: "#0070f3",
                    color: "#0070f3",
                    backgroundColor: "rgba(0, 112, 243, 0.08)",
                    opacity: ctaVisible ? 1 : 0,
                    transform: ctaVisible
                        ? "translateY(0px)"
                        : "translateY(8px)",
                    transition: ctaVisible
                        ? "opacity 0.7s ease-out, transform 0.7s ease-out"
                        : "none",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                        "rgba(0, 112, 243, 0.15)";
                    e.currentTarget.style.transition = "none";
                    e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                        "rgba(0, 112, 243, 0.08)";
                    e.currentTarget.style.transition =
                        "opacity 0.7s ease-out, transform 0.7s ease-out";
                    e.currentTarget.style.transform = "translateY(0px)";
                }}
            >
                <span className="flex-1 text-left">
                    Message other UBC students on{" "}
                    <span className="font-semibold underline group-hover:underline">
                        ChatUBC.com
                    </span>
                </span>
                <svg
                    className="ml-4 w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="#0070f3"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                </svg>
            </a>
        </div>
    );
}
