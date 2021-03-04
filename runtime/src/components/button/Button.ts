import { BaseComponent } from "../basecomponent/BaseComponent";
import './button.css'

export class Button extends BaseComponent {

    lang: string = "en";    // language
    disabled: boolean = false;
    form_type: string = '';
    type: string = 'default';
    loading: boolean = false;


    constructor(key?: string, options?: any) {
        super(key, options);
    }

    onTextChange(value: any): void {
        let hasInnerText = false;
        const childNodes = this.htmlElement.childNodes;
        for (const node of childNodes) {
            if (node.nodeName === '#text' && this.innerText === node.textContent) {
                node.textContent = value;
                break;
            }
        }
        if (!hasInnerText) {
            const text = document.createTextNode(value);
            this.htmlElement.appendChild(text);
        }
    }

    createComponent(): void {
        // this.htmlElement = document.createElement('button');
        const a = this.htmlElement = document.createElement('a');
        a.href = '#';
        this.appendClassName("weui-btn weui-btn_default");
        
    }

    initStyle() {
        // this.htmlElement.style.marginTop = '15px';
        // this.htmlElement.style.marginBottom = '15px';
        // // this.htmlElement.style.height = '44px';
        // // this.htmlElement.style.lineHeight = this.htmlElement.style.height;
        // this.htmlElement.style.boxSizing = 'border-box';
        // this.htmlElement.style.padding = '8px 24px;'
    }

    private onAttributeChange_lang = (value: string) => {
        this.htmlElement['lang'] = value;
    }

    private onAttributeChange_disabled = (value: boolean) => {
        this.htmlElement['disabled'] = value;
        if (value !== false) {
            this.appendClassName('weui-btn_disabled');
        }
        else {
            this.removeClassName('weui-btn_disabled');
        }
    }

    private onAttributeChange_form_type = (value: string) => {
        this.htmlElement['form_type'] = value;
    }


    private onAttributeChange_loading = (value: boolean) => {
        // this.htmlElement['loading'] = value;      
        this.appendClassName('weui-btn_loading');

        if (value !== false) {
            const span = document.createElement('span');
            span.className = "weui-primary-loading weui-primary-loading_transparent";
            const i = document.createElement('i');
            i.className = "weui-primary-loading__dot";
            span.appendChild(i);
            const firstChild = this.htmlElement.firstChild;
            if (firstChild)
                this.htmlElement.insertBefore(span, firstChild);
            else
                this.htmlElement.appendChild(span);
        }
        else {
            const spans = this.htmlElement.getElementsByTagName('span');
            if (spans.length > 0)
                this.htmlElement.removeChild(spans[0]);
        }
    }

    private onAttributeChange_type = (value: string) => {
        this.type = value;
        if (value === 'primary' || value === 'warn') {
            this.removeClassName(['weui-btn_default', 'weui-btn_primary', 'weui-btn_warn']);
            this.appendClassName(`weui-btn_${value}`);
        }
    }


}