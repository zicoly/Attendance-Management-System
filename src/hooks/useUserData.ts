import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { auth, db } from "../config/firebase";
import { useUserStore } from "../store/userStore";

const useUserData = () => {
  const { setUser } = useUserStore();

  useEffect(() => {
    const fetchUserData = async () => {
      const user: any = auth.currentUser;
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: user.email,
            role: userData.role,
            userId: userData.userId,
            phoneNumber: userData.phoneNumber,
            department: userData.department,
          });
        }
      }
    };

    fetchUserData();
  }, [setUser]);

  return;
};
export default useUserData;
