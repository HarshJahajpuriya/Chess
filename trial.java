class Animal {
  String name= "animal";
  String makeNoise() {
    return "generic noise";
  }
}

class Dog extends Animal {
  String name = "dog";
  String makeNoise() {
    return "bark";
  }
}

class trial {
  public static void main(String[] args) {
    Animal a = new Dog();
    System.out.println(a.name + " " + a.makeNoise());
  }
}