import { BaseComponent } from "../basecomponent/BaseComponent";
import './input.css';

export class Input extends BaseComponent {

    bindinput = null;

    createComponent(): void {
        const a = this.htmlElement = document.createElement('input');
        this.appendClassName("weui-input");
    }

    initStyle() {
        // this.htmlElement.style.outline = 'none';
        // this.htmlElement.style.border = 'none';
    }

    private onAttributeChange_bindinput = (value: string) => {
        if (this.options[value]) {
            this.bindinput = this.options[value];
            const element = this.htmlElement;
            this.htmlElement.addEventListener('input', (e) => {
                // console.log(element['value'])
                this.options[value]({ detail: { value: element['value'] } });
            });
            // this.htmlElement.addEventListener('input', this.options[value]);
        }
    }

}