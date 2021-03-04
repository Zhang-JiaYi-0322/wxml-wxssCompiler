import { map } from './components';
import { _Page } from './wxapi/Page';
import { wx } from './wxapi/WX';

export * from './components';

window['wx'] = wx;
window["WX"] = map;
window['Page'] = (wxmlUrl, wxssUrl, options) => {
    const page = new _Page();
    page.main(wxmlUrl, wxssUrl, options);
    return page;
}