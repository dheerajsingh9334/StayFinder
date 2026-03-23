import { useState } from "react";
import { useParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
// import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import dayjs, { Dayjs } from "dayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { useAvailability } from "../../features/avaiability/availability.hooks";
import { ThreeDot } from "react-loading-indicators";
import { CalendarDays, Lock, TriangleAlert } from "lucide-react";
import type { DayInfo } from "../../features/avaiability/availbility.types";

type CalendarViewProps = {
  propertyId?: string;
};

export default function CalendarView({
  propertyId: propPropertyId,
}: CalendarViewProps) {
  const { propertyId: routePropertyId } = useParams<{ propertyId: string }>();
  const propertyId = propPropertyId ?? routePropertyId;
  const [value, setValue] = useState<Dayjs | null>(dayjs());

  const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
  const endDate = dayjs().endOf("month").format("YYYY-MM-DD");

  const { data, isLoading, isError } = useAvailability(
    propertyId,
    startDate,
    endDate,
  );

  if (!propertyId) {
    return <div>Property not found for calendar</div>;
  }

  if (isLoading) {
    return <ThreeDot color={["#32cd32", "#327fcd", "#cd32cd", "#cd8032"]} />;
  }

  if (isError || !data) {
    return <div>Failed to load calendar</div>;
  }

  // Map backend data by date
  const calendarDays = Array.isArray(data.calender) ? data.calender : [];
  const availabilityMap = new Map<string, DayInfo>(
    calendarDays.map((d: DayInfo) => [d.date.split("T")[0], d]),
  );

  const statusStyle: Record<string, { bg: string; text: string }> = {
    AVAILABLE: { bg: "#d9f99d", text: "#365314" },
    BLOCKED: { bg: "#fecaca", text: "#7f1d1d" },
    FULL: { bg: "#fed7aa", text: "#9a3412" },
    UNAVAILABLE: { bg: "#fecaca", text: "#7f1d1d" },
    BOOKED: { bg: "#fed7aa", text: "#9a3412" },
    PARTIAL: { bg: "#fde68a", text: "#92400e" },
  };
  const defaultDayTone = { bg: "#e2e8f0", text: "#334155" };

  return (
    <div
      style={{
        border: "2px solid #0f172a",
        borderRadius: 20,
        background:
          "linear-gradient(165deg, #fef9c3 0%, #fef3c7 42%, #fdf2f8 100%)",
        boxShadow: "0 16px 30px rgba(15, 23, 42, 0.14)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          background: "#0f172a",
          color: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarDays size={18} />
          <strong style={{ letterSpacing: 0.2 }}>Live Availability Grid</strong>
        </div>
        <div
          style={{
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 999,
            background: "rgba(248, 250, 252, 0.16)",
          }}
        >
          Monthly Snapshot
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          {[
            { label: "Available", color: "#d9f99d", text: "#365314" },
            { label: "Blocked/Unavailable", color: "#fecaca", text: "#7f1d1d" },
            { label: "Past Date", color: "#e2e8f0", text: "#475569" },
          ].map((legend) => (
            <span
              key={legend.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                border: `1px solid ${legend.text}`,
                background: legend.color,
                color: legend.text,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: legend.text,
                }}
              />
              {legend.label}
            </span>
          ))}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#334155",
            }}
          >
            <TriangleAlert size={13} />
            Capacity shown under each day
          </span>
        </div>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={value}
            views={["year", "month", "day"]}
            onChange={(newValue) => setValue(newValue)}
            sx={{
              width: "100%",
              maxWidth: "100%",
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              p: 1,
            }}
            slots={{
              day: (props: PickersDayProps) => {
                const dateStr = props.day.format("YYYY-MM-DD");
                const info = availabilityMap.get(dateStr);
                const today = dayjs().startOf("day");
                const isPast = props.day.isBefore(today);
                const normalizedStatus = String(
                  info?.status || "",
                ).toUpperCase();
                const dayTone = statusStyle[normalizedStatus] || defaultDayTone;
                return (
                  <PickersDay
                    {...props}
                    disabled={isPast}
                    sx={{
                      height: 58,
                      width: 62,
                      opacity: isPast ? 0.6 : 1,
                      position: "relative",
                      backgroundColor: isPast ? "#e2e8f0" : dayTone.bg,
                      color: isPast ? "#475569" : dayTone.text,
                      border: "1px solid #94a3b8",
                      borderRadius: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isPast && (
                      <Lock
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          color: "#475569",
                          width: 12,
                          height: 12,
                        }}
                      />
                    )}
                    <div>{props.day.date()}</div>
                    {info && (
                      <div
                        style={{
                          fontSize: 10,
                          lineHeight: 1.1,
                          textAlign: "center",
                        }}
                      >
                        {info.status}
                        <br />
                        {info.remainingCapacity}
                      </div>
                    )}
                  </PickersDay>
                );
              },
            }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
}
