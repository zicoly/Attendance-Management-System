export type AttendanceSlot = {
  courseCode: string;
  courseTitle: string;
  lecturer: string;
  status: "Attended" | "Absent";
  date: string;
  duration: string;
};

export const attendanceByDay: AttendanceSlot[] = [
  {
    courseCode: "CSC402",
    courseTitle: "Software Engineering",
    lecturer: "Mr. Oladipupo Ishola",
    status: "Attended",
    date: "2025-07-08",
    duration: "2 hours",
  },
  {
    courseCode: "CSC301",
    courseTitle: "Mobile Development",
    lecturer: "Dr. Akinpelu",
    status: "Absent",
    date: "2025-07-10",
    duration: "3 hours",
  },
  {
    courseCode: "CSC101",
    courseTitle: "Intro to Computing",
    lecturer: "Dr. Tayo",
    status: "Attended",
    date: "2025-07-19",
    duration: "2 hours",
  },
  {
    courseCode: "CSC409",
    courseTitle: "Cybersecurity",
    lecturer: "Dr. Obinna",
    status: "Attended",
    date: "2025-07-22",
    duration: "2 hours",
  },

  // Monday - 14/07/2025 (3 Courses)
  {
    courseCode: "CSC402",
    courseTitle: "Software Engineering",
    lecturer: "Mr. Oladipupo Ishola",
    status: "Attended",
    date: "2025-07-14",
    duration: "2 hours",
  },
  {
    courseCode: "CSC312",
    courseTitle: "Web Application Development",
    lecturer: "Ms. Yetunde Amusan",
    status: "Attended",
    date: "2025-07-14",
    duration: "3 hours",
  },
  {
    courseCode: "CSC401",
    courseTitle: "Advanced Database Systems",
    lecturer: "Dr. Oladele Moses",
    status: "Absent",
    date: "2025-07-14",
    duration: "1.5 hours",
  },

  // Tuesday - 15/07/2025 (2 Courses)
  {
    courseCode: "CSC305",
    courseTitle: "Artificial Intelligence",
    lecturer: "Prof. Okon",
    status: "Attended",
    date: "2025-07-15",
    duration: "2 hours",
  },
  {
    courseCode: "CSC204",
    courseTitle: "Data Structures",
    lecturer: "Dr. Akinpelu",
    status: "Absent",
    date: "2025-07-15",
    duration: "3 hours",
  },

  // Thursday - 17/07/2025 (2 Courses)
  {
    courseCode: "CSC306",
    courseTitle: "Mobile Development",
    lecturer: "Dr. Akinpelu",
    status: "Attended",
    date: "2025-07-17",
    duration: "2 hours",
  },
  {
    courseCode: "CSC312",
    courseTitle: "Web Application Development",
    lecturer: "Ms. Yetunde Amusan",
    status: "Attended",
    date: "2025-07-17",
    duration: "1 hour",
  },

  // Friday - 18/07/2025 (1 Course)
  {
    courseCode: "CSC409",
    courseTitle: "Cybersecurity",
    lecturer: "Dr. Obinna",
    status: "Attended",
    date: "2025-07-18",
    duration: "2 hours",
  },
];
