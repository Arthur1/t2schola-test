'use strict'

import fs from 'fs/promises'
import crypto from 'crypto'
import rl from 'readline-sync'
import keytar from 'keytar'

export default class Credential {
    constructor() {
        this.user = {
            id: null,
            password: null,
            matrixCode: []
        }
        this.keyphrase = null
        this.encryptedUser = {}
        this.SERVICE_NAME = 'Arthur1/t2schola-test'
    }

    async load() {
        let isInit = false;
        try {
            await this.readEncryptedUser() 
        } catch (e) {
            console.log(e)
            isInit = true
            await this.initUser()
            this.keyphrase = rl.question('Keyphrase for this App?: ', { hideEchoBack: true })
            await this.encryptUser()
        }
        try {
            if (!isInit) this.keyphrase = await keytar.findPassword(this.SERVICE_NAME)
        } catch (e) {
            console.log(e)
            this.keyphrase = rl.question('Keyphrase?: ', { hideEchoBack: true })
        }
        this.decryptUser()
        keytar.setPassword(this.SERVICE_NAME, this.user.id, this.keyphrase)
    }

    async readEncryptedUser() {
        const readIv = async function() {
            this.encryptedUser.iv = await fs.readFile('credentials/user_iv')
        }.bind(this)
        const readData = async function() {
            this.encryptedUser.data = await fs.readFile('credentials/user')
        }.bind(this)
        await Promise.all([readIv(), readData()])
    }

    async initUser() {
        this.user.id = rl.question('Student ID?: ')
        this.user.password = rl.question('Password?: ', { hideEchoBack: true })
        let matrixCodePath = rl.question('Matrix Code File Name? (matrix-code.json): ') || 'matrix-code.json'
        this.user.matrixCode = JSON.parse(await fs.readFile(matrixCodePath, 'utf8'))
    }

    async encryptUser() {
        const str = JSON.stringify(this.user)
        const data = Buffer.from(str)
        const {iv, encryptedData} = Credential.encrypt(data, this.keyphrase)
        await fs.mkdir('credentials').catch(() => {})
        await Promise.all([
            fs.writeFile('credentials/user_iv', iv),
            fs.writeFile('credentials/user', encryptedData)
        ])
    }

    decryptUser() {
        const decryptedData = Credential.decrypt(this.encryptedUser.data, this.encryptedUser.iv, this.keyphrase)
        console.log(decryptedData.toString('utf-8'))
        this.user = JSON.parse(decryptedData.toString('utf-8'))
    }

    static encrypt(data, keyphrase) {
        const keyphraseHash = crypto.createHash('sha256').update(keyphrase, 'utf8').digest('base64')
        const key = crypto.scryptSync(keyphraseHash, process.env.SALT, 32)
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
        let encryptedData = cipher.update(data)
        encryptedData = Buffer.concat([encryptedData, cipher.final()])
        return {iv, encryptedData}
    }

    static decrypt(encryptedData, iv, keyphrase) {
        const keyphraseHash = crypto.createHash('sha256').update(keyphrase, 'utf8').digest('base64')
        const key = crypto.scryptSync(keyphraseHash, process.env.SALT, 32)
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        let decryptedData = decipher.update(encryptedData)
        decryptedData = Buffer.concat([decryptedData, decipher.final()])
        return decryptedData
    }

    getMatrixValueByKey(key) {
        const xString = key.slice(1, 2)
        const yString = key.slice(3, 4)
        const x = xString.charCodeAt() - 65
        const y = Number(yString) - 1
        return this.matrixCode[x * 7 + y]
    }
}
