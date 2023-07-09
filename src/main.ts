import Fastify from 'fastify'
import { getLogger } from './mod/log'
import { rtpengine_offer } from './route'

const log = getLogger('main')

const fastify = Fastify({ logger: true })

fastify.get('/rtpengine/offer', rtpengine_offer)

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err
    log.info('server is runing on  port')
})
