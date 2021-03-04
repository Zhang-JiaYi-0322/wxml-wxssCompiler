export class BaseComponent {

    label = '';
    static keys = [];
    htmlElement: HTMLElement;
    leftNode: any = {};
    rightNode: any = {};
    parent: BaseComponent = null;
    children: BaseComponent[] = [];
    count = 0;
    counted = false;
    isEmpty = true;
    key: string | null = null;
    options: any = null;
    root = null;


    // 通用属性
    id: string = "";
    class: string = "";
    style: any = null;
    hidden: boolean = false;
    bindtap = null; // onClick
    catchtap = null; // 阻止点击事件冒泡
    innerText: string = "";
    animation: string = "" // todo


    constructor(key?: string, options?: any) {
        if (key)
            this.key = key;
        if (options) {
            this.options = options;
            for (const key in this.options) {
                if (typeof this.options[key] == 'function') {
                    this.options[key] = this.options[key].bind(this.options.page);
                }
            }
        }
        this.createComponent();
        this._initStyle();
        this.label = (this as any).constructor.name;
    }

    _initStyle() {
        this.htmlElement['style']['text-align'] = 'center';
        // this.htmlElement['style']['margin'] = '0 auto';
        this.initStyle();
    }

    initStyle() {
        
    }


    setText(value: any): void {
        this.isEmpty = false;
        this.onTextChange(value);
        this.innerText = value;
    }

    protected onTextChange(value: any) {

    }

    createComponent(): void {
        this.htmlElement = document.createElement('element');
        this.htmlElement['node'] = this;
    }

    // patch：用以在创建完对象后赋值，手动调用
    initialize(obj: any): void {
        if (obj) {
            for (const key in obj) {
                this.setAttribute(key, obj[key]);
            }
        }
    }


    // 所有属性须有初始值，否则报错
    // 不改变 浏览器对象
    setAttribute(key: string, value: any): void {
        if (this.hasOwnProperty(key)) {
            this[key] = value;
            if (this['onAttributeChange_' + key]) {
                if (key !== 'id' && key !== 'isEmpty') {
                    this.isEmpty = false;
                }
                this['onAttributeChange_' + key](value);
            }
        }
        else if (key.indexOf('data_') == 0) {
            this.setCustomAttribute(key, value);
        }
        else {
            throw (`wrong key: ${key}`);
        }
    }

    private setCustomAttribute(key: string, value: any) {
        const newKey = key.replace('data_', '');
        this[newKey] = value;
    }


    private onAttributeChange_id = (value: string) => {
        this.htmlElement['id'] = value;
    }

    private onAttributeChange_style = (value: any) => {
        if (typeof value === 'string') {
            const arr1 = value.split(';');

            this.style = {};
            for (const text of arr1) {
                const buffer = text.split(':');
                if (buffer.length === 2) {
                    this.style[buffer[0]] = buffer[1];
                    if (buffer[1].includes('rpx')) {
                        const num = buffer[1].replace('rpx', '');
                        buffer[1] = (Number(num) / 2).toString() + 'px';
                    }
                    this.onStyleChange(buffer[0], buffer[1]);
                    this.htmlElement.style[buffer[0]] = buffer[1];
                }
            }
        }
        else {
            for (const key in value) {
                this.onStyleChange(key, value[key]);
                this.htmlElement.style[key] = value[key];
            }
        }
    }

    private onAttributeChange_class = (value: string) => {
        this.htmlElement.className = value;
    }

    private onAttributeChange_hidden = (value: boolean) => {
        this.htmlElement.hidden = value;
    }

    private onAttributeChange_bindtap = (value: string) => {
        if (this.options[value]) {
            this.bindtap = this.options[value];
            this.htmlElement.onclick = () => {
                this.bindtap();
            }
        }
    }

    private onAttributeChange_catchtap = (value: string) => {
        if (this.options[value]) {
            this.catchtap = this.options[value];
            this.htmlElement.onclick = (e) => {
                this.catchtap();
                e.stopPropagation();
            }
        }
    }


    onStyleChange(key: string, value: any) {

    }

    // 数据绑定
    setData(key: string): any {

    }


    onBinding(): void {
        if (this.bindtap && typeof this.bindtap == 'function')
            this.bindtap = this.bindtap.bind(this.root);
    }


    setRightNode(value: any): void {
        if (this.rightNode)
            this.leftNode = this.rightNode;
        this.rightNode = value;
    }

    setCount(): void {
        let count = (this.children && this.children.length) || 0;
        let descendants = 0;
        for (const child of this.children) {
            if (child.label) {
                {
                    child.setCount();
                    descendants += child.count || 0;
                }
            }
        }
        this.count = count + descendants;
    }

    appendChild(target: BaseComponent): void {
        let count = 1;
        for (const key of BaseComponent.keys) {
            if (key == target.key) {
                count++;
            }
        }
        // const reg = /([0-9a-zA-Z_]+)([0-9]{1})$/;
        // const result = reg.exec(target.key);
        const oldKey = target.key;
        target.key = oldKey + count;
        BaseComponent.keys.push(oldKey);
        // console.log(target.key, Element.keys)



        this.isEmpty = false;
        this.children.push(target);
        target.parent = this;
        this.htmlElement.appendChild(target.htmlElement);
    }

    _appendChild(target: BaseComponent): void {
        this.isEmpty = false;
        this.children.push(target);
        target.parent = this;
        this.htmlElement.appendChild(target.htmlElement);
    }

    removeChild(target: BaseComponent): void {
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (getPrototype(child) === getPrototype(target)
                && child.key === target.key) {
                child.parent = null;
                this.children.splice(i, 1);
                if (target.htmlElement.parentNode == this.htmlElement)
                    this.htmlElement.removeChild(target.htmlElement);
                break;
            }
        }
    }


    _replaceChild(_new: BaseComponent, _old: BaseComponent): void {
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (getPrototype(child) === getPrototype(_old)
                && child.key === _old.key) {
                this.children[i] = _new;
                break;
            }
        }
        this.htmlElement.replaceChild(_new.htmlElement, _old.htmlElement);
    }

    _insertBefore(_new: BaseComponent, _old: BaseComponent | null): void {
        if (_old) {
            for (let i = 0; i < this.children.length; i++) {
                const child = this.children[i];
                if (getPrototype(child) === getPrototype(_old)
                    && child.key === _old.key) {
                    this.children.splice(i, 0, _new);
                    break;
                }
            }
            this.htmlElement.insertBefore(_new.htmlElement, _old.htmlElement);
        }
        else {
            this.appendChild(_new);
        }
    }

    appendClassName(className: string | string[]): void {
        const _add = add.bind(this);
        if (typeof className === 'string') {
            _add(className);
        }
        else {
            for (const child of className) {
                _add(child);
            }
        }


        function add(name: string) {
            if (this.class.includes(name)) return;
            this.class += ' ' + name;
            let classNames = this.htmlElement.className;
            this.htmlElement.className = classNames + ' ' + name;
        }
    }

    removeClassName(className: string | string[]): void {
        const _remove = remove.bind(this);
        if (typeof className === 'string') {
            _remove(className);
        }
        else {
            for (const child of className) {
                _remove(child);
            }
        }

        function remove(name: string) {
            this.class = this.class.replace(name, ``);
            let classNames = this.htmlElement.className;
            this.htmlElement.className = classNames.replace(name, ``);
        }
    }
}


function getPrototype(value: any): any {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}