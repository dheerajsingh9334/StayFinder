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
    AVAILABLE: { bg: "rgba(16, 185, 129, 0.1)", text: "#34d399", border: "rgba(16, 185, 129, 0.2)" },
    BLOCKED: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", border: "rgba(239, 68, 68, 0.2)" },
    FULL: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", border: "rgba(239, 68, 68, 0.2)" },
    UNAVAILABLE: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", border: "rgba(239, 68, 68, 0.2)" },
    SOLD_OUT: { bg: "rgba(239, 68, 68, 0.1)", text: "#f87171", border: "rgba(239, 68, 68, 0.2)" },
    BOOKED: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.2)" },
    PARTIAL: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.2)" },
    LIMITED: { bg: "rgba(245, 158, 11, 0.1)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.2)" },
  };
  const defaultDayTone = { bg: "transparent", text: "#71717a", border: "transparent" };

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        background: "#0a0a0a",
        color: "white",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          background: "#111111",
          color: "#a1a1aa",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
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
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#d4d4d8",
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
              color: "rgba(16, 185, 129, 0.1)",
              text: "#34d399",
              border: "rgba(16, 185, 129, 0.2)",
            },
            {
              label: "Limited/Partial",
              color: "rgba(245, 158, 11, 0.1)",
              text: "#fbbf24",
              border: "rgba(245, 158, 11, 0.2)",
            },
            {
              label: "Blocked/Sold Out",
              color: "rgba(239, 68, 68, 0.1)",
              text: "#f87171",
              border: "rgba(239, 68, 68, 0.2)",
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
                }}
              />
              {legend.label}
            </span>
          ))}
          <span
            style={{
               marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#52525b",
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
              color: "#d4d4d8",
              borderRadius: 16,
              border: "none",
              p: 1,
              "& .MuiTypography-root, & .MuiDayCalendar-weekDayLabel, & .MuiPickersCalendarHeader-label":
                {
                  color: "#a1a1aa",
                },
              "& .MuiIconButton-root": {
                color: "#e4e4e7",
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
                      opacity: isPast ? 0.3 : 1,
                      position: "relative",
                      backgroundColor: isPast ? "transparent" : dayTone.bg,
                      color: isPast ? "#3f3f46" : dayTone.text,
                      border: `1px solid ${isPast ? "transparent" : dayTone.border}`,
                      borderRadius: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "0.2s",
                      "&:hover, &:focus": {
                         backgroundColor: "rgba(255,255,255,0.1) !important"
                      }
                    }}
                  >
                    {isPast && (
                      <Lock
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          color: "#3f3f46",
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
