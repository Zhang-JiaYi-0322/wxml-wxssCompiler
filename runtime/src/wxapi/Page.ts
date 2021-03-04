import { map } from '../components';
import { BaseComponent } from '../components/basecomponent/BaseComponent';
import { updateNode } from "../vdom/updateNode";
import { transformToJson } from '../vdom/wx2json';
import { wx } from './WX';

export class _Page {

    private options = null;
    private data = null;
    private prevData: BaseComponent = null;
    private factory = null;
    private container = null;
    private css = null;
    // public dataCached = false;
    private listenerMapping = {};

    public async main(wxmlUrl: string, wxssUrl: string, options: any) {
        this.options = options;
        this.data = options.data;
        this.container = document.body;


        const factory = await this.getFactory(wxmlUrl);
        this.factory = factory;
        options['page'] = this;
        const vdomdata = factory(options.data, options);
        const node = this.render(this.container, vdomdata);


        this.addListener(options, this);
        if (options.onLoad)
            options.onLoad.apply(this);
        options = this.options;

        const wxssJson = await this.loadText(wxssUrl);
        const css = JSON.parse(wxssJson as string);
        this.css = css;
        this.initStyle(css);

        this['onShow']();
        this['onReady']();

        if (!wx.currentPage) {
            wx.currentPage = this;
        }
    }

    public setData(data: any) {
        this.options.data = this.options.data ? this.options.data : {};
        for (const key in data) {
            this.options.data[key] = data[key];
        }
        const vdomdata = this.factory(this.options.data, this.options);
        this.render(this.container, vdomdata);
    }

    private addListener(options: any, node: any) {

        for (const key in options) {
            const op = options[key];
            if (typeof op == 'function') {
                this[key] = op.bind(this);
                options[key] = op.bind(this);
            }
        }

        var timeoutInt;
        if (options.onHide) {
            this.listenerMapping['pagehide'] = this['onHide'];
            window.addEventListener('pagehide', this['onHide']);
        }
        if (options.onUnload) {
            this.listenerMapping['unload'] = this['onUnload'];
            window.addEventListener('unload', this['onUnload']);
        }
        if (options.onResize) {
            // window.addEventListener('resize', options.onResize.bind(node));
            const func = function () {
                this.onResize();
            }.bind(node);
            this.listenerMapping['resize'] = func;
            window.addEventListener('resize', func);
        }
        if (options.onPageScroll && options.onReachBottom) {
            const onReachBottom = this['onReachBottom'];
            const func = function () {
                options.onPageScroll();

                setTimeout(function () {
                    if (timeoutInt != undefined) {
                        window.clearTimeout(timeoutInt);
                    }
                    timeoutInt = window.setTimeout(function () {
                        //监听事件内容
                        if (getScrollHeight() == getDocumentTop() + getWindowHeight()) {
                            //当滚动条到底时,这里是触发内容
                            //异步请求数据,局部刷新dom
                            onReachBottom(); //调用自定义的事件函数。
                        }
                    }, 105);
                }, 100);
            }.bind(node);
            this.listenerMapping['scroll'] = func;
            window.addEventListener('scroll', func);
        }
        else if (options.onPageScroll && !options.onReachBottom) {
            this.listenerMapping['scroll'] = this['onPageScroll'];
            window.addEventListener('scroll', this['onPageScroll']);
        }
        else if (!options.onPageScroll && options.onReachBottom) {
            const onReachBottom = this['onReachBottom'];
            const func = function () {
                setTimeout(function () {
                    if (timeoutInt != undefined) {
                        window.clearTimeout(timeoutInt);
                    }
                    timeoutInt = window.setTimeout(function () {
                        //监听事件内容
                        if (getScrollHeight() == getDocumentTop() + getWindowHeight()) {
                            //当滚动条到底时,这里是触发内容
                            //异步请求数据,局部刷新dom
                            onReachBottom(); //调用自定义的事件函数。
                        }
                    }, 105);
                }, 100);
            }.bind(node);
            this.listenerMapping['scroll'] = func;
            window.addEventListener('scroll', func);
        }
        if (options.onShow) {
            this.listenerMapping['pageshow'] = this['onShow'];
            window.addEventListener('pageshow', this['onShow']);
            // this['onShow']();
        }
        if (options.onReady) {
            // options.onReady.apply(this);
            // this['onReady']();
        }







        //（浏览器窗口上边界内容高度）
        function getDocumentTop() {
            var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
            if (document.body) {
                bodyScrollTop = document.body.scrollTop;
            }
            if (document.documentElement) {
                documentScrollTop = document.documentElement.scrollTop;
            }
            scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
            // console.log("scrollTop:" + scrollTop);
            return scrollTop;
        }

        //可视窗口高度（屏幕可以看见的高度）
        function getWindowHeight() {
            var windowHeight = 0;
            if (document.compatMode == "CSS1Compat") {
                windowHeight = document.documentElement.clientHeight;
            } else {
                windowHeight = document.body.clientHeight;
            }
            // console.log("windowHeight:" + windowHeight);
            return windowHeight;
        }

        //滚动条滚动高度（即整个网页的高度）
        function getScrollHeight() {
            var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
            if (document.body) {
                bodyScrollHeight = document.body.scrollHeight;
            }
            if (document.documentElement) {
                documentScrollHeight = document.documentElement.scrollHeight;
            }
            scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
            // console.log("scrollHeight:" + scrollHeight);
            return scrollHeight;
        }
    }

    private removeListener() {
        for (const key in this.listenerMapping) {
            window.removeEventListener(key, this.listenerMapping[key]);
        }
    }

    private loadText(url: string) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                resolve(xhr.responseText);
            };
            xhr.open('get', url);
            xhr.send();
        });
    }

    private async getFactory(file: string) {
        const jscode = await this.loadText(file);
        return eval(jscode as string);
    }

    private render(container: HTMLElement, data: any) {

        BaseComponent.keys.length = 0;
        if (!this.prevData) {
            this.prevData = new map.BaseComponent();
            for (const child of data) {
                this.prevData.appendChild(child);
            }
            updateNode(this.prevData);
            this.initElement(this.prevData);
            this.prevData.htmlElement.style.height = '603px';
            this.prevData.htmlElement.style.width = '375px';
            container.appendChild(this.prevData.htmlElement);
        }
        else {

            const other = new map.BaseComponent();
            for (const child of data) {
                other.appendChild(child);
            }
            transformToJson(other);
            updateNode(this.prevData, other.rightNode);
            this.initStyle(this.css);
        }

        // console.log("render finished", this.prevData)
        return this.prevData;
    }

    private initElement(obj: BaseComponent) {
        for (const child of obj.children) {
            child.root = this;
            child.onBinding();
            if (child.children && child.children.length > 0) {
                this.initElement(child);
            }
        }
    }

    private initStyle(collections: any) {
        if (!collections) return;
        const style = document.createElement("style");
        document.head.appendChild(style);
        const sheet = style.sheet;

        for (const collection of collections) {
            const style = collection.style;
            for (const element of collection.element) {
                if (element.insert) {
                    const texts = this.styleToString(element, style);
                    sheet.addRule(texts[0], texts[1]);
                }
                else {
                    this.searchElement(this.prevData.children, element.type, element.name, style);
                }
            }
        }
    }

    private styleToString(element: any, style: any): string[] {
        let elementText = "";
        let styleText = "";

        // element
        if (element.type == 'class')
            elementText = '.';
        else if (element.type == 'id')
            elementText = '#';
        else
            elementText = '@';
        elementText += element.name;
        if (element.type !== 'else')
            elementText += '::' + element.position;

        // style
        for (const key in style) {
            styleText += key + ': ' + style[key] + ';';
        }
        const buffer = styleText.split('');
        buffer.pop();
        styleText = buffer.join("");

        return [elementText, styleText];
    }

    private searchElement(obj: any, key: string, equalKey: string, value: any) {
        for (const child of obj) {
            const classArr = child.class.split(' ');
            if (child[key] == equalKey ||
                (key === 'class' && classArr.includes(equalKey))) {
                let target = key;
                // if (['class', 'label', 'id'].includes(key)) {
                target = 'style';
                // }
                child.setAttribute(target, value);
            }
            if (child.children.length > 0) {
                this.searchElement(child.children, key, equalKey, value);
            }
        }
    }

    public clearCache() {
        // this.cacheHtmlElement = null;
        this.prevData = null;
    }

    public exitPage() {
        this.removeListener();
    }

    public loginPage() {
        const options = this.options
        this.container.appendChild(this.prevData.htmlElement);
        this.addListener(options, this);
        if (options.onLoad)
            options.onLoad.apply(this);

        this.initStyle(this.css);
        this['onShow']();
    }
}
