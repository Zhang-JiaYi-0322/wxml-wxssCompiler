import { BaseComponent } from "../basecomponent/BaseComponent";

export class Switch extends BaseComponent {

    type: string = 'switch';
    bindchange = null;
    checked: boolean = false;

    createComponent(): void {
        const a = this.htmlElement = document.createElement('input');
        a.type = 'checkbox';
        a.checked = this.checked;
        this.appendClassName("weui-switch");
    }

    private onAttributeChange_type = (value: string) => {
        const oldType = this.type
        this.type = value;
        let _value = value;
        if (value === 'checkbox') _value = 'switch-cp__box';
        if (oldType !== value) {
            this.removeClassName(['weui-switch', 'weui-switch-cp__box']);
            this.appendClassName(`weui-${_value}`);
        }
    }

    private onAttributeChange_bindchange = (value: string) => {
        if (this.options[value]) {
            this.bindchange = this.options[value];
            this.htmlElement.onclick = () => {
                const checked = this.htmlElement['checked'];
                if (checked !== this.checked) {
                    this.checked = checked;
                    this.bindchange();
                }
            }
        }
    }
}