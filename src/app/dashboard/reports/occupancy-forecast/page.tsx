import { ForecastForm } from "./_components/ForecastForm";

export default function OccupancyForecastPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Occupancy Forecast</h1>
        <p className="text-muted-foreground">
          Project future occupancy based on current bookings.
        </p>
      </div>
      <ForecastForm />
    </div>
  );
}