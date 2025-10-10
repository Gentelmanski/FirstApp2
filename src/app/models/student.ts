export class Student{
  constructor(){
    this.id = null;
    this.name = "";
    this.surname = "";
  }
  id: number| null;
  name : string;
  surname :string;


  //Вдруг нужно, методы для клонирования (Хотя хз, нашел в нете гайды)

  clone() : Student {
    const cloned = new Student();
    cloned.id = this.id;
    cloned.name = this.name;
    cloned.surname = this.surname;
    return cloned;
  }
}
