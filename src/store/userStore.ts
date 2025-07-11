import { create } from "zustand";

interface UserStore {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  userId: string;
  phoneNumber: string;
  department: string;
  setUser: (user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    userId: string;
    phoneNumber: string;
    department: string;
  }) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  firstName: "",
  lastName: "",
  role: "",
  email: "",
  userId: "",
  phoneNumber: "",
  department: "",
  setUser: (user) =>
    set({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      userId: user.userId,
      phoneNumber: user.phoneNumber,
      department: user.department,
    }),
  setUserRole: (role: any) => set({ role }),
}));
