import querystring from 'querystring'

const HOME_URL = 'https://t2schola.titech.ac.jp/'
const API_URL = 'https://t2schola.titech.ac.jp/webservice/rest/server.php'

export default class T2Schola {
    constructor(browser) {
        this.browser = browser
        this.userId = null
    }

    async login() {
        try {
            await this.browser.page.goto(HOME_URL, {
                waitUntil: ['load', 'networkidle0']
            }) 
            // await this.browser.page.screenshot({ path: 'test4.png' })
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }

    async testUserInfo() {
        const query = {
            moodlewsrestformat: 'json',
            moodlewssettingfilter: 'true',
            moodlewssettingfileurl: 'true',
            wstoken: process.env.T2SCHOLA_CLIENT_TOKEN,
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

    async testCourses() {
        const query = {
            moodlewsrestformat: 'json',
            moodlewssettingfilter: 'true',
            moodlewssettingfileurl: 'true',
            wstoken: process.env.T2SCHOLA_CLIENT_TOKEN,
            wsfunction: 'core_enrol_get_users_courses',
            userid: this.userId
        }
        const url = API_URL + '?' + querystring.stringify(query)
        try {
            const response = await this.browser.page.goto(url, {
                waitUntil: ['load', 'networkidle0']
            })
            const data = JSON.parse(await response.text())
            console.log(data)
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }
}
