const LOGIN_URL = 'https://portal.nap.gsic.titech.ac.jp/GetAccess/Login?Template=userpass_key&AUTHMETHOD=UserPassword'

export default class Portal {
    constructor(browser) {
        this.browser = browser
    }

    async login(credential) {
        // 学籍番号・パスワード
        try {
            await this.browser.page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' })
            await this.browser.page.type('input[name="usr_name"]', credential.user.id)
            await this.browser.page.type('input[name="usr_password"]', credential.user.password)
            await Promise.all([
                this.browser.page.click('input[type="submit"][name="OK"]'),
                this.browser.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ])

            // OTP認証をスキップ
            await this.browser.page.select('select[name="message3"]', 'GridAuthOption')
            await Promise.all([
                this.browser.page.click('input[type="submit"][name="OK"]'),
                this.browser.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ])

            // Matrixコード
            for (let i = 4; i <= 6; i++) {
                let matrixKey = await this.browser.page.$eval(`[id="authentication"] tr:nth-of-type(${i}) th:nth-of-type(1)`, item => item.textContent)
                await this.browser.page.type(`input[name="message${i - 1}"]`, credential.getMatrixValueByKey(matrixKey))
            }
            await Promise.all([
                this.browser.page.click('input[type="submit"][name="OK"]'),
                this.browser.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ])
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }
}
