import { Canvas } from "./canvas";
import { _Page } from "./Page";


class WX {

    storage: { [key: string]: any } = {};
    private pageStorage: _Page[] = [];
    private pageKeys: string[] = [];
    public currentPage: _Page = null;

    getSystemInfo(options: any) {
        const info = {
            pixelRatio: 2,
            windowHeight: 603,
            windowWidth: 375
        }

        if (options.success) {
            options.success(info)
        }
    }

    // todo
    saveImageToPhotosAlbum(options: any) {

    }

    // todo
    canvasToTempFilePath(options: any) {

    }

    setStorageSync(key: string, data: any) {
        this.storage[key] = data;
    }

    getStorageSync(key: string) {
        return this.storage[key];
    }

    createCanvasContext(id: string) {
        return new Canvas(id);
    }

    showToast(options: any) {
        const title = options.title;
        const duration = options.duration | 1500;
        const lines = title.split('\n').length + 1;

        const text = document.createElement('text');
        text.className = 'weui-toast';
        text.innerText = title;
        text.style.height = 20 * lines + 'px';
        document.body.appendChild(text);

        setTimeout(() => {
            document.body.removeChild(text);
        }, duration);
    }

    async navigateTo(options: any) {
        await this.jumpPage(options, true);
    }

    async redirectTo(options: any) {
        await this.jumpPage(options, false);
    }

    private async jumpPage(options: any, storage: boolean) {
        document.body.innerHTML = '';
        const url = options.url.replace('../', './pages/') + '.js';
        if (this.pageKeys.includes(url)) {
            const index = this.pageKeys.indexOf(url);
            this.pageKeys.splice(index, 1);
            const page = this.pageStorage.splice(index, 1)[0];
            page.loginPage();
            this.currentPage = page;
        }
        else {
            const rawText = await loadText(url);
            const page = eval(rawText as string);
            if (storage)
                this._storagePage(url);
            else {
                this.currentPage.clearCache();
            }
            this.currentPage = page;
        }
    }

    private _storagePage(url: string) {
        const page = this.currentPage;
        this.pageKeys.unshift(url);
        this.pageStorage.unshift(page);
        // page.dataCached = true;

        if (this.pageStorage.length > 10) {
            while (this.pageStorage.length > 10) {
                const page = this.pageStorage.pop();
                page.clearCache();
                this.pageKeys.pop();
            }
        }
    }

}


function loadText(url: string) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            resolve(xhr.responseText);
        };
        xhr.open('get', url);
        xhr.send();
    });
}

export const wx = new WX();