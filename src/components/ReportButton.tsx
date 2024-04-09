// components/ReportButton.tsx
import { Button } from "@geist-ui/react";
import { ref, push, serverTimestamp, set } from "firebase/database";
import { database } from "../firebaseConfig";
import { setCookie, getCookie } from "../utils/cookies"; // Make sure you have this utility
import { v4 as uuidv4 } from "uuid";
import { Dialog, DialogPanel } from "@tremor/react";
import { useState } from "react";
import { Triangle } from "@geist-ui/icons";
import { IoTriangleSharp } from "react-icons/io5";
interface ReportButtonProps {}

const ReportButton: React.FC<ReportButtonProps> = ({}) => {
    // const { setToast } = useToasts();
    const [isOpen, setIsOpen] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);

    const reportIssue = async () => {
        let userId = getCookie("userId");
        if (!userId) {
            userId = uuidv4();
            setCookie("userId", userId, 1);
        }

        const lastReportTime = getCookie("lastReportTime");
        if (lastReportTime) {
            const now = Date.now();
            const halfHour = 30 * 60 * 1000;

            if (now - parseInt(lastReportTime) < halfHour) {
                setIsRateLimited(true);
                setIsOpen(true);
                // setToast({
                //     text: "You can only report once per hour.",
                //     type: "error",
                // });
                // alert("You can only report once per hour.");
                return;
            } else {
                setIsRateLimited(false);
            }
        }

        const reportsRef = ref(database, "reports");
        await push(reportsRef, {
            timestamp: serverTimestamp(),
            // timestamp: Date.now() - 4 * 60 * 60 * 1000 + Math.random()* 60 * 60 * 1000 - + Math.random()* 60 * 60 * 1000,

            userId: userId, // Changed from 'user' to 'userId' to match the rules
        })
            .then(() => {
                // setToast({
                //     text: "Report submitted successfully",
                //     type: "success",
                // });
                setIsOpen(true);
                // alert("Report submitted successfully");
                setCookie("lastReportTime", Date.now().toString(), 1); // Set/Update the cookie
            })
            .catch((error) => {
                // setToast({ text: "Failed to submit report", type: "error" });
                // alert("Failed to submit report");
            });
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
                    <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        {isRateLimited
                            ? "Report Already Recorded"
                            : "Issue Report Submitted Successfully"}
                    </h3>
                    <p className="my-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                        {isRateLimited
                            ? "Thanks for alerting us!"
                            : "Thanks for alerting us!"}
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
