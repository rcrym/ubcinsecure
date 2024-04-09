"use client";
// import Image from "next/image";
// import styles from "./page.module.css";

import ReportButton from "@/components/ReportButton";
import { AreaChartUsageExampleWithCustomTooltip } from "@/components/ReportsGraph";

export default function Home() {
    return (
        <>
            <AreaChartUsageExampleWithCustomTooltip />
            <ReportButton />
        </>
    );
}
