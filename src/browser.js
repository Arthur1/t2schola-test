import puppeteer from 'puppeteer'

export default class Browser {
    constructor() {
        this.browser = null
        this.page = null
    }

    async open() {
        const option = {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--lang=ja'
            ]
        }
        this.browser = await puppeteer.launch(option)
        this.page = await this.browser.newPage()
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'ja-JP'
        })
    }

    async emulateiPhone() {
        const iPhoneX = puppeteer.devices['iPhone X']
        await this.page.emulate(iPhoneX)
    }

    async close() {
        await this.browser.close()
    }
}
