import { useState, useEffect } from "react";

export default function useStudentProfile() {
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    studentId: "",
    email: "",
    department: "",
    phone: "",
  });

  const loadStudentProfile = () => {
    try {
      const saved = localStorage.getItem("studentProfile");
      if (saved) setStudentInfo(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const saveStudentProfile = (profileData: any) => {
    try {
      localStorage.setItem("studentProfile", JSON.stringify(profileData));
      setStudentInfo(profileData);
      return { success: true, message: "Profile saved successfully!" };
    } catch (error) {
      return { success: false, message: "Error saving profile" };
    }
  };

  const isProfileComplete = Boolean(
    studentInfo.name && studentInfo.studentId && studentInfo.email
  );

  useEffect(() => {
    loadStudentProfile();
  }, []);

  return {
    studentInfo,
    saveStudentProfile,
    isProfileComplete,
  };
}
