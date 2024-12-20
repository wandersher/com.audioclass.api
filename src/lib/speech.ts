import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import {
  SpeechConfig,
  AudioConfig,
  SpeechSynthesizer,
  ResultReason,
  PushAudioOutputStreamCallback,
  SpeechRecognizer,
  CancellationDetails,
  CancellationReason
} from 'microsoft-cognitiveservices-speech-sdk'
import path from 'path'
import { v4 } from 'uuid'

import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'

enum Voices {
  MALE = 'uk-UA-OstapNeural',
  FEMALE = 'uk-UA-PolinaNeural'
}

const SPEECH_KEY = 'API KEY'
const SPEECH_REGION = 'eastus'

const root = process.env.IS_DEBUG ? path.join(__dirname, '..', '..') : path.join(__dirname, '..')

export class Speech {
  static async download(url: string, destination: string) {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    })
    writeFileSync(destination, response.data)
  }

  static async toAudio(text: string): Promise<string> {
    const id = v4()
    const folder = path.join(root, 'audio')
    if (existsSync(folder)) mkdirSync(folder, { recursive: true })
    const file = path.join(folder, `${id}.wav`)
    const speechConfig = SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION)
    speechConfig.speechSynthesisVoiceName = Voices.MALE
    var synthesizer: SpeechSynthesizer | null = new SpeechSynthesizer(speechConfig, AudioConfig.fromAudioFileOutput(file))

    return await new Promise<string>((resolve, reject) => {
      synthesizer?.speakTextAsync(
        text,
        function (result) {
          if (result.reason === ResultReason.SynthesizingAudioCompleted) {
            console.log('Озвучування завершено')
            setTimeout(() => resolve(file), 1000)
          } else {
            console.error('Помилка озвучування', result.errorDetails)
            reject(Error(result.errorDetails))
          }
          synthesizer?.close()
          synthesizer = null
        },
        function (error) {
          console.error('Помилка озвучування', error)
          reject(error)
          synthesizer?.close()
          synthesizer = null
        }
      )
    })
  }

  static async toText(url: string): Promise<string> {
    console.log('озвучування файлу', url)
    const id = v4()
    const folder = path.join(root, 'audio')
    if (existsSync(folder)) mkdirSync(folder, { recursive: true })
    const file_mp3 = path.join(folder, `${id}.mp3`)
    const file_wav = path.join(folder, `${id}.wav`)

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    })

    writeFileSync(file_mp3, response.data)

    await new Promise((resolve, reject) => {
      ffmpeg(file_mp3)
        .toFormat('wav')
        .on('error', err => {
          reject(Error('Помилка конвертування' + err.message))
        })
        .on('progress', progress => {
          console.log('Конвертування у wav файл: ' + progress.targetSize + ' KB')
        })
        .on('end', () => {
          resolve(null)
        })
        .save(file_wav)
    })

    const audioConfig = AudioConfig.fromWavFileInput(readFileSync(file_wav))
    const speechConfig = SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION)
    speechConfig.speechRecognitionLanguage = 'uk-UA'

    const recognizer = new SpeechRecognizer(speechConfig, audioConfig)

    return await new Promise((resolve, reject) => {
      console.log('Запуск розпізнавання файлу')
      recognizer.recognizeOnceAsync(
        result => {
          console.log('Результат розпізнавання файлу', result.text)
          if (result.reason === ResultReason.RecognizedSpeech) {
            resolve(result.text)
          } else if (result.reason === ResultReason.NoMatch) {
            reject(Error('Не вдалось розпізнати текст із аудіофайлу'))
          } else if (result.reason === ResultReason.Canceled) {
            const cancellation = CancellationDetails.fromResult(result)
            if (cancellation.reason === CancellationReason.Error) {
              reject(Error(`Не вдалось розпізнати текст із аудіофайлу через помилку: ${cancellation.errorDetails}`))
            } else {
              reject(Error(`Не вдалось розпізнати текст із аудіофайлу через помилку: ${cancellation.reason}`))
            }
          }
        },
        error => {
          reject(Error(`Не вдалось розпізнати текст із аудіофайлу через помилку: ${error}`))
        }
      )
    })
  }
}
