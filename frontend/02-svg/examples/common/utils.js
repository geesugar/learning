// SVG 示例工具函数库

/**
 * 通用工具函数
 */
const SVGUtils = {
    
    /**
     * 创建 SVG 元素
     * @param {string} tag - 元素标签名
     * @param {Object} attributes - 属性对象
     * @param {string} content - 内容文本
     * @returns {Element} SVG 元素
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        
        // 设置属性
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        // 设置内容
        if (content) {
            element.textContent = content;
        }
        
        return element;
    },

    /**
     * 更新 SVG 元素属性
     * @param {Element} element - SVG 元素
     * @param {Object} attributes - 新属性
     */
    updateAttributes(element, attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    },

    /**
     * 获取元素的边界框
     * @param {Element} element - SVG 元素
     * @returns {DOMRect} 边界框信息
     */
    getBBox(element) {
        return element.getBBox();
    },

    /**
     * 创建完整的 SVG 容器
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} viewBox - 视口
     * @returns {Element} SVG 容器
     */
    createSVG(width = 300, height = 200, viewBox = null) {
        const svg = this.createElement('svg', {
            width: width,
            height: height,
            xmlns: 'http://www.w3.org/2000/svg'
        });
        
        if (viewBox) {
            svg.setAttribute('viewBox', viewBox);
        } else {
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
        
        return svg;
    },

    /**
     * 添加样式定义
     * @param {Element} svg - SVG 容器
     * @param {string} css - CSS 样式
     */
    addStyles(svg, css) {
        const defs = svg.querySelector('defs') || svg.appendChild(this.createElement('defs'));
        const style = this.createElement('style');
        style.textContent = css;
        defs.appendChild(style);
    },

    /**
     * 清空容器内容
     * @param {Element} container - 容器元素
     */
    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    },

    /**
     * 添加到指定容器
     * @param {Element} container - 容器
     * @param {Element} element - 要添加的元素
     */
    appendTo(container, element) {
        container.appendChild(element);
    },

    /**
     * 动画工具
     */
    animation: {
        /**
         * 创建 SMIL 动画
         * @param {string} attributeName - 动画属性
         * @param {string} values - 动画值
         * @param {number} duration - 持续时间（秒）
         * @param {string} repeatCount - 重复次数
         * @returns {Element} animate 元素
         */
        createSMIL(attributeName, values, duration = 1, repeatCount = 'indefinite') {
            return SVGUtils.createElement('animate', {
                attributeName: attributeName,
                values: values,
                dur: `${duration}s`,
                repeatCount: repeatCount
            });
        },

        /**
         * 创建变换动画
         * @param {string} type - 变换类型 (translate, rotate, scale)
         * @param {string} values - 动画值
         * @param {number} duration - 持续时间
         * @param {string} repeatCount - 重复次数
         * @returns {Element} animateTransform 元素
         */
        createTransform(type, values, duration = 1, repeatCount = 'indefinite') {
            return SVGUtils.createElement('animateTransform', {
                attributeName: 'transform',
                type: type,
                values: values,
                dur: `${duration}s`,
                repeatCount: repeatCount
            });
        },

        /**
         * 创建路径动画
         * @param {string} path - 路径数据
         * @param {number} duration - 持续时间
         * @param {string} repeatCount - 重复次数
         * @returns {Element} animateMotion 元素
         */
        createMotion(path, duration = 1, repeatCount = 'indefinite') {
            const motion = SVGUtils.createElement('animateMotion', {
                dur: `${duration}s`,
                repeatCount: repeatCount
            });
            
            const motionPath = SVGUtils.createElement('mpath');
            motionPath.setAttribute('href', path);
            motion.appendChild(motionPath);
            
            return motion;
        }
    }
};

/**
 * 交互控制器工具
 */
const ControlUtils = {
    
    /**
     * 创建滑块控制器
     * @param {string} label - 标签
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @param {number} value - 初始值
     * @param {Function} onChange - 变化回调
     * @returns {Element} 控制器元素
     */
    createRangeControl(label, min, max, value, onChange = null) {
        const container = document.createElement('div');
        container.className = 'control-row';
        
        const labelEl = document.createElement('label');
        labelEl.className = 'control-label';
        labelEl.textContent = label;
        
        const input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.value = value;
        input.className = 'control-input range-input';
        
        if (onChange) {
            input.addEventListener('input', (e) => onChange(e.target.value));
        }
        
        container.appendChild(labelEl);
        container.appendChild(input);
        
        return container;
    },

    /**
     * 创建颜色选择器
     * @param {string} label - 标签
     * @param {string} value - 初始颜色
     * @param {Function} onChange - 变化回调
     * @returns {Element} 控制器元素
     */
    createColorControl(label, value = '#000000', onChange = null) {
        const container = document.createElement('div');
        container.className = 'control-row';
        
        const labelEl = document.createElement('label');
        labelEl.className = 'control-label';
        labelEl.textContent = label;
        
        const input = document.createElement('input');
        input.type = 'color';
        input.value = value;
        input.className = 'control-input color-input';
        
        if (onChange) {
            input.addEventListener('change', (e) => onChange(e.target.value));
        }
        
        container.appendChild(labelEl);
        container.appendChild(input);
        
        return container;
    },

    /**
     * 创建数字输入控制器
     * @param {string} label - 标签
     * @param {number} value - 初始值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @param {Function} onChange - 变化回调
     * @returns {Element} 控制器元素
     */
    createNumberControl(label, value = 0, min = null, max = null, onChange = null) {
        const container = document.createElement('div');
        container.className = 'control-row';
        
        const labelEl = document.createElement('label');
        labelEl.className = 'control-label';
        labelEl.textContent = label;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.className = 'control-input';
        
        if (min !== null) input.min = min;
        if (max !== null) input.max = max;
        
        if (onChange) {
            input.addEventListener('input', (e) => onChange(Number(e.target.value)));
        }
        
        container.appendChild(labelEl);
        container.appendChild(input);
        
        return container;
    },

    /**
     * 创建选择框控制器
     * @param {string} label - 标签
     * @param {Array} options - 选项数组 [{value, text}]
     * @param {string} value - 初始值
     * @param {Function} onChange - 变化回调
     * @returns {Element} 控制器元素
     */
    createSelectControl(label, options, value = '', onChange = null) {
        const container = document.createElement('div');
        container.className = 'control-row';
        
        const labelEl = document.createElement('label');
        labelEl.className = 'control-label';
        labelEl.textContent = label;
        
        const select = document.createElement('select');
        select.className = 'control-input';
        
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.text;
            if (option.value === value) {
                optionEl.selected = true;
            }
            select.appendChild(optionEl);
        });
        
        if (onChange) {
            select.addEventListener('change', (e) => onChange(e.target.value));
        }
        
        container.appendChild(labelEl);
        container.appendChild(select);
        
        return container;
    },

    /**
     * 创建复选框控制器
     * @param {string} label - 标签
     * @param {boolean} checked - 是否选中
     * @param {Function} onChange - 变化回调
     * @returns {Element} 控制器元素
     */
    createCheckboxControl(label, checked = false, onChange = null) {
        const container = document.createElement('div');
        container.className = 'control-row';
        
        const labelEl = document.createElement('label');
        labelEl.className = 'control-label';
        labelEl.textContent = label;
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = checked;
        input.className = 'control-input checkbox-input';
        
        if (onChange) {
            input.addEventListener('change', (e) => onChange(e.target.checked));
        }
        
        container.appendChild(labelEl);
        container.appendChild(input);
        
        return container;
    }
};

/**
 * 代码显示工具
 */
const CodeUtils = {
    
    /**
     * 格式化 SVG 代码
     * @param {string} svg - SVG 字符串
     * @returns {string} 格式化后的代码
     */
    formatSVG(svg) {
        // 简单的 SVG 格式化
        return svg
            .replace(/></g, '>\n<')
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * 高亮 SVG 代码
     * @param {string} code - 代码字符串
     * @returns {string} 高亮后的 HTML
     */
    highlightSVG(code) {
        return code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/(".*?")/g, '<span style="color: #22c55e">$1</span>')
            .replace(/(&lt;\/?[^&\s]*)/g, '<span style="color: #3b82f6">$1</span>');
    },

    /**
     * 复制代码到剪贴板
     * @param {string} code - 要复制的代码
     */
    async copyCode(code) {
        try {
            await navigator.clipboard.writeText(code);
            return true;
        } catch (err) {
            console.error('复制失败:', err);
            return false;
        }
    },

    /**
     * 创建代码显示区域
     * @param {string} code - 代码内容
     * @param {string} title - 标题
     * @returns {Element} 代码显示元素
     */
    createCodeBlock(code, title = 'SVG 代码') {
        const container = document.createElement('div');
        container.className = 'code-editor';
        
        const header = document.createElement('div');
        header.className = 'code-header';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'code-title';
        titleEl.textContent = title;
        
        const actions = document.createElement('div');
        actions.className = 'code-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-btn';
        copyBtn.textContent = '复制';
        copyBtn.addEventListener('click', async () => {
            const success = await this.copyCode(code);
            copyBtn.textContent = success ? '已复制!' : '复制失败';
            setTimeout(() => {
                copyBtn.textContent = '复制';
            }, 2000);
        });
        
        actions.appendChild(copyBtn);
        header.appendChild(titleEl);
        header.appendChild(actions);
        
        const content = document.createElement('div');
        content.className = 'code-content';
        content.innerHTML = this.highlightSVG(this.formatSVG(code));
        
        container.appendChild(header);
        container.appendChild(content);
        
        return container;
    }
};

/**
 * 演示页面工具
 */
const DemoUtils = {
    
    /**
     * 初始化演示页面
     * @param {string} title - 页面标题
     * @param {string} subtitle - 页面副标题
     */
    initPage(title, subtitle = '') {
        document.title = title;
        
        const header = document.querySelector('.demo-title');
        if (header) header.textContent = title;
        
        if (subtitle) {
            const subHeader = document.querySelector('.demo-subtitle');
            if (subHeader) subHeader.textContent = subtitle;
        }
    },

    /**
     * 创建面包屑导航
     * @param {Array} breadcrumbs - 面包屑数组 [{text, href}]
     * @returns {Element} 面包屑导航元素
     */
    createBreadcrumb(breadcrumbs) {
        const nav = document.createElement('nav');
        nav.className = 'breadcrumb';
        
        const ol = document.createElement('ol');
        ol.className = 'breadcrumb-list';
        
        breadcrumbs.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'breadcrumb-item';
            
            if (index === breadcrumbs.length - 1) {
                li.classList.add('active');
                li.textContent = item.text;
            } else {
                const a = document.createElement('a');
                a.href = item.href;
                a.textContent = item.text;
                li.appendChild(a);
            }
            
            ol.appendChild(li);
        });
        
        nav.appendChild(ol);
        return nav;
    },

    /**
     * 创建选项卡系统
     * @param {Array} tabs - 选项卡数组 [{id, title, content}]
     * @param {string} activeTab - 活动选项卡 ID
     * @returns {Element} 选项卡容器
     */
    createTabs(tabs, activeTab = null) {
        const container = document.createElement('div');
        container.className = 'tabs';
        
        const tabList = document.createElement('div');
        tabList.className = 'tab-list';
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'tab-contents';
        
        tabs.forEach((tab, index) => {
            // 创建选项卡按钮
            const button = document.createElement('button');
            button.className = 'tab-item';
            button.textContent = tab.title;
            button.dataset.tab = tab.id;
            
            if (tab.id === activeTab || (index === 0 && !activeTab)) {
                button.classList.add('active');
            }
            
            // 创建内容区域
            const content = document.createElement('div');
            content.className = 'tab-content';
            content.id = `tab-${tab.id}`;
            
            if (typeof tab.content === 'string') {
                content.innerHTML = tab.content;
            } else {
                content.appendChild(tab.content);
            }
            
            if (tab.id === activeTab || (index === 0 && !activeTab)) {
                content.classList.add('active');
            }
            
            // 添加点击事件
            button.addEventListener('click', () => {
                // 移除所有活动状态
                document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // 添加当前活动状态
                button.classList.add('active');
                content.classList.add('active');
            });
            
            tabList.appendChild(button);
            contentContainer.appendChild(content);
        });
        
        container.appendChild(tabList);
        container.appendChild(contentContainer);
        
        return container;
    },

    /**
     * 显示加载状态
     * @param {Element} container - 容器元素
     * @param {string} message - 加载消息
     */
    showLoading(container, message = '加载中...') {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loading"></div>
                <p style="margin-top: 1rem; color: #666;">${message}</p>
            </div>
        `;
    },

    /**
     * 显示错误信息
     * @param {Element} container - 容器元素
     * @param {string} message - 错误消息
     */
    showError(container, message = '发生错误') {
        container.innerHTML = `
            <div class="alert alert-danger">
                <strong>错误:</strong> ${message}
            </div>
        `;
    },

    /**
     * 显示成功信息
     * @param {Element} container - 容器元素
     * @param {string} message - 成功消息
     */
    showSuccess(container, message = '操作成功') {
        container.innerHTML = `
            <div class="alert alert-success">
                <strong>成功:</strong> ${message}
            </div>
        `;
    }
};

/**
 * 数学工具函数
 */
const MathUtils = {
    
    /**
     * 度数转弧度
     * @param {number} degrees - 度数
     * @returns {number} 弧度
     */
    degToRad(degrees) {
        return degrees * Math.PI / 180;
    },

    /**
     * 弧度转度数
     * @param {number} radians - 弧度
     * @returns {number} 度数
     */
    radToDeg(radians) {
        return radians * 180 / Math.PI;
    },

    /**
     * 限制数值范围
     * @param {number} value - 值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的值
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * 线性插值
     * @param {number} start - 起始值
     * @param {number} end - 结束值
     * @param {number} t - 插值参数 (0-1)
     * @returns {number} 插值结果
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * 生成随机数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机数
     */
    random(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    },

    /**
     * 计算两点间距离
     * @param {number} x1 - 点1 X坐标
     * @param {number} y1 - 点1 Y坐标
     * @param {number} x2 - 点2 X坐标
     * @param {number} y2 - 点2 Y坐标
     * @returns {number} 距离
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
};

// 导出到全局作用域（用于HTML文件中直接使用）
if (typeof window !== 'undefined') {
    window.SVGUtils = SVGUtils;
    window.ControlUtils = ControlUtils;
    window.CodeUtils = CodeUtils;
    window.DemoUtils = DemoUtils;
    window.MathUtils = MathUtils;
}

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SVGUtils,
        ControlUtils,
        CodeUtils,
        DemoUtils,
        MathUtils
    };
} 