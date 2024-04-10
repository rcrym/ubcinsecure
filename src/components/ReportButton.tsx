// components/ReportButton.tsx
import { logEvent } from "@firebase/analytics";
import { Button } from "@geist-ui/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { push, ref, serverTimestamp } from "firebase/database";
import { useEffect, useState } from "react";
import { IoTriangleSharp } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";
import { analytics, database } from "../firebaseConfig";
import { getCookie, setCookie } from "../utils/cookies"; // Make sure you have this utility
import { formatTimeDuration } from "@/utils/formatTime";
interface ReportButtonProps {}

const ReportButton: React.FC<ReportButtonProps> = ({}) => {
    // const { setToast } = useToasts();
    const [isOpen, setIsOpen] = useState(false);
    const [minsUntilNextReport, setMinsUntilNextReport] = useState("30 mins");
    // const [isRateLimited, setIsRateLimited] = useState(false);
    const [status, setStatus] = useState<"success" | "ratelimited" | "error">(
        "error"
    );

    const reportIssue = async () => {
        analytics && logEvent(analytics, "report_button_click");
        // Check if the user is offline before proceeding
        if (!navigator.onLine) {
            // User is offline, display an error message
            setStatus("error");
            setIsOpen(true);
            return; // Stop execution if offline
        }

        let userId = getCookie("userId");
        if (!userId) {
            userId = uuidv4();
            setCookie("userId", userId, 1);
        }

        let lastReportTime = getCookie("lastReportTime");
        if (lastReportTime) {
            const now = Date.now();
            const halfHour = 30 * 60 * 1000;

            if (now - parseInt(lastReportTime) < halfHour) {
                updateTimeUntilNextReport();
                setStatus("ratelimited");
                setIsOpen(true);
                analytics && logEvent(analytics, "report_rate_limited");
                return;
            }
        } else {
            setCookie("lastReportTime", Date.now().toString(), 1);
        }

        const reportsRef = ref(database, "reports");
        await push(reportsRef, {
            timestamp: serverTimestamp(),
            // timestamp: Date.now() - 29.9 * 60 * 1000,
            userId: userId,
        })
            .then(() => {
                setStatus("success");
                setIsOpen(true);
                setCookie("lastReportTime", Date.now().toString(), 1);
                analytics && logEvent(analytics, "report_submission_success");
            })
            .catch((error) => {
                setStatus("error");
                setIsOpen(true);
                analytics &&
                    logEvent(analytics, "report_submission_error", {
                        error: error.message,
                    });
            });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            updateTimeUntilNextReport();
        }, 1000); // Update every second initially

        return () => clearInterval(interval); // Clean up interval on component unmount
    }, []);

    const updateTimeUntilNextReport = () => {
        let now = Date.now();
        let lastReportTime = getCookie("lastReportTime");
        if (lastReportTime) {
            let duration = parseInt(lastReportTime) + 30 * 60 * 1000 - now;
            duration = duration < 0 ? 0 : duration;
            setMinsUntilNextReport(formatTimeDuration(duration));
        }
    };

    return (
        <>
            <Button
                // auto
                shadow
                type="success-light"
                onClick={reportIssue}
                font={"15px"}
                // style={{ marginBottom: "20px" }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                // icon={<IoTriangleSharp></IoTriangleSharp>}
            >
                <IoTriangleSharp className="mr-2" />
                Report Issue
            </Button>
            <Dialog
                open={isOpen}
                onClose={(val) => setIsOpen(val)}
                static={true}
            >
                <DialogPanel>
                    <div className="flex items-center">
                        {status == "success" && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="green"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                            </svg>
                        )}
                        {status == "error" && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="orange"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                />
                            </svg>
                        )}
                        {status == "ratelimited" && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="#0070f3"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                />
                            </svg>
                        )}
                        <h3 className="ml-2 text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            {status == "ratelimited" &&
                                "Report Already Recorded"}
                            {status == "success" &&
                                "Report Submitted Successfully"}
                            {status == "error" && "Report Failed to Submit"}
                        </h3>
                    </div>
                    <p className="my-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                        {status == "success" && "Thanks for alerting us!"}
                        {status == "ratelimited" &&
                            `Thanks for alerting us! You can report an issue again in ${minsUntilNextReport}.`}
                        {status == "error" && "Sorry! Please try again."}
                    </p>
                    <div className="flex justify-center w-full">
                        <Button
                            // auto
                            type="secondary-light"
                            // color="green"
                            // className="mt-8 w-full"
                            width={"100%"}
                            onClick={() => setIsOpen(false)}
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                        >
                            Close
                        </Button>
                    </div>
                </DialogPanel>
            </Dialog>
        </>
    );
};

export default ReportButton;
