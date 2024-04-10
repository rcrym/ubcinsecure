export function formatTimeDuration(milliseconds: number) {
    // Convert milliseconds to minutes
    var minutes = Math.floor(milliseconds / 60000);

    // If time is less than a minute, return in seconds
    if (minutes < 1) {
        var seconds = Math.floor(milliseconds / 1000);
        return seconds + " secs";
    }

    // If time is exactly one minute
    if (minutes === 1) {
        return "1 min";
    }

    // Otherwise, return in minutes
    return minutes + " mins";
}

export function format12HourTime(date: Date): string {
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
export function floorToNearestHalfHour(timestamp: number): number {
    const millisecondsPerHalfHour = 30 * 60 * 1000; // Milliseconds in half an hour
    const floored =
        Math.floor(timestamp / millisecondsPerHalfHour) *
        millisecondsPerHalfHour;
    return floored;
}
export function ceilToNearestHalfHour(timestamp: number): number {
    const millisecondsPerHalfHour = 30 * 60 * 1000; // Milliseconds in half an hour
    const ceiled =
        Math.ceil(timestamp / millisecondsPerHalfHour) *
        millisecondsPerHalfHour;
    return ceiled;
}
