//@ts-nocheck
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useUserStore } from "../store/userStore";
import useUserData from "../hooks/useUserData";
import { CheckCircle, XCircle, Search, ArrowLeft } from "lucide-react";
import dayjs from "dayjs";

export const PersonalAttendanceTable: React.FC = () => {
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { userId } = useUserStore();

  useUserData();

  useEffect(() => {
    const fetchClasses = async () => {
      const snapshot = await getDocs(collection(db, "classes"));
      const loaded = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loaded.push({
          title: data.title,
          lecturerName: data.lecturerName,
          lecturerlastName: data.lecturerlastName,
          duration: data.duration,
          attendees: data.attendees || [],
          createdAt: data.createdAt,
        });
      });
      setClasses(loaded);
      setLoading(false);
    };
    fetchClasses();
  }, []);

  const today = dayjs();
  const monday = today.startOf("week").add(1, "day");
  const latestClassDate = classes.length
    ? dayjs(
        classes
          .map((cls) => cls.attendees.map((att) => att.attendanceTime))
          .flat()
          .filter(Boolean)
          .sort()
          .pop()
      )
    : today;

  const showDate = selectedDate ? dayjs(selectedDate) : null;

  const dateRange = showDate
    ? [showDate]
    : Array.from({ length: latestClassDate.diff(monday, "day") + 1 }, (_, i) =>
        monday.add(i, "day")
      );

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.title.toLowerCase().includes(search.toLowerCase()) ||
      cls.lecturerName.toLowerCase().includes(search.toLowerCase()) ||
      cls.lecturerlastName.toLowerCase().includes(search.toLowerCase());
    return search.trim() === "" || matchesSearch;
  });

  // ✅ New addition: checking if there's any class for the date range after filtering
  const classesForDateRange = dateRange.flatMap((date) =>
    filteredClasses.filter((cls) => {
      const createdDate = dayjs(
        cls.createdAt.toDate ? cls.createdAt.toDate() : cls.createdAt
      );
      return createdDate.isSame(date, "day");
    })
  );

  const hasAnyClasses = classesForDateRange.length > 0;

  if (loading || !userId) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 min-h-screen text-gray-800">
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => window.history.back()}
          className="text-indigo-600 hover:text-indigo-800 hover:cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
          My Attendance Summary
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Filter by Date"
          className="p-2 rounded-md border shadow-sm"
          isClearable
        />
        <div className="flex items-center gap-2 bg-white rounded-md p-2 shadow w-full md:w-1/3">
          <Search className="text-purple-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course or lecturer..."
            className="flex-1 outline-none text-sm"
          />
        </div>
      </div>

      {!hasAnyClasses ? (
        <p className="text-gray-500 text-center italic mt-10">
          No record found.
        </p>
      ) : (
        dateRange.map((date, idx) => {
          const dayName = date.format("dddd");
          const dateFormatted = date.format("DD/MM/YYYY");

          const classesForThisDate = filteredClasses.filter((cls) => {
            const createdDate = dayjs(
              cls.createdAt.toDate ? cls.createdAt.toDate() : cls.createdAt
            );
            return createdDate.isSame(date, "day");
          });

          // ✅ Skip rendering days with no classes
          if (classesForThisDate.length === 0) return null;

          return (
            <div key={idx} className="mb-10">
              <h3 className="font-bold text-purple-700 mb-4 text-xl">
                {dayName} - {dateFormatted}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classesForThisDate.map((cls, idx) => {
                  const attendedToday = cls.attendees.some(
                    (att) =>
                      att.studentId === userId &&
                      dayjs(att.attendanceTime).isSame(date, "day")
                  );

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg flex flex-col justify-between ${
                        attendedToday
                          ? "bg-green-50 border border-green-400"
                          : "bg-slate-50 border border-gray-200"
                      }`}
                    >
                      <div>
                        <h5 className="font-bold text-purple-700 mb-1 text-base">
                          {cls.title}
                        </h5>
                        <p className="text-sm text-gray-700 mb-1">
                          Lecturer: Dr. {cls.lecturerName}{" "}
                          {cls.lecturerlastName}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          Duration: {cls.duration} mins
                        </p>
                      </div>
                      {attendedToday ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <CheckCircle className="h-5 w-5" /> Attended
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 font-semibold">
                          <XCircle className="h-5 w-5" /> Absent
                        </div>
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
