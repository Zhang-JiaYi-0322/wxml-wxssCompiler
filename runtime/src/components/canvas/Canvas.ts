import { BaseComponent } from "../basecomponent/BaseComponent";

export class Canvas extends BaseComponent {

    canvas_id: string = '';

    createComponent(): void {
        this.htmlElement = document.createElement('canvas');
    }

    initStyle() {
        // this.htmlElement.style.position = 'relative';
        // this.htmlElement.style.textAlign = '';
    }

    private onAttributeChange_canvas_id = (value: string) => {
        this.htmlElement.id = value;
    }

    onStyleChange(key: string, value: any) {
        if (key == 'height' || key == 'width') {
            if (!isNaN(Number(value.replace('px', '')))) {

                this.htmlElement[key] = Number(value.replace('px', ''));

                // this.htmlElement.style[key] = this.htmlElement[key];
            }
            else if (value.includes('%')) {
                const percent = Number(value.replace('%', ''));
                if (!isNaN(percent)) {
                    const parentSize = value == 'height' ? this.parent.htmlElement.offsetHeight : this.parent.htmlElement.offsetWidth;
                    this.htmlElement[key] = parentSize * percent * 0.01;
                }
            }
        }
    }
}