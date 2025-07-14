import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

export default function useActiveClasses() {
  const [activeClasses, setActiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const classesRef = collection(db, "classes");

    // Query for active classes only (removed orderBy to avoid index requirement)
    const q = query(classesRef, where("isActive", "==", true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const classes: any = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          classes.push({
            id: doc.id,
            ...data,
            // Convert Firestore timestamp to JavaScript Date if needed
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            endedAt: data.endedAt?.toDate?.() || data.endedAt,
            // Extract geofence data for easier access
            latitude: data.geofence?.latitude || 0,
            longitude: data.geofence?.longitude || 0,
            address: data.geofence?.address || "",
            allowedRadius: data.geofence?.radius || data.allowedRadius || 100,
            geofenceEnabled: data.geofence?.enabled || false,
          });
        });

        // Sort classes by createdAt in JavaScript instead of Firestore
        classes.sort((a: any, b: any): any => {
          const dateA =
            a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB =
            b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB - dateA; // Descending order (newest first)
        });

        setActiveClasses(classes);
        console.log("Active classes: ", classes);
        setLoading(false);
        setError(null);
      },
      (err: any) => {
        console.error("Error fetching classes:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { activeClasses, loading, error };
}
