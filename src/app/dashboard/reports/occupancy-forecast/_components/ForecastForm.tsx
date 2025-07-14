"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getOccupancyForecastAction, type DailyForecast } from "../actions";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export function ForecastForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [forecastData, setForecastData] = useState<DailyForecast[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);

  // Set default dates: from today to 14 days in the future
  const defaultStartDate = new Date().toISOString().split("T")[0];
  const defaultEndDate = new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setForecastData([]); // Clear previous results

    const formData = new FormData(event.currentTarget);
    const fromDate = new Date(formData.get("fromDate") as string);
    const toDate = new Date(formData.get("toDate") as string);

    if (toDate < fromDate) {
      toast.error("'To' date cannot be earlier than 'From' date.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await getOccupancyForecastAction(fromDate, toDate);
      setForecastData(result.forecastData);
      setTotalRooms(result.totalRooms);
    } catch (error) {
      console.error("Error Failed to generate forecast:", error);
      toast.error("Failed to generate forecast.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit} className="p-4 flex items-end gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fromDate">From</Label>
            <Input id="fromDate" name="fromDate" type="date" defaultValue={defaultStartDate} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="toDate">To</Label>
            <Input id="toDate" name="toDate" type="date" defaultValue={defaultEndDate} />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Process"}
          </Button>
        </form>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Occupied</TableHead>
              <TableHead>Arrivals</TableHead>
              <TableHead>Departures</TableHead>
              <TableHead>Out of Service</TableHead>
              <TableHead>Expected Occupancy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Generating forecast...</TableCell>
                </TableRow>
            ) : forecastData.length > 0 ? (
              forecastData.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">{day.date} - {day.dayOfWeek}</TableCell>
                  <TableCell>{day.occupied}</TableCell>
                  <TableCell>{day.arrivals}</TableCell>
                  <TableCell>{day.departures}</TableCell>
                  <TableCell>{day.outOfService}</TableCell>
                  <TableCell className="font-semibold">
                    {day.occupancyPercent.toFixed(2)}%
                    <span className="text-xs text-muted-foreground ml-2">({day.occupied} of {totalRooms})</span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No forecast data. Please process a date range.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}