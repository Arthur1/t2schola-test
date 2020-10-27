import dotenv from 'dotenv'
import Credential from './credential.js'
import Portal from './portal.js'
import Browser from './browser.js'
import T2Schola from './t2schola.js'

dotenv.config()
main().then(() => {
    console.log('fin')
    process.exit(0)
}).catch(err => {
    console.error(err)
    process.exit(1)
})

async function main() {
    const credential = new Credential()
    await credential.load()

    const browser = new Browser()
    await browser.open()

    const portal = new Portal(browser)
    await portal.login(credential)

    console.log('logged in Portal')

    const t2schola = new T2Schola(browser)
    await t2schola.login()
    await t2schola.testUserInfo()
    /*** ここまで必須? ***/

    await t2schola.testCourses()
    await t2schola.testCourseDetail()
}
