const noop = () => {};

const reflectors = [
	'toString',
	'valueOf',
	'inspect',
	'constructor',
	Symbol.toPrimitive,
	Symbol.for('nodejs.util.inspect.custom'),
];

function buildRoute(options: { methods: { [name: string]: (...args: any[]) => any }, join?: string, baseRoute?: string[]|string }) {
	const { methods, join = '/', baseRoute = [] } = options;

	const route = typeof baseRoute === 'string' ? baseRoute.split(join) : baseRoute;

	const handler = {
		get(_, name: string) {
			if(reflectors.includes(name)) return () => route.join(join);

			if(Object.keys(methods).includes(name)) {
				return (options: any) => {
					const params = [route.join(join)];

					if(options) {
						params.push(options);
					}

					return methods[name](...params);
				};
			}

			route.push(name);
			
			return new Proxy(noop, handler);
		},
		apply(target, _, args) {
			route.push(...args.filter((x) => x != null));

			return new Proxy(noop, handler);
		},
	} as ProxyHandler<any>;

	return new Proxy(noop, handler);
}

export default buildRoute;