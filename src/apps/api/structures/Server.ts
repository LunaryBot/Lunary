import fastify, { type FastifyInstance } from 'fastify'
import fastifyBodyRaw from 'fastify-raw-body'

interface ServerOptions {
  port: number
  hostname: string
  serverName?: string
}

export class Server {
	httpServer: FastifyInstance

	serverName: string
	hostname: string
	port: number

	isReady = false

	constructor(options: ServerOptions) {
		this.hostname = options.hostname
		this.port = options.port
		this.serverName = options.serverName ?? 'Main'

		this.httpServer = fastify()

		this.httpServer.register(fastifyBodyRaw as any, {
			fields: 'rawBody',
			global: true,
		})
	}

	init() {
		return new Promise<{ hostname: string, port: number, address: string, serverName: string }>((resolve, reject) => {
			const { hostname: host, port, serverName } = this

			const { signal } = new AbortController()

			this.httpServer.listen(
				{
					port,
					host,
					exclusive: false,
					signal,
				},
				(error, address) => {
					if(error) reject(error)
					else resolve({ hostname: host, port, address, serverName })
				}
			)
		})
	}
}