const PORTAL_LOGIN_URL = 'https://portal.nap.gsic.titech.ac.jp/GetAccess/Login?Template=userpass_key&AUTHMETHOD=UserPassword'

export default class Portal {
    constructor(browser, credential) {
        this.browser = browser
        this.credential = credential
    }

    async login() {
        // 学籍番号・パスワード
        try {
            await this.browser.page.goto(PORTAL_LOGIN_URL, { waitUntil: 'domcontentloaded' })
            // await this.browser.page.screenshot({ path: 'test0.png' })
            await this.browser.page.type('input[name="usr_name"]', this.credential.user.id)
            await this.browser.page.type('input[name="usr_password"]', this.credential.user.password)
            await Promise.all([
                this.browser.page.click('input[type="submit"][name="OK"]'),
                this.browser.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ])
            // await this.browser.page.screenshot({ path: 'test1.png' })

            // OTP認証をスキップ
            await this.browser.page.select('select[name="message3"]', 'GridAuthOption')
            await Promise.all([
                this.browser.page.click('input[type="submit"][name="OK"]'),
                this.browser.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ])
            // await this.browser.page.screenshot({ path: 'test2.png' })

            // Matrixコード
            for (let i = 4; i <= 6; i++) {
                let matrixKey = await this.browser.page.$eval(`[id="authentication"] tr:nth-of-type(${i}) th:nth-of-type(1)`, item => item.textContent)
                await this.browser.page.type(`input[name="message${i - 1}"]`, this.credential.getMatrixValueByKey(matrixKey))
            }
            await Promise.all([
                this.browser.page.click('input[type="submit"][name="OK"]'),
                this.browser.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ])
            // await this.browser.page.screenshot({ path: 'test3.png' })
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }
}
