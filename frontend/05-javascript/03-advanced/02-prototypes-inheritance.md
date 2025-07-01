# 原型与继承

> 深入理解 JavaScript 的原型链机制和继承模式

## 📖 学习目标

- 理解原型对象和原型链的工作原理
- 掌握各种继承模式的实现方法
- 熟练使用现代继承语法
- 能够设计合理的继承结构

## 🔗 原型链基础

### 1. 原型对象基本概念

```javascript
// 构造函数和原型
function Person(name) {
    this.name = name;
}

// 在原型上添加方法
Person.prototype.sayHello = function() {
    return `Hello, I'm ${this.name}`;
};

// 创建实例
const person1 = new Person('张三');
const person2 = new Person('李四');

console.log(person1.sayHello()); // "Hello, I'm 张三"
console.log(person1.sayHello === person2.sayHello); // true - 共享方法
```

### 2. 原型链工作机制

```javascript
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
    return `${this.name} barks!`;
};

const dog = new Dog('旺财', '金毛');
console.log(dog.speak()); // 通过原型链查找到父类方法
console.log(dog.bark());  // 自己的方法
```

## 🏗️ 继承模式

### 1. 组合继承（经典模式）

```javascript
function Parent(name) {
    this.name = name;
    this.hobbies = ['reading'];
}

Parent.prototype.getName = function() {
    return this.name;
};

function Child(name, age) {
    Parent.call(this, name); // 继承属性
    this.age = age;
}

Child.prototype = new Parent(); // 继承方法
Child.prototype.constructor = Child;

const child = new Child('小明', 10);
console.log(child.getName()); // "小明"
```

### 2. 寄生组合继承（推荐）

```javascript
function inheritPrototype(child, parent) {
    const prototype = Object.create(parent.prototype);
    prototype.constructor = child;
    child.prototype = prototype;
}

function Parent(name) {
    this.name = name;
}

Parent.prototype.getName = function() {
    return this.name;
};

function Child(name, age) {
    Parent.call(this, name);
    this.age = age;
}

inheritPrototype(Child, Parent);

Child.prototype.getAge = function() {
    return this.age;
};
```

### 3. ES6 Class 继承

```javascript
class Animal {
    constructor(name) {
        this.name = name;
    }
    
    speak() {
        return `${this.name} makes a sound`;
    }
    
    static getKingdom() {
        return 'Animalia';
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name); // 调用父构造函数
        this.breed = breed;
    }
    
    speak() {
        return `${this.name} barks!`;
    }
    
    getBreed() {
        return this.breed;
    }
}

const dog = new Dog('旺财', '金毛');
console.log(dog.speak());    // "旺财 barks!"
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
```

## 🎯 实践项目：图形继承系统

```javascript
// 基础图形类
class Shape {
    constructor(color = 'black') {
        this.color = color;
    }
    
    getArea() {
        throw new Error('getArea() must be implemented');
    }
    
    getColor() {
        return this.color;
    }
}

// 矩形类
class Rectangle extends Shape {
    constructor(width, height, color) {
        super(color);
        this.width = width;
        this.height = height;
    }
    
    getArea() {
        return this.width * this.height;
    }
}

// 圆形类
class Circle extends Shape {
    constructor(radius, color) {
        super(color);
        this.radius = radius;
    }
    
    getArea() {
        return Math.PI * this.radius ** 2;
    }
}

// 使用示例
const shapes = [
    new Rectangle(10, 5, 'red'),
    new Circle(3, 'blue')
];

shapes.forEach(shape => {
    console.log(`面积: ${shape.getArea()}, 颜色: ${shape.getColor()}`);
});
```

## 🧪 高级技巧

### 1. Mixin 模式

```javascript
// 定义 Mixin
const CanFly = {
    fly() {
        return `${this.name} is flying!`;
    }
};

const CanSwim = {
    swim() {
        return `${this.name} is swimming!`;
    }
};

// 应用 Mixin
function applyMixin(BaseClass, ...mixins) {
    mixins.forEach(mixin => {
        Object.assign(BaseClass.prototype, mixin);
    });
    return BaseClass;
}

class Bird {
    constructor(name) {
        this.name = name;
    }
}

// 让鸟类具备飞行能力
applyMixin(Bird, CanFly);

const bird = new Bird('老鹰');
console.log(bird.fly()); // "老鹰 is flying!"
```

### 2. 动态原型修改

```javascript
function User(name) {
    this.name = name;
}

const user1 = new User('Alice');

// 动态添加方法
User.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

console.log(user1.greet()); // "Hello, I'm Alice" - 已存在实例也能使用
```

## 📚 核心要点

### 原型链查找规则
1. 在对象自身查找属性
2. 在对象的原型中查找
3. 沿着原型链向上查找
4. 直到找到或到达 null

### 继承模式对比

| 模式 | 优点 | 缺点 |
|------|------|------|
| 原型链继承 | 简单 | 引用属性共享 |
| 构造函数继承 | 属性独立 | 无法继承原型方法 |
| 组合继承 | 综合优点 | 调用两次构造函数 |
| 寄生组合继承 | 性能最优 | 实现复杂 |
| ES6 Class | 语法现代 | 需要ES6支持 |

### 最佳实践
- 现代项目优先使用 ES6 Class
- 理解原型链机制有助于调试
- 合理使用 Mixin 实现多重继承
- 注意 constructor 属性的正确指向 