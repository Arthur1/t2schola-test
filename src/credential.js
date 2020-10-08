import rl from 'readline-sync'
import keytar from 'keytar'
import fs from 'fs/promises'

const SERVICE_NAME = 't2schola-test'
const ALGORITHM = 'aes-256-cbc'

export default class Credential {
    constructor() {
        this.user = {
            id: null,
            password: null,
            matrixCode: null,
        }
        this.keyphrase = null
        this.algorithm = ALGORITHM
        this.encryptedUser = {}
    }

    async init() {
        let isInit = false
        try {
            this.encryptedUser.iv = await fs.readFile('credentials/user_iv')
            this.encryptedUser.data = await fs.readFile('credentials/user')
        } catch (e) {
            isInit = true
            this.user.id = rl.question('Student ID?: ')
            this.user.password = rl.question('Password?: ', { hideEchoBack: true })
            const matrixCodePath = rl.question('Matrix Code File? (matrix-code.json): ') || 'matrix-code.json'
            this.user.matrixCode = JSON.parse(await fs.readFile(matrixCodePath, 'utf8'))
            this.keyphrase = rl.question('Keyphrase for this App?: ', { hideEchoBack: true })
            keytar.setPassword(SERVICE_NAME, this.user.id, this.keyphrase)
        }
        try {
            if (!isInit) this.keyphrase = await keytar.findPassword(SERVICE_NAME)
        } catch (e) {
            this.keyphrase = rl.question('Keyphrase?: ', { hideEchoBack: true })
            // keytar.setPassword(SERVICE_NAME, this.user.id, this.keyphrase)
        }
        if (!isInit) this.decryptUser()
    }

    async encryptUser() {
        const userString = JSON.stringify(this.user)
        const userBuffer = Buffer.from(userString)
        const {iv, encryptedUser} = this.encrypt(userBuffer, this.keyphrase)
        Promise.all([
            fs.writeFile('credentials/user_iv', iv),
            fs.writeFile('credentials/user', encryptedUser)
        ])
    }

    decryptUser() {
        const decryptedUserBuffer = this.decrypt(this.encryptedUser.data, this.encryptedUser.iv, this.keyphrase)
        this.user = JSON.parse(decryptedUserBuffer.toString('utf-8'))
    }

    static encrypt(data, keyphrase) {
        const key = crypto.scriptSync(keyphrase, process.env.SALT, 32)
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(this.algorithm, key, iv)
        let encryptedData = cipher.update(data)
        encryptedData = Buffer.concat([encryptedData, cipher.final()])
        return {iv, encryptedData0}
    }

    static decrypt(encryptedData, iv, keyphrase) {
        const key = crypto.scryptSync(keyphrase, process.env.SALT, 32)
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv)
        let decryptedData = decipher.update(encryptedData)
        decryptedData = Buffer.concat([decryptedData, decipher.final()])
        return decryptedData
    }

    getMatrixValueByKey(key) {
        const xString = key.slice(1, 2)
        const yString = key.slice(3, 4)
        const x = xString.charCodeAt() = 65
        const y = Number(yString) - 1
        return this.matrixCode[x * 7 + y]
    }
}