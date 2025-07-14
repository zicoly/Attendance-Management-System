//@ts-nocheck
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useUserStore } from "../store/userStore";
import useUserData from "../hooks/useUserData";
import { CheckCircle, XCircle, Search } from "lucide-react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

const dayToNumber = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

type Attendee = {
  studentId: string;
  firstName: string;
  lastName: string;
  attendanceTime: string;
};

type ClassItem = {
  title: string;
  lecturerName: string;
  lecturerlastName: string;
  duration: string;
  attendees: Attendee[];
};

export const PersonalAttendanceTable: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const weekRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useUserData();
  const { userId } = useUserStore();

  useEffect(() => {
    const fetchClasses = async () => {
      const snapshot = await getDocs(collection(db, "classes"));
      const loaded: ClassItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loaded.push({
          title: data.title,
          lecturerName: data.lecturerName,
          lecturerlastName: data.lecturerlastName,
          duration: data.duration,
          attendees: data.attendees || [],
        });
      });
      setClasses(loaded);
      setLoading(false);
    };
    fetchClasses();
  }, []);

  const selectedDay = dayjs(selectedDate).format("dddd");
  const selectedDateFormatted = dayjs(selectedDate).format("DD/MM/YYYY");
  const today = dayjs();

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.title.toLowerCase().includes(search.toLowerCase()) ||
      cls.lecturerName.toLowerCase().includes(search.toLowerCase()) ||
      cls.lecturerlastName.toLowerCase().includes(search.toLowerCase());
    return search.trim() === "" || matchesSearch;
  });

  const isFutureDate = dayjs(selectedDate).isAfter(today, "day");

  if (loading || !userId) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 min-h-screen text-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
        My Attendance - {dayjs(selectedDate).format("MMMM YYYY")}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course or lecturer..."
            className="flex-1 outline-none text-sm"
          />
        </div>
      </div>

      <h3 className="font-bold text-purple-700 mb-4 text-xl">
        {selectedDay} - {selectedDateFormatted}
      </h3>

      {isFutureDate ? (
        <p className="text-gray-500 text-sm">No record yet.</p>
      ) : filteredClasses.length === 0 ? (
        <p className="text-gray-500 text-sm">No record yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls, idx) => {
            const attendedToday = cls.attendees.some(
              (att) =>
                att.studentId === userId &&
                dayjs(att.attendanceTime).isSame(selectedDate, "day")
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
                    Lecturer: Dr. {cls.lecturerName} {cls.lecturerlastName}
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
      )}
    </div>
  );
};
