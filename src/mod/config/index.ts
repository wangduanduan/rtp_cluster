interface Conf {
    /**
     * 最大日志量，单位MB
     */
    maxLogSizeMB: number
    /**
     * 日志保留多少份
     */
    logBackups: number
    /**
     * 日志级别
     */
    logLevel: string
    /**
     * TCP监听端口
     */
    listenPort: number
    listenHost: string
}

const Config: Readonly<Conf> = {
    maxLogSizeMB: process.env.maxLogSizeMB ? parseInt(process.env.maxLogSizeMB) : 10,
    logBackups: process.env.logBackups ? parseInt(process.env.logBackups) : 10,
    logLevel: process.env.logBackups ?? 'info',
    listenHost: process.env.listenHost ?? '0.0.0.0',
    listenPort: process.env.listenPort ? parseInt(process.env.listenPort) : 7888,
}

export default Config

