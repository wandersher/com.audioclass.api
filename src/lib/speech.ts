import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason, PushAudioOutputStreamCallback } from 'microsoft-cognitiveservices-speech-sdk'
import path from 'path'
import { v4 } from 'uuid'

enum Voices {
  MALE = 'uk-UA-OstapNeural',
  FEMALE = 'uk-UA-PolinaNeural'
}

const SPEECH_KEY = 'CxJW7A8yrZBmXsgy19SRtC81GQTc7m15MxD0iuJQKGzX4JOORiUjJQQJ99AJACYeBjFXJ3w3AAAYACOGfoSn'
const SPEECH_REGION = 'eastus'

const root = process.env.IS_DEBUG ? path.join(__dirname, '..', '..') : __dirname

export class Speech {
  static async toAudio(text: string): Promise<string> {
    const id = v4()
    const file = path.join(root, 'audio', `${id}.wav`)
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
            console.error('Озвучування скасовано', result.errorDetails)
            reject(Error(result.errorDetails))
          }
          synthesizer?.close()
          synthesizer = null
        },
        function (error) {
          console.error('Озвучування скасовано', error)
          reject(error)
          synthesizer?.close()
          synthesizer = null
        }
      )
    })
  }
}
