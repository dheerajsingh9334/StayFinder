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
  const [visibleMonth, setVisibleMonth] = useState(dayjs().startOf("month"));

  const startDate = visibleMonth.startOf("month").format("YYYY-MM-DD");
  const endDate = visibleMonth.endOf("month").format("YYYY-MM-DD");

  const { data, isLoading, isError } = useAvailability(
    propertyId,
    startDate,
    endDate,
  );

  if (!propertyId) {
    return <div>Property not found for calendar</div>;
  }

  if (isLoading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: 220 }}>
        <ThreeDot color={["#3158d4", "#2563eb", "#5b7df0", "#9fbfff"]} />
      </div>
    );
  }

  if (isError || !data) {
    return <div>Failed to load calendar</div>;
  }

  // Map backend data by date
  const calendarDays = Array.isArray(data.calender) ? data.calender : [];
  const availabilityMap = new Map<string, DayInfo>(
    calendarDays.map((d: DayInfo) => [d.date.split("T")[0], d]),
  );

  const statusStyle: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    AVAILABLE: { bg: "#e8f8f1", text: "#16885f", border: "#b8efd8" },
    BLOCKED: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
    FULL: { bg: "#fff7ed", text: "#b45309", border: "#fed7aa" },
    UNAVAILABLE: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
    BOOKED: { bg: "#fff7ed", text: "#b45309", border: "#fed7aa" },
    PARTIAL: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  };
  const defaultDayTone = { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" };

  return (
    <div
      style={{
        border: "1px solid var(--gray-100)",
        borderRadius: 16,
        background: "var(--white)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          background: "var(--bg-secondary)",
          color: "var(--gray-600)",
          borderBottom: "1px solid var(--gray-100)",
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
            background: "var(--primary-50)",
            border: "1px solid var(--primary-200)",
            color: "var(--primary-700)",
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
            {
              label: "Available",
              color: "#e8f8f1",
              text: "#16885f",
              border: "#b8efd8",
            },
            {
              label: "Blocked/Unavailable",
              color: "#fef2f2",
              text: "#b91c1c",
              border: "#fecaca",
            },
            {
              label: "Past Date",
              color: "#f8fafc",
              text: "#64748b",
              border: "#e2e8f0",
            },
          ].map((legend) => (
            <span
              key={legend.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                border: `1px solid ${legend.border}`,
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
                  boxShadow: `0 0 6px ${legend.text}`,
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
              color: "var(--gray-500)",
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
            onChange={(newValue) => {
              setValue(newValue);
              if (newValue) {
                setVisibleMonth(newValue.startOf("month"));
              }
            }}
            onMonthChange={(newMonth) =>
              setVisibleMonth(newMonth.startOf("month"))
            }
            sx={{
              width: "100%",
              maxWidth: "100%",
              background: "transparent",
              color: "var(--gray-600)",
              borderRadius: 16,
              border: "none",
              p: 1,
              "& .MuiTypography-root, & .MuiDayCalendar-weekDayLabel, & .MuiPickersCalendarHeader-label":
                {
                  color: "var(--gray-500)",
                },
              "& .MuiIconButton-root": {
                color: "var(--primary-600)",
              },
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
                      height: 56,
                      width: 58,
                      opacity: isPast ? 0.5 : 1,
                      position: "relative",
                      backgroundColor: isPast ? "#f8fafc" : dayTone.bg,
                      color: isPast ? "#94a3b8" : dayTone.text,
                      border: `1px solid ${isPast ? "transparent" : dayTone.border}`,
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
                          top: 4,
                          right: 4,
                          color: "#94a3b8",
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
                          fontWeight: 600,
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
