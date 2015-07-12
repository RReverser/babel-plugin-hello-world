var p = new Proxy({}, {
	deleteProperty(target, key) {
		console.log('delete', key);
		return delete target[key];
	},
	get(target, key) {
		window.console.log('get', key);
		return target[key];
	},
	set(target, key, value) {
		console.log('set', key, value);
		target[key] = value;
		return true;
	}
});

getObject().prop;
getObject().prop = getValue();
