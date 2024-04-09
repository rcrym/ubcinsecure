export interface Report {
  timestamp: number; // assuming timestamp is a number
}

export interface ChartData {
  minute: string;
  reports: number;
}

export interface TooltipProps {
  active?: boolean;
  payload?: { color: string; dataKey: string; value: number }[];
}

export interface ProcessedData {
  [key: string]: number;
}
