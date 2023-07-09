import * as log4js from 'log4js'
import config from '../config'

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        file: {
            type: 'file',
            filename: 'mrcpproxy.log',
            maxLogSize: 1024 * 1024 * config.maxLogSizeMB,
            backups: config.logBackups,
        },
    },
    categories: {
        default: {
            appenders: ['out', 'file'],
            level: config.logLevel,
        },
    },
})

export function getLogger(tag: string) {
    return log4js.getLogger(tag)
}

