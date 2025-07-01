# 类和继承

> 面向对象编程的现代JavaScript实现

## 🎯 学习目标

- 理解ES6类的语法和特性
- 掌握类的构造函数、方法和属性
- 学会使用继承和super关键字
- 了解静态方法和私有属性
- 对比类与函数构造器的异同

## 📖 核心内容

### 1. 基本类语法

#### 1.1 类的定义

```javascript
// ES5 构造函数方式
function PersonOld(name, age) {
    this.name = name;
    this.age = age;
}

PersonOld.prototype.greet = function() {
    return 'Hello, I am ' + this.name;
};

PersonOld.prototype.getAge = function() {
    return this.age;
};

// ES6 类语法
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Hello, I am ${this.name}`;
    }
    
    getAge() {
        return this.age;
    }
    
    // 箭头函数方法（绑定this）
    sayHello = () => {
        return `Hello from ${this.name}`;
    }
}

// 使用类
const person = new Person('Alice', 30);
console.log(person.greet()); // Hello, I am Alice
console.log(person.getAge()); // 30
console.log(person.sayHello()); // Hello from Alice
```

#### 1.2 类表达式

```javascript
// 命名类表达式
const Person = class PersonClass {
    constructor(name) {
        this.name = name;
    }
    
    greet() {
        return `Hello, I am ${this.name}`;
    }
};

// 匿名类表达式
const Animal = class {
    constructor(species) {
        this.species = species;
    }
    
    speak() {
        return `${this.species} makes a sound`;
    }
};

// 立即调用的类表达式
const instance = new (class {
    constructor(value) {
        this.value = value;
    }
    
    getValue() {
        return this.value;
    }
})('Hello World');

console.log(instance.getValue()); // Hello World
```

### 2. 构造函数和方法

#### 2.1 构造函数

```javascript
class User {
    constructor(name, email, options = {}) {
        // 必需参数验证
        if (!name || !email) {
            throw new Error('Name and email are required');
        }
        
        // 基本属性
        this.name = name;
        this.email = email;
        this.id = Date.now();
        this.createdAt = new Date();
        
        // 可选参数解构
        const {
            age = null,
            role = 'user',
            isActive = true,
            preferences = {}
        } = options;
        
        this.age = age;
        this.role = role;
        this.isActive = isActive;
        this.preferences = { ...preferences };
        
        // 私有属性模拟
        this._loginAttempts = 0;
        this._lastLogin = null;
    }
    
    // 实例方法
    getFullInfo() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            age: this.age,
            role: this.role,
            isActive: this.isActive,
            createdAt: this.createdAt
        };
    }
    
    updateProfile(updates) {
        // 只允许更新特定字段
        const allowedFields = ['name', 'age', 'preferences'];
        
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                if (key === 'preferences') {
                    this.preferences = { ...this.preferences, ...updates[key] };
                } else {
                    this[key] = updates[key];
                }
            }
        });
        
        return this;
    }
    
    // 方法链
    activate() {
        this.isActive = true;
        return this;
    }
    
    deactivate() {
        this.isActive = false;
        return this;
    }
    
    setRole(role) {
        this.role = role;
        return this;
    }
}

// 使用示例
const user = new User('Alice', 'alice@example.com', {
    age: 30,
    role: 'admin',
    preferences: { theme: 'dark', language: 'en' }
});

console.log(user.getFullInfo());

// 方法链
user.activate().setRole('superadmin').updateProfile({
    name: 'Alice Smith',
    preferences: { theme: 'light' }
});
```

#### 2.2 Getter和Setter

```javascript
class Temperature {
    constructor(celsius) {
        this._celsius = celsius;
    }
    
    // Getter
    get celsius() {
        return this._celsius;
    }
    
    get fahrenheit() {
        return (this._celsius * 9/5) + 32;
    }
    
    get kelvin() {
        return this._celsius + 273.15;
    }
    
    // Setter
    set celsius(value) {
        if (value < -273.15) {
            throw new Error('Temperature cannot be below absolute zero');
        }
        this._celsius = value;
    }
    
    set fahrenheit(value) {
        this.celsius = (value - 32) * 5/9;
    }
    
    set kelvin(value) {
        this.celsius = value - 273.15;
    }
    
    // 计算属性
    get description() {
        if (this._celsius < 0) return 'Freezing';
        if (this._celsius < 10) return 'Cold';
        if (this._celsius < 25) return 'Cool';
        if (this._celsius < 35) return 'Warm';
        return 'Hot';
    }
}

// 使用示例
const temp = new Temperature(25);
console.log(temp.celsius);     // 25
console.log(temp.fahrenheit);  // 77
console.log(temp.kelvin);      // 298.15
console.log(temp.description); // Warm

temp.fahrenheit = 100;
console.log(temp.celsius);     // 37.77777777777778
console.log(temp.description); // Hot
```

### 3. 继承

#### 3.1 基本继承

```javascript
// 基类
class Animal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
        this.energy = 100;
    }
    
    eat(food) {
        console.log(`${this.name} is eating ${food}`);
        this.energy += 10;
        return this;
    }
    
    sleep() {
        console.log(`${this.name} is sleeping`);
        this.energy = 100;
        return this;
    }
    
    move() {
        console.log(`${this.name} is moving`);
        this.energy -= 5;
        return this;
    }
    
    getInfo() {
        return `${this.name} is a ${this.species} with ${this.energy} energy`;
    }
}

// 继承类
class Dog extends Animal {
    constructor(name, breed) {
        super(name, 'Dog'); // 调用父类构造函数
        this.breed = breed;
        this.loyalty = 100;
    }
    
    bark() {
        console.log(`${this.name} says: Woof! Woof!`);
        this.energy -= 2;
        return this;
    }
    
    fetch() {
        console.log(`${this.name} is fetching the ball`);
        this.energy -= 15;
        this.loyalty += 5;
        return this;
    }
    
    // 重写父类方法
    move() {
        console.log(`${this.name} is running around`);
        this.energy -= 8; // 狗跑步消耗更多能量
        return this;
    }
    
    // 扩展父类方法
    getInfo() {
        return `${super.getInfo()}, breed: ${this.breed}, loyalty: ${this.loyalty}`;
    }
}

class Cat extends Animal {
    constructor(name, color) {
        super(name, 'Cat');
        this.color = color;
        this.independence = 80;
    }
    
    meow() {
        console.log(`${this.name} says: Meow!`);
        this.energy -= 1;
        return this;
    }
    
    hunt() {
        console.log(`${this.name} is hunting`);
        this.energy -= 20;
        this.independence += 3;
        return this;
    }
    
    // 重写父类方法
    move() {
        console.log(`${this.name} is sneaking quietly`);
        this.energy -= 3; // 猫移动消耗较少能量
        return this;
    }
    
    getInfo() {
        return `${super.getInfo()}, color: ${this.color}, independence: ${this.independence}`;
    }
}

// 使用示例
const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.getInfo()); // Buddy is a Dog with 100 energy, breed: Golden Retriever, loyalty: 100

dog.bark().fetch().eat('dog food').move();
console.log(dog.getInfo());

const cat = new Cat('Whiskers', 'Orange');
console.log(cat.getInfo()); // Whiskers is a Cat with 100 energy, color: Orange, independence: 80

cat.meow().hunt().move().sleep();
console.log(cat.getInfo());
```

### 4. 静态方法和属性

#### 4.1 静态方法

```javascript
class MathUtils {
    // 静态方法
    static add(a, b) {
        return a + b;
    }
    
    static multiply(a, b) {
        return a * b;
    }
    
    static factorial(n) {
        if (n <= 1) return 1;
        return n * MathUtils.factorial(n - 1);
    }
    
    static isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
    }
}

// 使用静态方法
console.log(MathUtils.add(5, 3)); // 8
console.log(MathUtils.factorial(5)); // 120
console.log(MathUtils.isPrime(17)); // true
```

#### 4.2 静态属性和工厂方法

```javascript
class User {
    // 静态属性
    static defaultRole = 'user';
    static maxNameLength = 50;
    static validRoles = ['user', 'admin', 'moderator'];
    
    constructor(name, email, role = User.defaultRole) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.id = User.generateId();
        this.createdAt = new Date();
    }
    
    // 静态工厂方法
    static create(userData) {
        const { name, email, role } = userData;
        return new User(name, email, role);
    }
    
    static createAdmin(name, email) {
        return new User(name, email, 'admin');
    }
    
    static createFromJson(jsonString) {
        const data = JSON.parse(jsonString);
        return new User(data.name, data.email, data.role);
    }
    
    // 静态验证方法
    static validateName(name) {
        return name && name.length <= User.maxNameLength;
    }
    
    static validateRole(role) {
        return User.validRoles.includes(role);
    }
    
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 静态实用方法
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    static compareUsers(user1, user2) {
        return user1.createdAt.getTime() - user2.createdAt.getTime();
    }
}

// 使用静态方法和属性
console.log(User.defaultRole); // user
console.log(User.validRoles); // ['user', 'admin', 'moderator']

const user1 = User.create({
    name: 'Alice',
    email: 'alice@example.com',
    role: 'admin'
});

const admin = User.createAdmin('Bob', 'bob@example.com');

console.log(User.validateEmail('test@example.com')); // true
console.log(User.validateRole('admin')); // true
```

## 🎁 最佳实践

1. **使用类而不是函数构造器**：ES6类提供更清晰的语法
2. **合理使用继承**：避免过深的继承层次
3. **优先组合而非继承**：考虑使用组合模式
4. **使用私有字段**：保护内部状态
5. **静态方法用于工具函数**：不依赖实例状态的功能

## 🔄 练习题

1. **创建一个图形类层次结构**：包含抽象基类和具体实现
2. **实现一个验证器类**：支持多种验证规则
3. **设计一个任务管理系统**：使用继承和组合
4. **构建一个事件系统**：实现发布订阅模式

类和继承为JavaScript带来了更强大的面向对象编程能力！ 