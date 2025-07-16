import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import dayjs from "dayjs";
import { useUserStore } from "../store/userStore";
import useUserData from "../hooks/useUserData";
import { ArrowLeft } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Student = {
  fullName: string;
  studentID: string;
  email: string;
  department: string;
  level: string;
  course: string;
  date: string;
};

type ClassType = {
  title: string;
  level: string;
  attendees: Student[];
};

export const StudentTable: React.FC = () => {
  const [classesData, setClassesData] = useState<ClassType[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { firstName, lastName, email } = useUserStore();
  useUserData();

  useEffect(() => {
    const fetchData = async () => {
      const classesSnap = await getDocs(collection(db, "classes"));
      const loadedClasses: ClassType[] = [];

      classesSnap.forEach((clsDoc) => {
        const classData = clsDoc.data();
        const {
          title,
          level,
          attendees = [],
          lecturerName,
          lecturerlastName,
          lecturerEmail,
        } = classData;

        const isSameLecturer =
          lecturerName?.toLowerCase() === firstName?.toLowerCase() &&
          lecturerlastName?.toLowerCase() === lastName?.toLowerCase() &&
          lecturerEmail?.toLowerCase() === email?.toLowerCase();

        if (!isSameLecturer) return;

        const formattedAttendees: Student[] = attendees.map((student: any) => ({
          fullName: `${student.lastName} ${student.firstName}`,
          studentID: student.studentId,
          email: student.email,
          department: student.department,
          level: student.level,
          course: title,
          date: student.attendanceTime,
        }));

        loadedClasses.push({
          title,
          level,
          attendees: formattedAttendees,
        });
      });

      setClassesData(loadedClasses);
    };

    fetchData();
  }, [firstName, lastName, email]);

  const searchFilter = (students: Student[]) => {
    return students.filter((student) => {
      const fullText = Object.values(student).join(" ").toLowerCase();
      return fullText.includes(search.toLowerCase());
    });
  };

  const dateFilter = (students: Student[]) => {
    if (!selectedDate) return students;
    return students.filter((student) =>
      dayjs(student.date).isSame(selectedDate, "day")
    );
  };

  const filteredClasses = classesData.map((cls) => {
    const filteredAttendees = dateFilter(searchFilter(cls.attendees));
    return { ...cls, attendees: filteredAttendees };
  });



  const downloadCSV = (students: Student[], title: string) => {
    if (students.length === 0)
      return alert("No attendance records to download.");
    const headers = [
      "Full Name",
      "Matric Number",
      "Email",
      "Department",
      "Level",
      "Course",
      "Date",
    ];

    const rows = students.map((s) => [
      s.fullName,
      s.studentID,
      s.email,
      s.department,
      s.level,
      s.course,
      dayjs(s.date).format("YYYY-MM-DD HH:mm"),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 min-h-screen text-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => window.history.back()}
          className="text-indigo-600 hover:text-indigo-800 hover:cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
          Student Attendance History
        </h2>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          placeholder="Search student, course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-purple-200 bg-white p-2 rounded-md w-full md:w-1/3 shadow-sm"
        />
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          placeholderText="Filter by Date"
          className="border border-purple-200 bg-white p-2 rounded-md w-full shadow-sm"
          dateFormat="dd/MM/yyyy"
          isClearable
        />
      </div>

      {classesData.length === 0 ? (
        <p className="text-gray-500 text-center italic mt-10">
          No classes found.
        </p>
      ) : (
        filteredClasses.map(({ title, level, attendees }, idx) => (
          <div key={idx} className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Course {level} - {title}
              </h3>
              <button
                onClick={() => downloadCSV(attendees, title)}
                className="text-sm px-4 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Download CSV
              </button>
            </div>

            {attendees.length === 0 ? (
              <p className="text-gray-400 italic mb-4">
                No attendance record for this class.
              </p>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                <table className="w-full table-auto text-sm">
                  <thead className="bg-indigo-100 text-left text-gray-700">
                    <tr>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Matric No</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Level</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((student, idx) => (
                      <tr key={idx} className="border-t hover:bg-purple-50">
                        <td className="p-3">{student.fullName}</td>
                        <td className="p-3">{student.studentID}</td>
                        <td className="p-3">{student.email}</td>
                        <td className="p-3">{student.department}</td>
                        <td className="p-3">{student.level}</td>
                        <td className="p-3">{student.course}</td>
                        <td className="p-3">
                          {dayjs(student.date).format("DD MMM, YYYY HH:mm")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
