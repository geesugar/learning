# Canvas交互控制

## 学习目标
- 掌握Canvas中的鼠标事件处理技术
- 学会实现键盘输入响应机制
- 理解触摸事件和手势识别
- 实现复杂的拖拽操作功能
- 构建直观的用户交互界面

## 1. 鼠标事件处理

### 1.1 基础鼠标事件

```javascript
// 鼠标事件管理器
class MouseManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.isMouseDown = false;
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.button = -1; // 0: 左键, 1: 中键, 2: 右键
        
        // 事件回调
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onMouseMove = null;
        this.onMouseClick = null;
        this.onMouseWheel = null;
        
        this.setupEvents();
    }
    
    setupEvents() {
        // 获取Canvas相对坐标
        const getRelativePos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        
        // 鼠标按下
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isMouseDown = true;
            this.button = e.button;
            this.mousePos = getRelativePos(e);
            this.lastMousePos = {...this.mousePos};
            
            if (this.onMouseDown) {
                this.onMouseDown(this.mousePos, this.button);
            }
        });
        
        // 鼠标释放
        this.canvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.isMouseDown = false;
            this.mousePos = getRelativePos(e);
            
            if (this.onMouseUp) {
                this.onMouseUp(this.mousePos, this.button);
            }
        });
        
        // 鼠标移动
        this.canvas.addEventListener('mousemove', (e) => {
            e.preventDefault();
            this.lastMousePos = {...this.mousePos};
            this.mousePos = getRelativePos(e);
            
            if (this.onMouseMove) {
                this.onMouseMove(this.mousePos, this.lastMousePos, this.isMouseDown);
            }
        });
        
        // 鼠标点击
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            const pos = getRelativePos(e);
            
            if (this.onMouseClick) {
                this.onMouseClick(pos, e.button);
            }
        });
        
        // 鼠标滚轮
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const pos = getRelativePos(e);
            const delta = e.deltaY > 0 ? 1 : -1;
            
            if (this.onMouseWheel) {
                this.onMouseWheel(pos, delta);
            }
        });
        
        // 防止右键菜单
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    // 检查鼠标是否在指定区域内
    isInBounds(x, y, width, height) {
        return this.mousePos.x >= x && 
               this.mousePos.x <= x + width &&
               this.mousePos.y >= y && 
               this.mousePos.y <= y + height;
    }
    
    // 获取鼠标移动向量
    getMouseDelta() {
        return {
            x: this.mousePos.x - this.lastMousePos.x,
            y: this.mousePos.y - this.lastMousePos.y
        };
    }
}
```

### 1.2 高级鼠标交互

```javascript
// 可交互对象基类
class InteractiveObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isHovered = false;
        this.isPressed = false;
        this.isDraggable = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // 事件回调
        this.onHover = null;
        this.onPress = null;
        this.onRelease = null;
        this.onDrag = null;
    }
    
    // 检查点是否在对象内
    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    // 处理鼠标事件
    handleMouseDown(mousePos, button) {
        if (this.contains(mousePos.x, mousePos.y)) {
            this.isPressed = true;
            
            if (this.isDraggable) {
                this.isDragging = true;
                this.dragOffset.x = mousePos.x - this.x;
                this.dragOffset.y = mousePos.y - this.y;
            }
            
            if (this.onPress) {
                this.onPress(mousePos);
            }
            
            return true; // 消费了事件
        }
        return false;
    }
    
    handleMouseUp(mousePos, button) {
        if (this.isPressed) {
            this.isPressed = false;
            this.isDragging = false;
            
            if (this.onRelease) {
                this.onRelease(mousePos);
            }
            
            return true;
        }
        return false;
    }
    
    handleMouseMove(mousePos, lastMousePos, isMouseDown) {
        const wasHovered = this.isHovered;
        this.isHovered = this.contains(mousePos.x, mousePos.y);
        
        // 悬停状态改变
        if (this.isHovered !== wasHovered && this.onHover) {
            this.onHover(this.isHovered, mousePos);
        }
        
        // 拖拽处理
        if (this.isDragging && isMouseDown) {
            this.x = mousePos.x - this.dragOffset.x;
            this.y = mousePos.y - this.dragOffset.y;
            
            if (this.onDrag) {
                this.onDrag(mousePos, lastMousePos);
            }
        }
        
        return this.isHovered;
    }
}
```

## 2. 键盘输入系统

```javascript
// 键盘管理器
class KeyboardManager {
    constructor() {
        this.keys = new Map(); // 当前按下的键
        this.keyStates = new Map(); // 键的状态历史
        
        // 事件回调
        this.onKeyDown = null;
        this.onKeyUp = null;
        this.onKeyPress = null;
        
        this.setupEvents();
    }
    
    setupEvents() {
        // 键盘按下
        document.addEventListener('keydown', (e) => {
            const key = e.code || e.key;
            
            if (!this.keys.has(key)) {
                this.keys.set(key, true);
                this.keyStates.set(key, 'pressed');
                
                if (this.onKeyDown) {
                    this.onKeyDown(key, e);
                }
            }
        });
        
        // 键盘释放
        document.addEventListener('keyup', (e) => {
            const key = e.code || e.key;
            
            if (this.keys.has(key)) {
                this.keys.delete(key);
                this.keyStates.set(key, 'released');
                
                if (this.onKeyUp) {
                    this.onKeyUp(key, e);
                }
            }
        });
        
        // 键盘输入（处理文本输入）
        document.addEventListener('keypress', (e) => {
            if (this.onKeyPress) {
                this.onKeyPress(e.key, e);
            }
        });
    }
    
    // 检查键是否被按下
    isKeyDown(key) {
        return this.keys.has(key);
    }
    
    // 检查键是否刚被按下
    isKeyPressed(key) {
        return this.keyStates.get(key) === 'pressed';
    }
    
    // 检查键是否刚被释放
    isKeyReleased(key) {
        return this.keyStates.get(key) === 'released';
    }
    
    // 更新键状态（需要在每帧调用）
    update() {
        // 清除单帧状态
        for (const [key, state] of this.keyStates) {
            if (state === 'pressed' || state === 'released') {
                this.keyStates.set(key, 'held');
            }
        }
    }
    
    // 获取所有按下的键
    getActiveKeys() {
        return Array.from(this.keys.keys());
    }
}

// 键盘控制的游戏对象示例
class KeyboardControlledPlayer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 200; // 像素/秒
        this.size = 20;
        this.color = '#4CAF50';
        
        // 键位映射
        this.keyMap = {
            'KeyW': 'up',
            'KeyS': 'down',
            'KeyA': 'left',
            'KeyD': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'Space': 'action'
        };
    }
    
    update(deltaTime, keyboardManager) {
        const dt = deltaTime / 1000;
        
        // 移动控制
        if (keyboardManager.isKeyDown('KeyW') || keyboardManager.isKeyDown('ArrowUp')) {
            this.y -= this.speed * dt;
        }
        if (keyboardManager.isKeyDown('KeyS') || keyboardManager.isKeyDown('ArrowDown')) {
            this.y += this.speed * dt;
        }
        if (keyboardManager.isKeyDown('KeyA') || keyboardManager.isKeyDown('ArrowLeft')) {
            this.x -= this.speed * dt;
        }
        if (keyboardManager.isKeyDown('KeyD') || keyboardManager.isKeyDown('ArrowRight')) {
            this.x += this.speed * dt;
        }
        
        // 动作键
        if (keyboardManager.isKeyPressed('Space')) {
            this.performAction();
        }
    }
    
    performAction() {
        // 执行动作，比如射击、跳跃等
        console.log('Player action triggered!');
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // 绘制方向指示器
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
}
```

## 3. 触摸事件处理

```javascript
// 触摸管理器
class TouchManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.touches = new Map(); // 当前活动的触摸点
        this.gestures = {
            pinch: { active: false, startDistance: 0, currentDistance: 0, scale: 1 },
            pan: { active: false, startPos: null, currentPos: null, delta: { x: 0, y: 0 } }
        };
        
        // 事件回调
        this.onTouchStart = null;
        this.onTouchMove = null;
        this.onTouchEnd = null;
        this.onPinch = null;
        this.onPan = null;
        
        this.setupEvents();
    }
    
    setupEvents() {
        // 获取触摸相对坐标
        const getRelativePos = (touch) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        };
        
        // 触摸开始
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            for (const touch of e.changedTouches) {
                const pos = getRelativePos(touch);
                this.touches.set(touch.identifier, {
                    id: touch.identifier,
                    startPos: pos,
                    currentPos: pos,
                    startTime: Date.now()
                });
            }
            
            this.updateGestures();
            
            if (this.onTouchStart) {
                this.onTouchStart(Array.from(this.touches.values()));
            }
        });
        
        // 触摸移动
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            for (const touch of e.changedTouches) {
                const touchData = this.touches.get(touch.identifier);
                if (touchData) {
                    touchData.currentPos = getRelativePos(touch);
                }
            }
            
            this.updateGestures();
            
            if (this.onTouchMove) {
                this.onTouchMove(Array.from(this.touches.values()));
            }
        });
        
        // 触摸结束
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            for (const touch of e.changedTouches) {
                this.touches.delete(touch.identifier);
            }
            
            this.updateGestures();
            
            if (this.onTouchEnd) {
                this.onTouchEnd(Array.from(this.touches.values()));
            }
        });
        
        // 触摸取消
        this.canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                this.touches.delete(touch.identifier);
            }
            this.updateGestures();
        });
    }
    
    updateGestures() {
        const touchArray = Array.from(this.touches.values());
        
        // 双指缩放手势
        if (touchArray.length === 2) {
            const touch1 = touchArray[0];
            const touch2 = touchArray[1];
            
            const currentDistance = this.getDistance(
                touch1.currentPos, touch2.currentPos
            );
            
            if (!this.gestures.pinch.active) {
                this.gestures.pinch.active = true;
                this.gestures.pinch.startDistance = currentDistance;
            }
            
            this.gestures.pinch.currentDistance = currentDistance;
            this.gestures.pinch.scale = currentDistance / this.gestures.pinch.startDistance;
            
            if (this.onPinch) {
                this.onPinch(this.gestures.pinch.scale, {
                    x: (touch1.currentPos.x + touch2.currentPos.x) / 2,
                    y: (touch1.currentPos.y + touch2.currentPos.y) / 2
                });
            }
        } else {
            this.gestures.pinch.active = false;
        }
        
        // 单指拖拽手势
        if (touchArray.length === 1) {
            const touch = touchArray[0];
            
            if (!this.gestures.pan.active) {
                this.gestures.pan.active = true;
                this.gestures.pan.startPos = touch.startPos;
            }
            
            this.gestures.pan.currentPos = touch.currentPos;
            this.gestures.pan.delta = {
                x: touch.currentPos.x - touch.startPos.x,
                y: touch.currentPos.y - touch.startPos.y
            };
            
            if (this.onPan) {
                this.onPan(this.gestures.pan.delta, touch.currentPos);
            }
        } else {
            this.gestures.pan.active = false;
        }
    }
    
    getDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getTouchCount() {
        return this.touches.size;
    }
}
```

## 4. 拖拽系统

```javascript
// 高级拖拽系统
class DragDropSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.dragObjects = []; // 可拖拽对象列表
        this.dropZones = [];   // 拖拽目标区域
        this.draggedObject = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = false;
        
        // 拖拽状态
        this.dragPreview = null;
        this.dropTarget = null;
        
        this.setupEvents();
    }
    
    setupEvents() {
        const mouseManager = new MouseManager(this.canvas);
        
        mouseManager.onMouseDown = (pos, button) => {
            if (button === 0) { // 左键
                this.startDrag(pos);
            }
        };
        
        mouseManager.onMouseMove = (pos, lastPos, isMouseDown) => {
            if (this.isDragging) {
                this.updateDrag(pos);
            } else {
                this.updateHover(pos);
            }
        };
        
        mouseManager.onMouseUp = (pos, button) => {
            if (button === 0 && this.isDragging) {
                this.endDrag(pos);
            }
        };
    }
    
    addDragObject(obj) {
        obj.isDragObject = true;
        obj.isHovered = false;
        obj.isDragging = false;
        obj.originalPosition = { x: obj.x, y: obj.y };
        this.dragObjects.push(obj);
    }
    
    addDropZone(zone) {
        zone.isDropZone = true;
        zone.isActive = false;
        zone.acceptsType = zone.acceptsType || 'any';
        this.dropZones.push(zone);
    }
    
    startDrag(pos) {
        // 从上到下查找可拖拽对象
        for (let i = this.dragObjects.length - 1; i >= 0; i--) {
            const obj = this.dragObjects[i];
            
            if (this.isPointInObject(pos, obj)) {
                this.draggedObject = obj;
                this.isDragging = true;
                obj.isDragging = true;
                
                // 计算拖拽偏移
                this.dragOffset.x = pos.x - obj.x;
                this.dragOffset.y = pos.y - obj.y;
                
                // 创建拖拽预览
                this.createDragPreview(obj);
                
                // 调用开始拖拽回调
                if (obj.onDragStart) {
                    obj.onDragStart(pos);
                }
                
                break;
            }
        }
    }
    
    updateDrag(pos) {
        if (!this.draggedObject) return;
        
        // 更新拖拽对象位置
        this.draggedObject.x = pos.x - this.dragOffset.x;
        this.draggedObject.y = pos.y - this.dragOffset.y;
        
        // 检查拖拽目标
        this.dropTarget = null;
        for (const zone of this.dropZones) {
            zone.isActive = false;
            
            if (this.isPointInObject(pos, zone) && 
                this.canDrop(this.draggedObject, zone)) {
                this.dropTarget = zone;
                zone.isActive = true;
                break;
            }
        }
        
        // 调用拖拽中回调
        if (this.draggedObject.onDrag) {
            this.draggedObject.onDrag(pos, this.dropTarget);
        }
    }
    
    endDrag(pos) {
        if (!this.draggedObject) return;
        
        let dropSuccessful = false;
        
        // 检查是否放置到有效目标
        if (this.dropTarget && this.canDrop(this.draggedObject, this.dropTarget)) {
            // 执行放置操作
            if (this.dropTarget.onDrop) {
                dropSuccessful = this.dropTarget.onDrop(this.draggedObject, pos);
            }
            
            if (this.draggedObject.onDropped) {
                this.draggedObject.onDropped(this.dropTarget, dropSuccessful);
            }
        }
        
        // 如果放置失败，回到原位置
        if (!dropSuccessful) {
            this.animateToOriginalPosition(this.draggedObject);
        }
        
        // 清理拖拽状态
        this.draggedObject.isDragging = false;
        this.draggedObject = null;
        this.isDragging = false;
        this.dragPreview = null;
        
        // 清除所有drop zone的活动状态
        this.dropZones.forEach(zone => zone.isActive = false);
    }
    
    updateHover(pos) {
        // 更新悬停状态
        this.dragObjects.forEach(obj => {
            obj.isHovered = this.isPointInObject(pos, obj);
        });
        
        this.dropZones.forEach(zone => {
            zone.isHovered = this.isPointInObject(pos, zone);
        });
    }
    
    isPointInObject(point, obj) {
        if (obj.contains) {
            return obj.contains(point.x, point.y);
        }
        
        // 默认矩形检测
        return point.x >= obj.x && point.x <= obj.x + obj.width &&
               point.y >= obj.y && point.y <= obj.y + obj.height;
    }
    
    canDrop(dragObj, dropZone) {
        if (dropZone.acceptsType === 'any') return true;
        if (dropZone.acceptsType === dragObj.type) return true;
        
        // 自定义验证函数
        if (dropZone.canAccept) {
            return dropZone.canAccept(dragObj);
        }
        
        return false;
    }
    
    createDragPreview(obj) {
        // 创建拖拽预览（可以是半透明版本）
        this.dragPreview = {
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            color: obj.color,
            alpha: 0.7
        };
    }
    
    animateToOriginalPosition(obj) {
        // 简单的回弹动画
        const startX = obj.x;
        const startY = obj.y;
        const targetX = obj.originalPosition.x;
        const targetY = obj.originalPosition.y;
        const duration = 300; // 毫秒
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeOutCubic(progress);
            
            obj.x = startX + (targetX - startX) * eased;
            obj.y = startY + (targetY - startY) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    draw() {
        // 绘制拖拽目标区域
        this.dropZones.forEach(zone => {
            this.ctx.save();
            
            if (zone.isActive) {
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            } else if (zone.isHovered) {
                this.ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
            } else {
                this.ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
            }
            
            this.ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
            this.ctx.strokeStyle = zone.isActive ? '#00ff00' : '#cccccc';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
            
            this.ctx.restore();
        });
        
        // 绘制拖拽对象
        this.dragObjects.forEach(obj => {
            this.ctx.save();
            
            if (obj.isDragging) {
                this.ctx.globalAlpha = 0.8;
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowOffsetX = 5;
                this.ctx.shadowOffsetY = 5;
            } else if (obj.isHovered) {
                this.ctx.shadowColor = 'rgba(0, 100, 255, 0.5)';
                this.ctx.shadowBlur = 5;
            }
            
            this.ctx.fillStyle = obj.color;
            this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            // 绘制边框
            this.ctx.strokeStyle = obj.isDragging ? '#ff6600' : '#333333';
            this.ctx.lineWidth = obj.isHovered || obj.isDragging ? 2 : 1;
            this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            
            this.ctx.restore();
        });
    }
}
```

## 5. 综合示例：交互式画板

```javascript
// 交互式画板应用
class InteractiveDrawingBoard {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 绘画状态
        this.isDrawing = false;
        this.currentPath = [];
        this.paths = [];
        this.currentTool = 'brush';
        this.brushSize = 5;
        this.brushColor = '#000000';
        
        // 工具面板
        this.toolPanel = {
            x: 10, y: 10, width: 200, height: 100,
            buttons: []
        };
        
        // 交互管理器
        this.mouseManager = new MouseManager(canvas);
        this.keyboardManager = new KeyboardManager();
        
        this.setupInteractions();
        this.createToolPanel();
    }
    
    setupInteractions() {
        // 鼠标绘画
        this.mouseManager.onMouseDown = (pos, button) => {
            if (button === 0) { // 左键
                if (this.isInToolPanel(pos)) {
                    this.handleToolPanelClick(pos);
                } else {
                    this.startDrawing(pos);
                }
            }
        };
        
        this.mouseManager.onMouseMove = (pos, lastPos, isMouseDown) => {
            if (this.isDrawing && isMouseDown) {
                this.continueDrawing(pos);
            }
        };
        
        this.mouseManager.onMouseUp = (pos, button) => {
            if (button === 0 && this.isDrawing) {
                this.endDrawing(pos);
            }
        };
        
        // 键盘快捷键
        this.keyboardManager.onKeyDown = (key, e) => {
            switch(key) {
                case 'KeyB':
                    this.currentTool = 'brush';
                    break;
                case 'KeyE':
                    this.currentTool = 'eraser';
                    break;
                case 'KeyC':
                    if (e.ctrlKey) {
                        this.clearCanvas();
                    }
                    break;
                case 'KeyZ':
                    if (e.ctrlKey) {
                        this.undo();
                    }
                    break;
            }
        };
        
        // 鼠标滚轮调整画笔大小
        this.mouseManager.onMouseWheel = (pos, delta) => {
            if (!this.isInToolPanel(pos)) {
                this.brushSize = Math.max(1, Math.min(50, this.brushSize + delta));
            }
        };
    }
    
    createToolPanel() {
        // 创建工具按钮
        this.toolPanel.buttons = [
            {
                x: 20, y: 20, width: 40, height: 30,
                label: 'Brush', tool: 'brush', color: '#4CAF50'
            },
            {
                x: 70, y: 20, width: 40, height: 30,
                label: 'Eraser', tool: 'eraser', color: '#f44336'
            },
            {
                x: 120, y: 20, width: 40, height: 30,
                label: 'Clear', tool: 'clear', color: '#FF9800'
            },
            {
                x: 20, y: 60, width: 60, height: 20,
                label: 'Size: ', type: 'slider', property: 'brushSize'
            }
        ];
    }
    
    isInToolPanel(pos) {
        const panel = this.toolPanel;
        return pos.x >= panel.x && pos.x <= panel.x + panel.width &&
               pos.y >= panel.y && pos.y <= panel.y + panel.height;
    }
    
    handleToolPanelClick(pos) {
        for (const button of this.toolPanel.buttons) {
            if (pos.x >= button.x && pos.x <= button.x + button.width &&
                pos.y >= button.y && pos.y <= button.y + button.height) {
                
                if (button.tool) {
                    if (button.tool === 'clear') {
                        this.clearCanvas();
                    } else {
                        this.currentTool = button.tool;
                    }
                }
                break;
            }
        }
    }
    
    startDrawing(pos) {
        this.isDrawing = true;
        this.currentPath = [{
            x: pos.x, y: pos.y,
            tool: this.currentTool,
            size: this.brushSize,
            color: this.brushColor
        }];
    }
    
    continueDrawing(pos) {
        this.currentPath.push({
            x: pos.x, y: pos.y,
            tool: this.currentTool,
            size: this.brushSize,
            color: this.brushColor
        });
        
        // 实时绘制
        this.drawPath(this.currentPath);
    }
    
    endDrawing(pos) {
        if (this.currentPath.length > 0) {
            this.paths.push([...this.currentPath]);
        }
        this.isDrawing = false;
        this.currentPath = [];
    }
    
    drawPath(path) {
        if (path.length < 2) return;
        
        const firstPoint = path[0];
        this.ctx.save();
        
        if (firstPoint.tool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        this.ctx.strokeStyle = firstPoint.color;
        this.ctx.lineWidth = firstPoint.size;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.paths = [];
    }
    
    undo() {
        if (this.paths.length > 0) {
            this.paths.pop();
            this.redrawCanvas();
        }
    }
    
    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const path of this.paths) {
            this.drawPath(path);
        }
    }
    
    drawToolPanel() {
        const panel = this.toolPanel;
        
        // 绘制面板背景
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
        
        // 绘制按钮
        for (const button of panel.buttons) {
            this.ctx.fillStyle = this.currentTool === button.tool ? button.color : '#eeeeee';
            this.ctx.fillRect(button.x, button.y, button.width, button.height);
            this.ctx.strokeStyle = '#888888';
            this.ctx.strokeRect(button.x, button.y, button.width, button.height);
            
            // 绘制按钮文字
            this.ctx.fillStyle = '#333333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(button.label, 
                button.x + button.width/2, 
                button.y + button.height/2 + 4);
        }
        
        // 绘制画笔大小指示器
        this.ctx.fillStyle = this.brushColor;
        this.ctx.beginPath();
        this.ctx.arc(180, 70, this.brushSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 显示大小数值
        this.ctx.fillStyle = '#333333';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${this.brushSize}px`, 90, 75);
    }
    
    draw() {
        // 绘制当前正在画的路径
        if (this.currentPath.length > 0) {
            this.drawPath(this.currentPath);
        }
        
        // 绘制工具面板
        this.drawToolPanel();
    }
    
    update() {
        this.keyboardManager.update();
    }
    
    animate() {
        const animate = () => {
            this.update();
            this.draw();
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    start() {
        this.animate();
    }
}

// 启动交互式画板
const drawingBoard = new InteractiveDrawingBoard(canvas);
drawingBoard.start();
```

## 6. 实践练习

### 练习1：拖拽拼图游戏
创建一个拖拽拼图游戏，包含拼图片段的拖拽和自动对齐功能。

### 练习2：多点触控缩放
实现多点触控的图片缩放和旋转功能。

### 练习3：虚拟键盘
创建一个虚拟键盘界面，支持鼠标点击和触摸输入。

## 总结

本章全面学习了Canvas的交互控制技术：

1. **鼠标事件**：掌握了完整的鼠标交互处理流程
2. **键盘输入**：学会了键盘事件的响应和状态管理
3. **触摸支持**：实现了移动端的触摸和手势识别
4. **拖拽系统**：构建了完整的拖拽交互框架

这些技术为创建丰富的用户交互体验和复杂的交互应用提供了坚实的基础。 