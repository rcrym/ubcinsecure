import { Card, Tracker, type Color } from "@tremor/react";

interface UptimeTracker {
    color: Color;
    tooltip: string;
}

const data: UptimeTracker[] = [
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "rose", tooltip: "Downtime" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "gray", tooltip: "Maintenance" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "emerald", tooltip: "Operational" },
    { color: "yellow", tooltip: "Degraded" },
    { color: "emerald", tooltip: "Operational" },
];

export function UptimeTracker() {
    return (
        <Card className="mx-auto max-w-md mb-5">
            <p className="text-tremor-default flex items-center justify-between">
                <span className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
                    ubcsecure
                </span>
                <span className="text-tremor-content dark:text-dark-tremor-content">
                    uptime 99.1%
                </span>
            </p>
            <Tracker data={data} className="mt-2" />
        </Card>
    );
}
