import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { connectDB, gracefulShutDown } from './config/database.js'
import { env } from './config/keys.js'
import logger, { logError } from './config/logger.js'

declare global {
  namespace Express {
    interface Request {
      requestTime?: string
      rawBody?: Buffer
    }
  }
}

const app = express()

// CORS configuration
const allowedOrigins = [env.CLIENT_URL]
if (env.NODE_ENV === 'production' && env.CLIENT_URL) {
  allowedOrigins.push(env.CLIENT_URL)
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'x-refresh-token', 'set-cookie'],
}

app.set('trust-proxy', 1)
app.use(cors(corsOptions))
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))
app.disable('x-powered-by')

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString()
  next()
})

app.use('/health', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: env.NODE_ENV,
    timestamp: req.requestTime,
    uptime: process.uptime(),
  })
})
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000
const startServer = async (): Promise<void> => {
  let server: any
  try {
    await connectDB()
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`)
      logger.info(`http://localhost: ${PORT}`)
    })
    //HANDLE unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      console.error(`UNHANDLED REJECTION! Shutting down...`)
      const error = reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason)
      logger.error({ reason: error }, 'Unhandled rejection')

      //close server gracefully
      server.close(() => {
        logger.info(`Process terminated due to unhandled rejection`)
        logger.info('Server shutdown complete')
      })
    })
    //handle termination signals
    process.on('SIGTERM', gracefulShutDown)
    process.on('SIGINT', gracefulShutDown)

    // Handle any other errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') throw error

      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${PORT} requires elevated privileges`)
          process.exit(1)
        case 'EADDRINUSE':
          logger.error(`Port ${PORT} is already in use`)
          process.exit(1)
        default:
          throw error
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logError(` Failed to start server: ${errorMessage}`)
    process.exit(1)
  }
}

if (!process.env.VERCEL) {
  startServer()
} else {
  connectDB().catch(err => {
    console.error('Serverless DB connection failed:', err)
  })
}

export default app
