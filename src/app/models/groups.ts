export class Group {
  id?: number;
  name: string;
  code: string;
  created_at?: string;
  updated_at?: string;

  constructor() {
    this.name = '';
    this.code = '';
  }
}