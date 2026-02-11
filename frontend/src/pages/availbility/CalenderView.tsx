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
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { ThreeDot } from "react-loading-indicators";
import { Lock } from "lucide-react";
import type {
  CalendarViewProps,
  DayInfo,
} from "../../features/avaiability/availbility.types";

export default function CalendarView({ propertyId }: CalendarViewProps) {
  //   const { propertyId } = useParams<{ propertyId: string }>();
  const [value, setValue] = useState<Dayjs | null>(dayjs());

  const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
  const endDate = dayjs().endOf("month").format("YYYY-MM-DD");

  const { data, isLoading, isError } = useAvailability(
    propertyId as string,
    startDate,
    endDate,
  );

  if (isLoading) {
    return <ThreeDot color={["#32cd32", "#327fcd", "#cd32cd", "#cd8032"]} />;
  }

  if (isError || !data) {
    return <div>Failed to load calendar</div>;
  }

  // Map backend data by date
  const availabilityMap = new Map<string, DayInfo>(
    data.calender.map((d: DayInfo) => [d.date.split("T")[0], d]),
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer
        components={["DateCalendar", "DateCalendar", "DateCalendar"]}
      >
        <DemoItem label={'"year", "month" and "day"'}>
          <DateCalendar
            value={value}
            views={["year", "month", "day"]}
            onChange={(newValue) => setValue(newValue)}
            slots={{
              day: (props: PickersDayProps<Dayjs>) => {
                const dateStr = props.day.format("YYYY-MM-DD");
                const info = availabilityMap.get(dateStr);
                const today = dayjs().startOf("day");
                const isPast = props.day.isBefore(today);
                return (
                  <PickersDay
                    {...props}
                    disabled={isPast}
                    sx={{
                      height: 58,
                      width: 64,
                      opacity: isPast ? 0.5 : 1,
                      position: "relative",
                      backgroundColor:
                        info?.status === "AVAILABLE" ? "#e8f5e9" : "#e98175",
                      border: "1px solid #ccc",
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

                          color: "#999",
                          //   color: "red",
                        }}
                      />
                    )}
                    <div>{props.day.date()}</div>
                    {info && (
                      <div style={{ fontSize: 10 }}>
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
        </DemoItem>
      </DemoContainer>
    </LocalizationProvider>
  );
}
