import { Group } from './groups';

export class Teacher {
  id?: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  groups?: Group[]; 
  created_at?: string;
  updated_at?: string;

  constructor() {
    this.name = '';
    this.surname = '';
    this.email = '';
    this.groups = [];  
  }
}