export class Student {
  constructor(){
    this.id = null;
    this.name = "";
    this.surname = "";
    this.email = "";
    this.group_id = null;
    this.user_id = null;
    this.created_at = "";
    this.updated_at = "";
  }
  
  id: number | null;
  name: string;
  surname: string;
  email?: string;
  group_id?: number | null;
  user_id?: number | null;
  created_at: string;
  updated_at: string;

  clone(): Student {
    const cloned = new Student();
    cloned.id = this.id;
    cloned.name = this.name;
    cloned.surname = this.surname;
    cloned.email = this.email;
    cloned.group_id = this.group_id;
    cloned.user_id = this.user_id;
    cloned.created_at = this.created_at;
    cloned.updated_at = this.updated_at;
    return cloned;
  }

  get fullName(): string {
    return `${this.name} ${this.surname}`;
  }
}