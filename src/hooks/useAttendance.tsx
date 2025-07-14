import { useState, useEffect } from "react";

export default function useAttendance() {
  const [activeClasses, setActiveClasses] = useState([]);
  const [attendedClasses, setAttendedClasses] = useState<any>([]);

  const loadActiveClasses = () => {
    try {
      const lecturerClasses = JSON.parse(
        localStorage.getItem("lecturerClasses") || "[]"
      );
      setActiveClasses(
        lecturerClasses.filter((cls: any) => new Date(cls.endTime) > new Date())
      );
    } catch (error) {
      setActiveClasses([]);
    }
  };

  const loadAttendedClasses = () => {
    try {
      const attended = localStorage.getItem("studentAttendedClasses");
      if (attended) setAttendedClasses(JSON.parse(attended));
    } catch (error) {
      setAttendedClasses([]);
    }
  };

  const saveAttendedClass = (attendanceRecord: any) => {
    const updatedAttended = [...attendedClasses, attendanceRecord];
    setAttendedClasses(updatedAttended);
    localStorage.setItem(
      "studentAttendedClasses",
      JSON.stringify(updatedAttended)
    );
  };

  useEffect(() => {
    loadActiveClasses();
    loadAttendedClasses();
    const interval = setInterval(loadActiveClasses, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    activeClasses,
    attendedClasses,
    loadActiveClasses,
    loadAttendedClasses,
    saveAttendedClass,
  };
}
