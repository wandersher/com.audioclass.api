import admin from 'firebase-admin'
import * as firebase from 'firebase/app'
import 'firebase/firestore'
import { getFirestore, collection, query, where, onSnapshot, QueryDocumentSnapshot, DocumentData, setDoc } from 'firebase/firestore'
import { Speech } from './speech'
import { v4 } from 'uuid'
import { rmSync } from 'fs'

const service = {
  'type': 'service_account',
  'project_id': 'audioclassroom',
  'private_key_id': '23cc1fa8187192e13eb8de4a39638c5b71021741',
  'private_key':
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCUSmCwgP/R3Har\nG/k4BcuE2mV3J7WnMHQqsypDFvPnRyU3adOr/ZE3X6cs4PZQ7l9W6Cw11jnZdcur\nVDahhM0GpLbNNC4V6fqhsSDOfLNlSJF1IbnXvxDHKoYy70uJliS0ywgkKKz5+8YZ\nNEHWO03wS4IeAkDIE3GLZL/oInsoDp1Vbs+FiC2OWmpQ96H7H1HtR9kRfbvd2QRF\njTZHPF2A2rEwYvikhc+TrPqoYt6hqD2hsulyLYZ3EiK8AKvLet4we3yB1oHz3HD3\np1YOs3AE3+vhuDls7gTj8LofMQY7wPGk7Q5QMSBBMdCaX9n0jPc+4TQV/p+vXSKY\nwcXse+a7AgMBAAECggEAOyg6z17+7xkMrDEyKEPDj4HSpYjNYl+lkB0+eFoxPev3\ncFZC76Nt6ZG6ruAl015s4U4oyOdn15UzBWvIiYHhistt84nj8rEPX666YDWGGZss\nD/a+3U8nIdUYiTxGPaKMjSVL36TscKOcwRRESXMKIhj1VQRgFJERJGMyXahXykAC\nyypfEj/W/BrlQ/tIIn916LiYECy9pR8gHIkZHwXxCjfjhgGIvBstd6A2ztX4ylJc\nYLT2IwIPf29/TJhpGvTrMzz8XjdjzdX/+EkocYlKg+r9Sy2872naXK2ZTRycNqzr\niQGqPJQAP9KOZ/tPW+A5/H97IAB2c+ArST2yK4uzVQKBgQDHgOVwi8YuxRGfJmCw\niMnfmSyiGbSIB2daoxxsd2SXiecvHYdySbty6EfnoEtE03CMYnK6WWi6Mq4dj1il\nD8MpcAdso0wbtxACrNjzGIHCLodkuvgtql7jzcwJ0MOuXtD9ryPC7hd/Bubwt3To\nsJc0YMPwa3LLq6d9RZZ5oBlMfQKBgQC+SMXNor6SHP17VKZJIPzuI2q4h44U7nDe\nAkoxUvLcjDeT71AeF0R9GgZjkDCNxgU4C1insSpVT/MsTmMG4aaKJDlz2Ifm+14B\npm5clxvvnbmdpW9xtIUTSOTuFdJszMPUUF4gXuGWp4QrLLdHJZ6WNJDcBBX67u4o\nPwNVfY49lwKBgQCeSsBBRzXM4CH2M74d87qxBdjrGRgroiw4NxkTWrvenNVohbZ1\nUNlA99othvqRtm4jhO1gvBYjPpj17Um5VcNUuoW5heuaReqXJMvSPgyepMpaexr1\nKKu3dg9BbnoEfUi3L+JhBQZxjGlqbzV8drjSH0D4HljsDtuKws7827GXBQKBgQCw\nc8FhqGn6CoIQrPWqWLnThuo/Bgz+YgIuDYeJZ7coR6p+N2xfCwqKy+hiyWINBjTu\nvK7QilyMUiBY1LPFvNh3v5G7WG7mBfEtrI0otUPFlsh6ZOAMW+8PbAhGs9u24scy\nCfjPIc0lrF/GvaeThVIjTcmLDQro8EnO7mgEDfMqLwKBgFWUrovxE854uyLzoAT+\nZgE2d1C5BQ3kxuUE7W5w4lBFZI60sJqI5d0SnQ+N6HS5f/rdAqtgZsfnjoU/1AtL\nflajAyhokgxbpUD4/uXFhVy5/Fv4ZefMX6JYnQ4nSSOV/ZarkzIlZs2VcWxPUghH\ntQVIue7nCUnSmsP0jPgfXxyb\n-----END PRIVATE KEY-----\n',
  'client_email': 'firebase-adminsdk-k8vm1@audioclassroom.iam.gserviceaccount.com',
  'client_id': '106082585179760974807',
  'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
  'token_uri': 'https://oauth2.googleapis.com/token',
  'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
  'client_x509_cert_url': 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-k8vm1%40audioclassroom.iam.gserviceaccount.com',
  'universe_domain': 'googleapis.com'
}

const client = {
  apiKey: 'AIzaSyBzn-huX73FWQalz95xfC-UMHUCRwIb65E',
  authDomain: 'audioclassroom.firebaseapp.com',
  projectId: 'audioclassroom',
  storageBucket: 'audioclassroom.appspot.com',
  messagingSenderId: '826309820418',
  appId: '1:826309820418:web:1cda3e0f5ac1d4f900671b'
}

const app = firebase.initializeApp(client)

admin.initializeApp({
  credential: admin.credential.cert(service as any),
  databaseURL: 'https://audioclassroom-default-rtdb.firebaseio.com',
  storageBucket: 'audioclassroom.appspot.com'
})

const bucket = admin.storage().bucket()
const firestore = getFirestore(app, 'audioclass')

async function upload(destination: string, filepath: string) {
  console.log('Розпочато завантаження файлу', filepath)
  const file = bucket.file(destination)
  await bucket.upload(filepath, {
    destination,
    metadata: {
      contentType: 'audio/mp3', // Встановіть правильний MIME-тип для вашого файлу
      metadata: {
        firebaseStorageDownloadTokens: v4() // Генеруємо унікальний токен для доступу до файлу
      }
    }
  })
  console.log('Створення зовнішнього посилання для файлу')
  const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' })
  console.log(url)
  rmSync(filepath, { force: true })
  console.log('Завантаження файлу завершено')
  return url
}

async function remove(destination: string) {
  return await bucket.file(destination).delete({ ignoreNotFound: true })
}

let courses: QueryDocumentSnapshot<DocumentData, DocumentData>[] | null = null
onSnapshot(collection(firestore, 'courses'), async snapshot => {
  if (courses === null) {
    courses = snapshot.docs
    await Promise.allSettled(
      courses.map(async doc => {
        const id = doc.id
        const current = doc.data()
        if (!current.audio) {
          const filepath = await Speech.toAudio(`${current.name}, проведіть вгору для перегляду тем або вниз для повернення`)
          const url = await upload(`audio/courses/names/${id}.mp3`, filepath)
          await setDoc(doc.ref, { audio: url }, { merge: true })
        }
      })
    )
    return
  }
  const changes = snapshot.docChanges({})
  for (let change of changes) {
    const id = change.doc.id
    const current = change.doc.data()
    switch (change.type) {
      case 'added':
        const filepath = await Speech.toAudio(`${current.name}, проведіть вгору для перегляду тем або вниз для повернення`)
        const url = await upload(`audio/courses/names/${id}.mp3`, filepath)
        await setDoc(change.doc.ref, { audio: url }, { merge: true })
        break
      case 'modified':
        const prev = courses.at(change.oldIndex)?.data()
        if (!prev) break
        if (prev.name != current.name) {
          const filepath = await Speech.toAudio(`${current.name}, проведіть вгору для перегляду тем або вниз для повернення`)
          const url = await upload(`audio/courses/names/${id}.mp3`, filepath)
          courses[change.oldIndex] = change.doc
          await setDoc(change.doc.ref, { audio: url }, { merge: true })
        }
        break
      case 'removed':
        await remove(`audio/courses/names/${id}.mp3`)
        break
    }
  }
  courses = snapshot.docs
})

let topics: QueryDocumentSnapshot<DocumentData, DocumentData>[] | null = null
onSnapshot(collection(firestore, 'topics'), async snapshot => {
  let payload: any

  if (topics === null) {
    topics = snapshot.docs
    await Promise.allSettled(
      topics.map(async doc => {
        const id = doc.id
        const current = doc.data()
        payload = {}
        if (!current.audio_name)
          payload.audio_name = await upload(
            `audio/topics/names/${id}.mp3`,
            await Speech.toAudio(`${current.name}, проведіть вгору для прослуховування теми або вниз для повернення`)
          )
        if (!current.audio_text) payload.audio_text = await upload(`audio/topics/texts/${id}.mp3`, await Speech.toAudio(current.text))
        if (Object.values(payload).length) await setDoc(doc.ref, payload, { merge: true })
      })
    )
    return
  }
  const changes = snapshot.docChanges({})

  for (let change of changes) {
    const id = change.doc.id
    const current = change.doc.data()
    switch (change.type) {
      case 'added':
        payload = {
          audio_name: await upload(
            `audio/topics/names/${id}.mp3`,
            await Speech.toAudio(`${current.name}, проведіть вгору для прослуховування теми або вниз для повернення`)
          ),
          audio_text: await upload(`audio/topics/texts/${id}.mp3`, await Speech.toAudio(current.text))
        }
        await setDoc(change.doc.ref, payload, { merge: true })
        break
      case 'modified':
        const prev = topics.at(change.oldIndex)?.data()
        if (!prev) break
        payload = {}
        if (prev.name != current.name)
          payload.audio_name = await upload(
            `audio/topics/names/${id}.mp3`,
            await Speech.toAudio(`${current.name}, проведіть вгору для прослуховування теми або вниз для повернення`)
          )
        if (prev.text != current.text) payload.audio_text = await upload(`audio/topics/texts/${id}.mp3`, await Speech.toAudio(current.text))
        topics[change.oldIndex] = change.doc
        if (Object.keys(payload).length) await setDoc(change.doc.ref, payload, { merge: true })
        break
      case 'removed':
        await remove(`audio/topics/names/${id}.mp3`)
        await remove(`audio/topics/texts/${id}.mp3`)
        break
    }
  }
  topics = snapshot.docs
})

let exercises: QueryDocumentSnapshot<DocumentData, DocumentData>[] | null = null
onSnapshot(collection(firestore, 'exercise'), async snapshot => {
  if (exercises === null) {
    exercises = snapshot.docs
    await Promise.allSettled(
      exercises.map(async doc => {
        const id = doc.id
        const current = doc.data()
        if (!current.audio) {
          const filepath = await Speech.toAudio(`${current.text}, проведіть вгору для запису відповіді або вниз для повернення`)
          const url = await upload(`audio/exercises/texts/${id}.mp3`, filepath)
          await setDoc(doc.ref, { audio: url }, { merge: true })
        }
      })
    )
    return
  }
  const changes = snapshot.docChanges({})
  for (let change of changes) {
    const id = change.doc.id
    const current = change.doc.data()
    switch (change.type) {
      case 'added':
        const filepath = await Speech.toAudio(`${current.text}, проведіть вгору для запису відповіді або вниз для повернення`)
        const url = await upload(`audio/exercises/texts/${id}.mp3`, filepath)
        await setDoc(change.doc.ref, { audio: url }, { merge: true })
        break
      case 'modified':
        const prev = exercises.at(change.oldIndex)?.data()
        if (!prev) break
        if (prev.name != current.name) {
          const filepath = await Speech.toAudio(`${current.text}, проведіть вгору для запису відповіді або вниз для повернення`)
          const url = await upload(`audio/exercises/texts/${id}.mp3`, filepath)
          exercises[change.oldIndex] = change.doc
          await setDoc(change.doc.ref, { audio: url }, { merge: true })
        }
        break
      case 'removed':
        await remove(`audio/exercises/texts/${id}.mp3`)
        break
    }
  }
  exercises = snapshot.docs
})

let answers: any[] | null = null
onSnapshot(collection(firestore, 'answers'), async snapshot => {
  if (answers === null) {
    answers = snapshot.docs.map(doc => ({ ...doc.data(), ref: doc.ref }))
    await Promise.allSettled(
      answers.map(async current => {
        if (!current.text) {
          try {
            const text = await Speech.toText(current.audio)
            await setDoc(current.ref, { text, error: '' }, { merge: true })
          } catch (error: any) {
            await setDoc(current.ref, { error: error.message, text: '' }, { merge: true })
          }
        }
      })
    )
    return
  }
  const changes = snapshot.docChanges({})
  for (let change of changes) {
    const current: any = { ...change.doc.data(), ref: change.doc.ref }
    switch (change.type) {
      case 'added':
        try {
          const text = await Speech.toText(current.audio)
          await setDoc(current.ref, { text, error: '' }, { merge: true })
        } catch (error: any) {
          await setDoc(current.ref, { error: error.message, text: '' }, { merge: true })
        }
        answers.push(current)
        break
      case 'modified':
        const prev = answers.at(change.oldIndex)
        if (!prev) break
        if (prev.audio != current.audio) {
          try {
            const text = await Speech.toText(current.audio)
            await setDoc(current.ref, { text, error: '' }, { merge: true })
          } catch (error: any) {
            await setDoc(current.ref, { error: error.message, text: '' }, { merge: true })
          }
        }
        break
      case 'removed':
        // await remove(`audio/answers/texts/${id}.mp3`)
        break
    }
  }
  exercises = snapshot.docs
})
