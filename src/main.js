import dotenv from 'dotenv'
import Credential from './credential.js'

dotenv.config()
main().then(() => {}).catch(err => {
    console.error(err)
})

async function main() {
    const credential = new Credential()
    await credential.load()
}
