import { createLogger, format, transports } from 'winston'

const colorizer = format.colorize()
const alignColorsAndTime = format.combine(
  format.colorize({
    message: true
  }),
  // format.prettyPrint({ colorize: true, depth: 4 }),
  format.timestamp({
    format: 'YY-MM-DD HH:MM:SS',
  }),
  format.printf((info) => {
    const timestamp = colorizer.colorize(info.level, `[${info.level.toUpperCase()}] ${info.timestamp}:`)
    // return colorizer.colorize(info.level, `${info.level} ${info.timestamp}: ${info.message} \n${info.metadata}`)
    return `${timestamp} ${info.message}`
  })
)

const logger = createLogger({
  level: 'info',
  exitOnError: false,
  format: (process.env.NODE_ENV === 'local') ? alignColorsAndTime : format.json(),
  transports: [
    new transports.Console()
  ]
})

export default logger
