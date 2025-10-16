export class Student{
  constructor(){
    this.id = null;    // ID студента (null для нового студента)
    this.name = "";    // Имя студента
    this.surname = ""; // Фамилия студента
  }
  id: number| null;
  name : string;
  surname :string;

  // Метод для создания клона объекта (может пригодиться для избежания мутаций)
  clone() : Student {
    const cloned = new Student();
    cloned.id = this.id;
    cloned.name = this.name;
    cloned.surname = this.surname;
    return cloned;
  }
}
