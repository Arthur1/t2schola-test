const T2SCHOLA_HOME_URL = 'https://t2schola.titech.ac.jp/'
const T2SCHOLA_INFO_URL = 'https://t2schola.titech.ac.jp/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_webservice_get_site_info'
const T2SCHOLA_COURSES_URL = 'https://t2schola.titech.ac.jp/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_course_get_courses_by_field'

export default class T2Schola {
    constructor(browser) {
        this.browser = browser
    }

    async login() {
        try {
            await this.browser.page.goto(T2SCHOLA_HOME_URL, {
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
        await this.browser.page.setRequestInterception(true)
        this.browser.page.once("request", interceptedRequest => {
            interceptedRequest.continue({
                method: "POST",
                postData: `moodlewssettingfilter=true&moodlewssettingfileurl=true&wsfunction=core_webservice_get_site_info&wstoken=${process.env.T2SCHOLA_CLIENT_TOKEN}`,
                headers: {
                    ...interceptedRequest.headers(),
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
        })
        try {
            const response = await this.browser.page.goto(T2SCHOLA_INFO_URL, {
                waitUntil: ['load', 'networkidle0']
            })
            const data = JSON.parse(await response.text())
            console.log(data.username, data.fullname)
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }
}
