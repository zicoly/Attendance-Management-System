//@ts-nocheck
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
// import { db } from "../firebase/config"; // Adjust path as needed

export const classService = {
  // Create a new class
  async createClass(classData, lecturerId) {
    try {
      const docRef = await addDoc(collection(db, "classes"), {
        ...classData,
        lecturerId,
        createdAt: serverTimestamp(),
        isActive: true,
        attendees: [],
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating class:", error);
      throw error;
    }
  },

  // Get all classes for a specific lecturer
  async getClassesForLecturer(lecturerId) {
    try {
      const q = query(
        collection(db, "classes"),
        where("lecturerId", "==", lecturerId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting classes:", error);
      throw error;
    }
  },

  // Get active classes for a specific lecturer
  async getActiveClassesForLecturer(lecturerId) {
    try {
      const q = query(
        collection(db, "classes"),
        where("lecturerId", "==", lecturerId),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting active classes:", error);
      throw error;
    }
  },

  // Real-time listener for lecturer's classes
  subscribeToLecturerClasses(lecturerId, callback) {
    const q = query(
      collection(db, "classes"),
      where("lecturerId", "==", lecturerId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const classes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(classes);
    });
  },

  // Update class information
  async updateClass(classId, updates) {
    try {
      const classRef = doc(db, "classes", classId);
      await updateDoc(classRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating class:", error);
      throw error;
    }
  },

  // End a class (set isActive to false)
  async endClass(classId) {
    try {
      const classRef = doc(db, "classes", classId);
      await updateDoc(classRef, {
        isActive: false,
        endedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error ending class:", error);
      throw error;
    }
  },

  // Delete a class
  async deleteClass(classId) {
    try {
      await deleteDoc(doc(db, "classes", classId));
    } catch (error) {
      console.error("Error deleting class:", error);
      throw error;
    }
  },

  // Update class location/geofence
  async updateClassLocation(classId, location) {
    try {
      const classRef = doc(db, "classes", classId);
      await updateDoc(classRef, {
        "geofence.latitude": location.latitude,
        "geofence.longitude": location.longitude,
        "geofence.address": location.address || null,
        locationSetAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating class location:", error);
      throw error;
    }
  },

  // Add attendance record
  async addAttendance(classId, attendanceData) {
    try {
      // First, get the current class data
      const classRef = doc(db, "classes", classId);
      const classDoc = await getDoc(classRef);

      if (!classDoc.exists()) {
        throw new Error("Class not found");
      }

      const currentAttendees = classDoc.data().attendees || [];

      // Check if student already marked attendance
      const existingAttendance = currentAttendees.find(
        (att) => att.studentId === attendanceData.studentId
      );

      if (existingAttendance) {
        throw new Error("Student has already marked attendance for this class");
      }

      // Add new attendance
      const updatedAttendees = [
        ...currentAttendees,
        {
          ...attendanceData,
          attendanceTime: serverTimestamp(),
        },
      ];

      await updateDoc(classRef, {
        attendees: updatedAttendees,
      });

      return true;
    } catch (error) {
      console.error("Error adding attendance:", error);
      throw error;
    }
  },

  // Get class by code (for students)
  async getClassByCode(classCode) {
    try {
      const q = query(
        collection(db, "classes"),
        where("code", "==", classCode),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };
    } catch (error) {
      console.error("Error getting class by code:", error);
      throw error;
    }
  },

  // Export attendance data
  async exportAttendanceData(classId) {
    try {
      const classRef = doc(db, "classes", classId);
      const classDoc = await getDoc(classRef);

      if (!classDoc.exists()) {
        throw new Error("Class not found");
      }

      const classData = classDoc.data();
      const attendees = classData.attendees || [];

      // Format data for export
      const exportData = {
        classInfo: {
          title: classData.title,
          code: classData.code,
          duration: classData.duration,
          createdAt: classData.createdAt,
          lecturerName: classData.lecturerName,
          totalStudents: attendees.length,
        },
        attendees: attendees.map((att) => ({
          studentName: att.studentName,
          studentId: att.studentId,
          attendanceTime: att.attendanceTime,
          location: att.location || null,
        })),
      };

      return exportData;
    } catch (error) {
      console.error("Error exporting attendance data:", error);
      throw error;
    }
  },
};

// Helper function to generate unique class codes
export const generateClassCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to validate location within geofence
export const isWithinGeofence = (
  studentLocation,
  classLocation,
  allowedRadius
) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (studentLocation.latitude * Math.PI) / 180;
  const φ2 = (classLocation.latitude * Math.PI) / 180;
  const Δφ =
    ((classLocation.latitude - studentLocation.latitude) * Math.PI) / 180;
  const Δλ =
    ((classLocation.longitude - studentLocation.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance <= allowedRadius;
};
