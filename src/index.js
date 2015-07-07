import 'better-log/install';

module.exports = function ({ Plugin, acorn, types: t }) {
	return new Plugin('hello-world', {
		visitor: {
			Program(node, parent, scope, file) {
				this.unshiftContainer('body', t.expressionStatement(t.literal('use helloworld')));
			}
		}
	});
};
