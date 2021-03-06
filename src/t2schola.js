import querystring from 'querystring'

const MOBILE_LAUNCH_URL = 'https://t2schola.titech.ac.jp/admin/tool/mobile/launch.php'
const API_URL = 'https://t2schola.titech.ac.jp/webservice/rest/server.php'

export default class T2Schola {
    constructor(browser) {
        this.browser = browser
        this.userId = null
        this.courses = []
        this.wstoken = ''
    }

    /**
     * PortalのCookieを利用してログイン
     */
    async login() {
        try {
            // モバイル端末でないとエラー
            await this.browser.emulateiPhone()
            // onloadでアプリが自動的に開こうとするのを防止
            await this.browser.page.setJavaScriptEnabled(false)
            const query = {
                service: 'moodle_mobile_app',
                passport: Math.random() * 1000,
                urlscheme: 'mmt2schola',
            }
            const url = MOBILE_LAUNCH_URL + '?' + querystring.stringify(query)
            await this.browser.page.goto(url)

            // <a id="launchapp" href="mmt2schola://token={base64_encoded_token}"></a>
            const appLinkElement = await this.browser.page.$('#launchapp')
            const appLinkUrl = await (await appLinkElement.getProperty('href')).jsonValue()
            const token = Buffer.from(appLinkUrl.replace('mmt2schola://token=', ''), 'base64').toString()

            // :::で区切られた文字列の2つ目がwstoken
            this.wstoken = token.split(':::')[1]
            await this.browser.page.setJavaScriptEnabled(true)
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }

    /**
     * ログインしているユーザ情報を取得
     */
    async testUserInfo() {
        const query = {
            moodlewsrestformat: 'json',
            wstoken: this.wstoken,
            wsfunction: 'core_webservice_get_site_info'
        }
        const url = API_URL + '?' + querystring.stringify(query)
        try {
            const response = await this.browser.page.goto(url, {
                waitUntil: ['load', 'networkidle0']
            })
            const data = JSON.parse(await response.text())
            console.log(data.username, data.fullname, data.userid)
            this.userId = data.userid
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }

    /**
     * 履修している講義一覧の取得
     * useridが必要
     */
    async testCourses() {
        if (! this.userId) throw 'userId is null!'
        const query = {
            moodlewsrestformat: 'json',
            wstoken: this.wstoken,
            wsfunction: 'core_enrol_get_users_courses',
            userid: this.userId
        }
        const url = API_URL + '?' + querystring.stringify(query)
        try {
            const response = await this.browser.page.goto(url, {
                waitUntil: ['load', 'networkidle0']
            })
            const data = JSON.parse(await response.text())
            this.courses = data
            console.log(data)
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }

    /**
     * 講義の詳細を取得
     * courseidが必要
     */
    async testCourseDetail() {
        if (! this.userId) throw 'no courses!'
        const query = {
            moodlewsrestformat: 'json',
            wstoken: this.wstoken,
            wsfunction: 'core_course_get_contents',
            courseid: this.courses[0].id   
        }
        const url = API_URL + '?' + querystring.stringify(query)
        try {
            const response = await this.browser.page.goto(url, {
                waitUntil: ['load', 'networkidle0']
            })
            const data = JSON.parse(await response.text())
            console.log(data)
            console.log(data[0].modules)
            console.log(data[1].modules)
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }
}
