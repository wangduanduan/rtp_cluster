import { FastifyRequest } from 'fastify/types/request'
import { FastifyReply } from 'fastify/types/reply'

export async function rtpengine_offer (request: FastifyRequest, reply: FastifyReply) {
    reply.type('application/json').code(200)
    return { hello: 'world' }
}
