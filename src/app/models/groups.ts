import { Student } from './student';

export class Group {
  id?: number;
  name: string;
  code: string;
  students?: Student[];  
  created_at?: string;
  updated_at?: string;

  constructor() {
    this.name = '';
    this.code = '';
    this.students = [];  
  }
}