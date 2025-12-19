import { Student } from "./student";
import { Teacher } from "./teacher";

export interface User {
  id: number;
  email: string;
  role: string;
  student_id?: number;
  teacher_id?: number;
  student?: Student;
  teacher?: Teacher;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Role {
  name: string;
  permissions: string[];
}

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

export const PERMISSIONS = {
  VIEW_STUDENTS: 'view_students',
  EDIT_STUDENTS: 'edit_students',
  CREATE_STUDENTS: 'create_students',
  DELETE_STUDENTS: 'delete_students',
  EDIT_OWN_DATA: 'edit_own_data'
};

export const ROLE_PERMISSIONS: { [key: string]: string[] } = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.EDIT_STUDENTS,
    PERMISSIONS.CREATE_STUDENTS,
    PERMISSIONS.DELETE_STUDENTS
  ],
  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.EDIT_STUDENTS
  ],
  [ROLES.STUDENT]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.EDIT_OWN_DATA
  ]
};