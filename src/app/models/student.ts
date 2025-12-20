export class Student {
  id?: number;
  name: string;
  surname: string;
  email?: string;
  group_id?: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;

  constructor() {
    this.name = '';
    this.surname = '';
    this.email = '';
  }
}