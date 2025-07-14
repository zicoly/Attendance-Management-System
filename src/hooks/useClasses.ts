import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { classService } from "../services/classService";

export const useClasses = () => {
  const user: any = auth;
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setClasses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = classService.subscribeToLecturerClasses(
      user.uid,
      (updatedClasses: any) => {
        setClasses(updatedClasses);
        setLoading(false);
        setError(null);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const createClass = async (classData: any) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const classId = await classService.createClass(classData, user.uid);
      return classId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateClass = async (classId: any, updates: any) => {
    try {
      await classService.updateClass(classId, updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const endClass = async (classId: any) => {
    try {
      await classService.endClass(classId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteClass = async (classId: any) => {
    try {
      await classService.deleteClass(classId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateClassLocation = async (classId: any, location: any) => {
    try {
      await classService.updateClassLocation(classId, location);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const exportAttendanceData = async (classId: any) => {
    try {
      return await classService.exportAttendanceData(classId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getActiveClasses = () => {
    return classes.filter((cls: any) => cls.isActive);
  };

  const getInactiveClasses = () => {
    return classes.filter((cls: any) => !cls.isActive);
  };

  return {
    classes,
    activeClasses: getActiveClasses(),
    inactiveClasses: getInactiveClasses(),
    loading,
    error,
    createClass,
    updateClass,
    endClass,
    deleteClass,
    updateClassLocation,
    exportAttendanceData,
    clearError: () => setError(null),
  };
};
export default useClasses;
