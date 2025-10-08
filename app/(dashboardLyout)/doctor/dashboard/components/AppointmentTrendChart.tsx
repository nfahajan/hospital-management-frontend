"use client";

import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendData {
  _id: string;
  count: number;
  completed: number;
  cancelled: number;
}

interface AppointmentTrendChartProps {
  data: TrendData[];
  title?: string;
  description?: string;
}

export const AppointmentTrendChart: React.FC<AppointmentTrendChartProps> = ({
  data,
  title = "Appointment Trends",
  description = "Daily appointment counts for the last 7 days",
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const displayData = data.slice(-7); // Show last 7 days

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-end gap-2 p-4">
          {displayData.map((item, index) => {
            const height = Math.max((item.count / maxCount) * 100, 4);
            const completedHeight =
              item.completed > 0 ? (item.completed / item.count) * height : 0;
            const cancelledHeight =
              item.cancelled > 0 ? (item.cancelled / item.count) * height : 0;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div className="w-full flex flex-col justify-end h-24 relative">
                  {/* Background bar */}
                  <div
                    className="w-full bg-gray-200 rounded-t-sm transition-all duration-300 group-hover:bg-gray-300"
                    style={{ height: `${height}%` }}
                  />
                  {/* Completed appointments (green) */}
                  {completedHeight > 0 && (
                    <div
                      className="absolute bottom-0 w-full bg-green-500 rounded-t-sm transition-all duration-300"
                      style={{ height: `${completedHeight}%` }}
                    />
                  )}
                  {/* Cancelled appointments (red) */}
                  {cancelledHeight > 0 && (
                    <div
                      className="absolute bottom-0 w-full bg-red-500 rounded-t-sm transition-all duration-300"
                      style={{ height: `${cancelledHeight}%` }}
                    />
                  )}
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    <div>Total: {item.count}</div>
                    <div>Completed: {item.completed}</div>
                    <div>Cancelled: {item.cancelled}</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-2">
                  {format(new Date(item._id), "MM/dd")}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Total</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentTrendChart;
