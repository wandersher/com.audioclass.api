import express from 'express'
import cors from 'cors'
import compression from 'compression'
import multer from 'multer'

import { Speech } from './lib/speech'

import './lib/firestore'

const app = express()
app.use(compression())
app.use(cors({}))
app.use(express.text({ type: (req: any) => req?.headers['content-type']?.includes('text'), limit: '256mb' }))

const files = multer({
  limits: {
    fieldSize: 1024 * 1024 * 1024,
    fileSize: 1024 * 1024 * 1024
  }
})

app.post('/audio', async (req, res) => {
  try {
    const text = req.body
    res.sendFile(await Speech.toAudio(text))
  } catch (error: any) {
    res.setHeader('Content-Type', 'plain/text')
    res.status(500).send(error.message)
  }
})

app.get('/', (req, resp) => resp.status(200).send('Статус серверу: Онлайн'))
app.get('*', (req, resp) => resp.sendStatus(404))
app.post('*', (req, resp) => resp.sendStatus(404))
app.put('*', (req, resp) => resp.sendStatus(404))
app.delete('*', (req, resp) => resp.sendStatus(404))

export default app
