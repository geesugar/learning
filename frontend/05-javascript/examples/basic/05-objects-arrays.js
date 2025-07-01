// JavaScript 对象与数组示例
// 运行命令：node 05-objects-arrays.js

console.log('=== JavaScript 对象与数组 ===\n');

// ============================================================================
// 1. 对象基础 (Object Basics)
// ============================================================================

console.log('1. 对象基础');

// 对象字面量
const person = {
    name: '张三',
    age: 25,
    city: '北京',
    hobbies: ['读书', '游泳', '编程'],
    isStudent: false
};

console.log('对象字面量:');
console.log(person);

// 访问对象属性
console.log('\n访问对象属性:');
console.log(`姓名: ${person.name}`);           // 点号访问
console.log(`年龄: ${person['age']}`);         // 方括号访问
console.log(`爱好: ${person.hobbies.join(', ')}`);

// 动态属性名
const propertyName = 'city';
console.log(`城市: ${person[propertyName]}`);

// 添加和修改属性
console.log('\n修改对象属性:');
person.job = '程序员';              // 添加属性
person.age = 26;                   // 修改属性
person['email'] = 'zhangsan@example.com';  // 动态添加

console.log('修改后的对象:', person);

// 删除属性
delete person.isStudent;
console.log('删除isStudent后:', person);

// 对象方法
const calculator = {
    result: 0,
    
    add: function(value) {
        this.result += value;
        return this;  // 支持链式调用
    },
    
    subtract(value) {  // ES6 简写语法
        this.result -= value;
        return this;
    },
    
    multiply: (value) => {
        // 注意：箭头函数中的this不指向对象
        console.log('箭头函数中的this:', this);
        return calculator.result * value;  // 需要显式引用对象
    },
    
    getResult() {
        return this.result;
    },
    
    reset() {
        this.result = 0;
        return this;
    }
};

console.log('\n对象方法:');
calculator.add(10).subtract(3).add(5);
console.log(`计算结果: ${calculator.getResult()}`);

// ============================================================================
// 2. 对象高级特性
// ============================================================================

console.log('\n2. 对象高级特性');

// 对象解构
const student = {
    name: '李四',
    age: 22,
    grades: {
        math: 95,
        english: 88,
        science: 92
    },
    contact: {
        email: 'lisi@example.com',
        phone: '123-456-7890'
    }
};

console.log('对象解构:');
const { name, age, grades } = student;
console.log(`学生: ${name}, 年龄: ${age}`);

// 嵌套解构
const { grades: { math, english } } = student;
console.log(`数学: ${math}, 英语: ${english}`);

// 重命名解构
const { name: studentName, contact: { email: studentEmail } } = student;
console.log(`学生姓名: ${studentName}, 邮箱: ${studentEmail}`);

// 默认值解构
const { height = 170, weight = 60 } = student;
console.log(`身高: ${height}cm, 体重: ${weight}kg`);

// 对象合并
console.log('\n对象合并:');
const basicInfo = { name: '王五', age: 24 };
const contactInfo = { email: 'wangwu@example.com', phone: '987-654-3210' };
const additionalInfo = { city: '上海', job: '设计师' };

// 使用 Object.assign()
const merged1 = Object.assign({}, basicInfo, contactInfo, additionalInfo);
console.log('Object.assign() 合并:', merged1);

// 使用展开运算符 (推荐)
const merged2 = { ...basicInfo, ...contactInfo, ...additionalInfo };
console.log('展开运算符合并:', merged2);

// 对象克隆
console.log('\n对象克隆:');
const original = {
    name: '原始对象',
    nested: { value: 42 },
    array: [1, 2, 3]
};

// 浅拷贝
const shallowCopy = { ...original };
shallowCopy.name = '浅拷贝';
shallowCopy.nested.value = 100;  // 会影响原对象

console.log('原始对象:', original);
console.log('浅拷贝对象:', shallowCopy);

// 深拷贝 (简单版本)
const deepCopy = JSON.parse(JSON.stringify(original));
deepCopy.name = '深拷贝';
deepCopy.nested.value = 200;  // 不会影响原对象

console.log('深拷贝后原始对象:', original);
console.log('深拷贝对象:', deepCopy);

// ============================================================================
// 3. 数组基础 (Array Basics)
// ============================================================================

console.log('\n3. 数组基础');

// 数组创建
const fruits = ['苹果', '香蕉', '橙子'];
const numbers = new Array(1, 2, 3, 4, 5);
const mixed = ['文本', 42, true, null, { key: 'value' }];

console.log('数组创建:');
console.log('水果数组:', fruits);
console.log('数字数组:', numbers);
console.log('混合数组:', mixed);

// 数组访问和修改
console.log('\n数组访问和修改:');
console.log(`第一个水果: ${fruits[0]}`);
console.log(`最后一个水果: ${fruits[fruits.length - 1]}`);

fruits[1] = '草莓';  // 修改元素
fruits[fruits.length] = '葡萄';  // 在末尾添加

console.log('修改后的水果数组:', fruits);

// 数组长度
console.log(`\n数组长度: ${fruits.length}`);

// 修改长度会影响数组
fruits.length = 2;
console.log('截断后的数组:', fruits);

// ============================================================================
// 4. 数组方法 (Array Methods)
// ============================================================================

console.log('\n4. 数组方法');

// 重新初始化数组用于演示
const colors = ['红色', '绿色', '蓝色'];
const scores = [85, 92, 78, 96, 88];

// 添加和删除元素
console.log('添加和删除元素:');
console.log('原始颜色数组:', colors);

colors.push('黄色');              // 末尾添加
console.log('push后:', colors);

colors.unshift('紫色');           // 开头添加
console.log('unshift后:', colors);

const lastColor = colors.pop();   // 末尾删除
console.log('pop删除的元素:', lastColor);
console.log('pop后:', colors);

const firstColor = colors.shift(); // 开头删除
console.log('shift删除的元素:', firstColor);
console.log('shift后:', colors);

// splice - 强大的数组修改方法
console.log('\nsplice 方法:');
const animals = ['猫', '狗', '鸟', '鱼', '兔子'];
console.log('原始动物数组:', animals);

// splice(开始索引, 删除数量, 添加元素...)
const removed = animals.splice(2, 1, '老虎', '狮子');
console.log('删除的元素:', removed);
console.log('splice后:', animals);

// 数组查找
console.log('\n数组查找:');
console.log('分数数组:', scores);

console.log(`indexOf(92): ${scores.indexOf(92)}`);
console.log(`lastIndexOf(78): ${scores.lastIndexOf(78)}`);
console.log(`includes(96): ${scores.includes(96)}`);
console.log(`includes(100): ${scores.includes(100)}`);

// find 和 findIndex
const students = [
    { name: '张三', score: 85 },
    { name: '李四', score: 92 },
    { name: '王五', score: 78 }
];

const highScorer = students.find(student => student.score > 90);
const lowScorerIndex = students.findIndex(student => student.score < 80);

console.log('\nfind 方法:');
console.log('高分学生:', highScorer);
console.log('低分学生索引:', lowScorerIndex);

// ============================================================================
// 5. 数组遍历和转换
// ============================================================================

console.log('\n5. 数组遍历和转换');

const testScores = [85, 92, 78, 96, 88, 94, 82];

// forEach - 遍历数组
console.log('forEach 遍历:');
testScores.forEach((score, index) => {
    console.log(`第${index + 1}个成绩: ${score}分`);
});

// map - 转换数组
console.log('\nmap 转换:');
const grades = testScores.map(score => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
});
console.log('原始分数:', testScores);
console.log('等级转换:', grades);

// filter - 过滤数组
console.log('\nfilter 过滤:');
const excellentScores = testScores.filter(score => score >= 90);
const passingScores = testScores.filter(score => score >= 60);

console.log('优秀成绩(>=90):', excellentScores);
console.log('及格成绩(>=60):', passingScores);

// reduce - 聚合数组
console.log('\nreduce 聚合:');
const total = testScores.reduce((sum, score) => sum + score, 0);
const average = total / testScores.length;

console.log(`总分: ${total}`);
console.log(`平均分: ${average.toFixed(2)}`);

// 复杂的reduce应用
const statistics = testScores.reduce((stats, score) => {
    stats.sum += score;
    stats.count++;
    stats.min = Math.min(stats.min, score);
    stats.max = Math.max(stats.max, score);
    return stats;
}, { sum: 0, count: 0, min: Infinity, max: -Infinity });

console.log('统计信息:', {
    ...statistics,
    average: (statistics.sum / statistics.count).toFixed(2)
});

// ============================================================================
// 6. 数组排序和反转
// ============================================================================

console.log('\n6. 数组排序和反转');

const unsortedNumbers = [64, 34, 25, 12, 22, 11, 90];
const names = ['张三', '李四', '王五', '赵六'];

console.log('原始数据:');
console.log('数字:', unsortedNumbers);
console.log('姓名:', names);

// sort() 方法
console.log('\n排序结果:');
const sortedNumbers = [...unsortedNumbers].sort((a, b) => a - b);
console.log('数字升序:', sortedNumbers);

const sortedNumbersDesc = [...unsortedNumbers].sort((a, b) => b - a);
console.log('数字降序:', sortedNumbersDesc);

const sortedNames = [...names].sort();
console.log('姓名排序:', sortedNames);

// 复杂对象排序
const people = [
    { name: '张三', age: 25, salary: 5000 },
    { name: '李四', age: 30, salary: 8000 },
    { name: '王五', age: 22, salary: 4500 },
    { name: '赵六', age: 28, salary: 6500 }
];

console.log('\n复杂对象排序:');
const sortedByAge = [...people].sort((a, b) => a.age - b.age);
const sortedBySalary = [...people].sort((a, b) => b.salary - a.salary);

console.log('按年龄升序:', sortedByAge);
console.log('按薪水降序:', sortedBySalary);

// reverse() 方法
console.log('\n数组反转:');
const originalArray = [1, 2, 3, 4, 5];
const reversedArray = [...originalArray].reverse();

console.log('原数组:', originalArray);
console.log('反转后:', reversedArray);

// ============================================================================
// 7. 数组解构和展开
// ============================================================================

console.log('\n7. 数组解构和展开');

const coordinates = [10, 20, 30];
const [x, y, z] = coordinates;

console.log('数组解构:');
console.log(`x: ${x}, y: ${y}, z: ${z}`);

// 跳过元素
const [first, , third] = coordinates;
console.log(`第一个: ${first}, 第三个: ${third}`);

// 剩余元素
const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const [firstNum, secondNum, ...restNumbers] = allNumbers;

console.log('\n剩余元素:');
console.log(`前两个: ${firstNum}, ${secondNum}`);
console.log(`剩余的: ${restNumbers}`);

// 数组展开
console.log('\n数组展开:');
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

console.log('合并数组:', combined);

// 函数参数展开
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(`sum(...arr1): ${sum(...arr1)}`);
console.log(`sum(1, 2, 3, 4, 5): ${sum(1, 2, 3, 4, 5)}`);

// ============================================================================
// 8. 多维数组
// ============================================================================

console.log('\n8. 多维数组');

// 二维数组 (矩阵)
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

console.log('二维数组:');
console.log(matrix);

// 访问二维数组元素
console.log(`matrix[1][2] = ${matrix[1][2]}`);  // 第2行第3列

// 遍历二维数组
console.log('\n遍历二维数组:');
for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
        process.stdout.write(`${matrix[i][j]} `);
    }
    console.log(); // 换行
}

// 使用 forEach 遍历
console.log('\n使用forEach遍历:');
matrix.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
        console.log(`[${rowIndex}][${colIndex}] = ${cell}`);
    });
});

// 矩阵转置
function transpose(matrix) {
    return matrix[0].map((_, colIndex) =>
        matrix.map(row => row[colIndex])
    );
}

console.log('\n矩阵转置:');
const transposed = transpose(matrix);
console.log('原矩阵:', matrix);
console.log('转置后:', transposed);

// ============================================================================
// 9. 类数组对象
// ============================================================================

console.log('\n9. 类数组对象');

// 创建类数组对象
const arrayLike = {
    0: 'first',
    1: 'second',
    2: 'third',
    length: 3
};

console.log('类数组对象:', arrayLike);

// 转换为真正的数组
const realArray1 = Array.from(arrayLike);
const realArray2 = [...arrayLike];  // 这个对于类数组对象可能不工作
const realArray3 = Array.prototype.slice.call(arrayLike);

console.log('转换为数组:');
console.log('Array.from():', realArray1);
console.log('slice.call():', realArray3);

// Array.from 的高级用法
console.log('\nArray.from 高级用法:');
const doubled = Array.from(arrayLike, item => item.toUpperCase());
console.log('转换并处理:', doubled);

// 生成数组
const sequence = Array.from({ length: 5 }, (_, index) => index * 2);
console.log('生成数组:', sequence);

// ============================================================================
// 10. 实用示例：数据处理
// ============================================================================

console.log('\n10. 实用示例：数据处理');

// 学生成绩管理系统
const studentData = [
    { id: 1, name: '张三', subjects: { math: 85, english: 78, science: 92 } },
    { id: 2, name: '李四', subjects: { math: 92, english: 88, science: 85 } },
    { id: 3, name: '王五', subjects: { math: 76, english: 82, science: 79 } },
    { id: 4, name: '赵六', subjects: { math: 89, english: 91, science: 87 } },
    { id: 5, name: '孙七', subjects: { math: 94, english: 86, science: 95 } }
];

console.log('学生数据分析:');

// 计算每个学生的平均分
const studentsWithAverage = studentData.map(student => {
    const subjects = student.subjects;
    const total = Object.values(subjects).reduce((sum, score) => sum + score, 0);
    const average = total / Object.keys(subjects).length;
    
    return {
        ...student,
        average: Math.round(average * 100) / 100,
        total: total
    };
});

console.log('\n学生平均分:');
studentsWithAverage.forEach(student => {
    console.log(`${student.name}: 平均分 ${student.average}, 总分 ${student.total}`);
});

// 找出各科最高分
const subjectNames = Object.keys(studentData[0].subjects);
const topScorers = {};

subjectNames.forEach(subject => {
    const topStudent = studentData.reduce((top, student) => {
        return student.subjects[subject] > top.subjects[subject] ? student : top;
    });
    topScorers[subject] = {
        name: topStudent.name,
        score: topStudent.subjects[subject]
    };
});

console.log('\n各科最高分:');
Object.entries(topScorers).forEach(([subject, info]) => {
    console.log(`${subject}: ${info.name} (${info.score}分)`);
});

// 统计分数分布
const gradeDistribution = studentsWithAverage.reduce((dist, student) => {
    let grade;
    if (student.average >= 90) grade = 'A';
    else if (student.average >= 80) grade = 'B';
    else if (student.average >= 70) grade = 'C';
    else grade = 'D';
    
    dist[grade] = (dist[grade] || 0) + 1;
    return dist;
}, {});

console.log('\n成绩分布:');
Object.entries(gradeDistribution).forEach(([grade, count]) => {
    console.log(`${grade}级: ${count}人`);
});

// ============================================================================
// 11. 性能考虑
// ============================================================================

console.log('\n11. 性能考虑');

// 大数组性能测试
function performanceTest() {
    const largeArray = Array.from({ length: 100000 }, (_, i) => i);
    
    console.log('性能测试 (100,000 元素):');
    
    // 测试 for 循环
    console.time('for循环');
    let sum1 = 0;
    for (let i = 0; i < largeArray.length; i++) {
        sum1 += largeArray[i];
    }
    console.timeEnd('for循环');
    
    // 测试 forEach
    console.time('forEach');
    let sum2 = 0;
    largeArray.forEach(num => sum2 += num);
    console.timeEnd('forEach');
    
    // 测试 reduce
    console.time('reduce');
    const sum3 = largeArray.reduce((sum, num) => sum + num, 0);
    console.timeEnd('reduce');
    
    console.log(`所有结果相等: ${sum1 === sum2 && sum2 === sum3}`);
}

performanceTest();

// 内存效率建议
console.log('\n内存效率建议:');
console.log('1. 避免创建不必要的中间数组');
console.log('2. 使用适当的数据结构');
console.log('3. 及时清理不需要的引用');

// ============================================================================
// 12. 练习题
// ============================================================================

console.log('\n12. 练习题');

console.log('请完成以下练习:');
console.log('1. 实现数组去重函数');
console.log('2. 实现数组扁平化函数');
console.log('3. 实现对象深度合并函数');
console.log('4. 实现分组函数 (groupBy)');

// 练习答案
console.log('\n练习答案:');

// 1. 数组去重
function uniqueArray(arr) {
    return [...new Set(arr)];
}

// 或者使用 filter
function uniqueArrayFilter(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

console.log('\n1. 数组去重:');
const duplicateArray = [1, 2, 2, 3, 4, 4, 5, 1];
console.log('原数组:', duplicateArray);
console.log('去重结果(Set):', uniqueArray(duplicateArray));
console.log('去重结果(filter):', uniqueArrayFilter(duplicateArray));

// 2. 数组扁平化
function flattenArray(arr, depth = Infinity) {
    if (depth === 0) return arr.slice();
    
    return arr.reduce((flat, item) => {
        if (Array.isArray(item)) {
            flat.push(...flattenArray(item, depth - 1));
        } else {
            flat.push(item);
        }
        return flat;
    }, []);
}

console.log('\n2. 数组扁平化:');
const nestedArray = [1, [2, 3], [4, [5, 6]], 7];
console.log('嵌套数组:', nestedArray);
console.log('扁平化结果:', flattenArray(nestedArray));

// 3. 对象深度合并
function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (typeof target === 'object' && typeof source === 'object') {
        for (let key in source) {
            if (typeof source[key] === 'object' && source[key] !== null) {
                if (!target[key]) target[key] = {};
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    
    return deepMerge(target, ...sources);
}

console.log('\n3. 对象深度合并:');
const obj1 = { a: 1, b: { x: 1, y: 2 } };
const obj2 = { a: 2, b: { y: 3, z: 4 }, c: 3 };
const merged = deepMerge({}, obj1, obj2);
console.log('对象1:', obj1);
console.log('对象2:', obj2);
console.log('合并结果:', merged);

// 4. 分组函数
function groupBy(array, keyFunction) {
    return array.reduce((groups, item) => {
        const key = keyFunction(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

console.log('\n4. 分组函数:');
const products = [
    { name: '苹果', category: '水果', price: 5 },
    { name: '香蕉', category: '水果', price: 3 },
    { name: '胡萝卜', category: '蔬菜', price: 2 },
    { name: '白菜', category: '蔬菜', price: 1 }
];

console.log('原始产品:', products);

const groupedByCategory = groupBy(products, item => item.category);
console.log('按类别分组:', groupedByCategory);

const groupedByPriceRange = groupBy(products, item => {
    if (item.price <= 2) return '低价';
    if (item.price <= 4) return '中价';
    return '高价';
});
console.log('按价格分组:', groupedByPriceRange);

// ============================================================================
// 13. 知识小结
// ============================================================================

console.log('\n=== 知识小结 ===');
console.log('✅ 掌握了对象的创建、访问和修改');
console.log('✅ 学会了对象解构、合并和克隆');
console.log('✅ 理解了数组的各种操作方法');
console.log('✅ 掌握了数组的遍历、转换和排序');
console.log('✅ 学会了多维数组和类数组对象');
console.log('✅ 能够处理复杂的数据结构和算法');

console.log('\n下一步学习：错误处理与调试 (06-error-handling.js)'); 