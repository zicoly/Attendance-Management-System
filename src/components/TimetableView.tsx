import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { attendanceByDay } from "../data/studentSchedule";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { CheckCircle, XCircle, Search } from "lucide-react";

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

const dayToNumber = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

const getMonthWeeks = (month: number, year: number) => {
  const paddedMonth = String(month).padStart(2, "0");
  const start = dayjs(`${year}-${paddedMonth}-01`).startOf("month");
  const end = dayjs(`${year}-${paddedMonth}-01`).endOf("month");
  const startWeek = start.isoWeek();
  const endWeek = end.isoWeek();

  let weeks: number[] = [];
  for (let w = startWeek; w <= endWeek; w++) weeks.push(w);
  return weeks;
};

export const TimetableView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const weekRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const month = dayjs(selectedDate).month() + 1;
  const year = dayjs(selectedDate).year();
  const paddedMonth = String(month).padStart(2, "0");
  const selectedMonthYear = dayjs(`${year}-${paddedMonth}-01`).format(
    "MMMM YYYY"
  );
  const selectedWeek = dayjs(selectedDate).isoWeek();
  const selectedDay = dayjs(selectedDate).format("dddd");
  const weeks = getMonthWeeks(month, year);

  // ✅ Search: matches course code, title, lecturer, status, duration, date, day
  const filteredData = attendanceByDay.filter((item) => {
    const itemDate = dayjs(item.date);
    const isSameMonth =
      itemDate.month() + 1 === month && itemDate.year() === year;
    const dayName = itemDate.format("dddd");
    const searchableText = [
      item.courseCode,
      item.courseTitle,
      item.lecturer,
      item.status,
      item.duration,
      item.date,
      dayName,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = searchableText.includes(search.toLowerCase());
    return isSameMonth && matchesSearch;
  });

  useEffect(() => {
    const targetWeek = weekRefs.current[selectedWeek];
    if (targetWeek) {
      targetWeek.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedWeek]);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 min-h-screen text-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
        Attendance History - {selectedMonthYear}
      </h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date as Date)}
          dateFormat="dd/MM/yyyy"
          className="p-2 rounded-md border shadow-sm"
        />
        <div className="flex items-center gap-2 bg-white rounded-md p-2 shadow w-full md:w-1/3">
          <Search className="text-purple-600" />
          <input
            type="text"
            placeholder="Search anything..."
            className="flex-1 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ Show "No record" if search returns empty */}
      {filteredData.length === 0 ? (
        <div className="text-center text-gray-600 text-lg font-medium p-6">
          No record found for {selectedMonthYear}
        </div>
      ) : (
        weeks.map((week) => {
          const weekStart = dayjs().isoWeek(week).startOf("isoWeek");
          const weekEnd = dayjs().isoWeek(week).endOf("isoWeek");
          const weekAttendance = filteredData.filter(
            (item) => dayjs(item.date).isoWeek() === week
          );

          return (
            <div
              key={week}
              ref={(el) => {
                weekRefs.current[week] = el;
              }}
              className={`mb-8 p-5 rounded-lg ${
                week === selectedWeek
                  ? "border-2 border-indigo-600 bg-white shadow-lg"
                  : "border border-gray-200 bg-white shadow-sm"
              }`}
            >
              <h3 className="text-xl font-semibold mb-4 text-indigo-700">
                Week {week}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(dayToNumber).map(([day, dayNum]) => {
                  const date = dayjs().isoWeek(week).isoWeekday(dayNum);
                  const dayAttendance = weekAttendance.filter((item) =>
                    dayjs(item.date).isSame(date, "day")
                  );
                  const isSelectedDay =
                    week === selectedWeek && day === selectedDay;

                  return (
                    <div
                      key={day}
                      className={`p-4 rounded-lg ${
                        isSelectedDay
                          ? "bg-purple-100 border-2 border-purple-400"
                          : "bg-slate-50"
                      }`}
                    >
                      <h4 className="font-bold text-purple-700 mb-2 text-sm">
                        {day} - {date.format("DD/MM/YYYY")}
                      </h4>

                      {dayAttendance.length > 0 ? (
                        dayAttendance.map((item, idx) => (
                          <div key={idx} className="mb-3 text-xs">
                            <div className="font-semibold">
                              {item.courseCode}
                            </div>
                            <div>{item.courseTitle}</div>
                            <div className="text-gray-500">
                              Lecturer: {item.lecturer}
                            </div>
                            <div className="text-gray-500">
                              Duration: {item.duration}
                            </div>
                            <div
                              className={`flex items-center gap-1 font-medium ${
                                item.status === "Attended"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {item.status === "Attended" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              {item.status}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm">No record</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
