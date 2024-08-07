import express, { type Application } from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import bodyParser from 'body-parser'
import api from '@/api/animeflv/index'

import { middleware } from '@/api/middlewares/index'

const app: Application = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
  })
})

app.use('/api/v1', api)
// app.use('/api/v1/animeflv-docs', express.static('./animeflv-docs'))

app.use(middleware)

export default app
