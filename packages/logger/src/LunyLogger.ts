import chalk from 'chalk'

import { ChalkColor } from './typing'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

type LoggerLevel = {
  badge?: string,
  color?: ChalkColor | `#${string}`,
  label?: string
  logLevel: LogLevel
}

export type LunyLoggerLevelsConfig<T extends string = string> = Record<T, LoggerLevel>

interface LunyLoggerPrintMessageFormatterData {
  message: string
  level: string
  label: string
  badge: string
  timestamp: string
  color?: `#${string}` | ChalkColor
  more?: { details?: string, tags?: string | string[] }
  commonLabel: string
}

type LunyLoggerPrintMessageFormatter = (data: LunyLoggerPrintMessageFormatterData) => string

interface LunyLoggerFormatOptions { 
  colorize: { badge?: boolean, label?: boolean }, 
  function: LunyLoggerPrintMessageFormatter 
}

export interface LunyLoggerConfig<T extends string> {
  levels: LunyLoggerLevelsConfig<T>
  format?: Omit<LunyLoggerFormatOptions, 'function' | 'colorize'> & Partial<Pick<LunyLoggerFormatOptions, 'function' | 'colorize'>>
}

const printf: LunyLoggerPrintMessageFormatter = ({ label, badge, message }) => `${badge} ${label}: ${message}`

export class LunyLogger {
  formatOptions: LunyLoggerFormatOptions
	
  constructor(config: LunyLoggerConfig<string>) {
    for(const [level, levelConfig] of Object.entries(config.levels)) {
      (this as any)[level] = this.makeLogger({ ...levelConfig, level })
    }

    this.formatOptions = {
      colorize: config.format?.colorize ?? {},
      function: config.format?.function ?? printf,
    }
  }

  private makeLogger(config: LoggerLevel & { level: string }) {
    return (message: string, more?: LunyLoggerPrintMessageFormatterData['more']) => this._log(config, message, more)
  }

  private _log({ level, ...config }: LoggerLevel & { level: string }, _message: string, more?: LunyLoggerPrintMessageFormatterData['more']) {
    let colorFn = (string: string) => string

    if(config.color) {
      if(/^#[0-9A-F]{6}$/i.test(config.color)) {
        colorFn = chalk.hex(config.color)
      } else {
        colorFn = chalk[config.color as ChalkColor]
      }
    }

    const commonBadge = config.badge || '◉'
    const badge = this.formatOptions.colorize.label ? colorFn(commonBadge) : commonBadge
		
    const commonLabel = config.label ?? level
    const label = this.formatOptions.colorize?.label ? colorFn(commonLabel) : commonLabel

    const message = this.formatOptions.function({
      badge,
      label,
      level,
      message: _message,
      timestamp: new Date().toISOString(),
      more,
      color: config.color,
      commonLabel,
    })

    console.log(message)
  }
}

type LunyLoggerLogFunction = (message: string, more?: { details?: string | object, tags?: string | string[] }) => void

type LoggerMethods<T extends string> = Record<T, LunyLoggerLogFunction>

const Resource: new <T extends string>(attr: LunyLoggerConfig<T>) => LunyLogger & LoggerMethods<T> = LunyLogger as any

export const lunyCreateLogger = <T extends string>(config: LunyLoggerConfig<T>) => {
  return new Resource<T>(config)
}