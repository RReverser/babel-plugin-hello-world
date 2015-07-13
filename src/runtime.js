export default class Proxy {
	constructor(target, handler) {
		this.target = target;
		this.handler = handler;
	}

	get(key) {
		if (this.handler.get) {
			return this.handler.get(this.target, key, this);
		} else {
			return this.target[key];
		}
	}

	set(key, value) {
		if (this.handler.set) {
			this.handler.set(this.target, key, value, this);
			return value;
		} else {
			return this.target[key] = value;
		}
	}
}
