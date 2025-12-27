import { Group } from './groups';

export class Student {
  id?: number;
  name: string;
  surname: string;
  email: string;
  group_id?: number;  // ID группы
  group?: Group;      // Объект группы
  created_at?: string;
  updated_at?: string;

  constructor() {
    this.name = '';
    this.surname = '';
    this.email = '';
  }
}