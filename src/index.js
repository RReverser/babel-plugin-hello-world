import 'better-log/install';

module.exports = function ({ Plugin, types: t }) {
	function ifProxy(path, targetPath, methodName, methodArgs) {
		var targetNode = targetPath.node, targetExpr = targetNode;
		if (!targetPath.scope.isStatic(targetNode)) {
			targetPath.replaceWith(path.scope.generateDeclaredUidIdentifier('target'));
			targetExpr = t.assignmentExpression('=', targetPath.node, targetNode);
		}
		path.setData('target', targetPath.node);
		return t.conditionalExpression(
			t.binaryExpression('instanceof', targetExpr, t.identifier('Proxy')),
			t.callExpression(t.memberExpression(targetPath.node, t.identifier(methodName)), methodArgs),
			path.node
		);
	}

	return new Plugin('hello-world', {
		visitor: {
			Program: {
				exit: function exitProgram(node, parent, scope, file) {
					var runtimeId = file.addImport('babel-plugin-hello-world/dist/runtime');
					this.unshiftContainer('body', t.variableDeclaration(
						'var',
						[t.variableDeclarator(t.identifier('Proxy'), runtimeId)]
					));
				}
			},
			UnaryExpression: {
				enter(node) {
					if (node.operator === 'delete' && t.isMemberExpression(node.argument)) {
						node.argument._proxified = true;
					} else {
						this.skip();
					}
				},
				exit(node) {
					return ifProxy(
						this,
						this.get('argument.object'),
						'deleteProperty',
						[t.toComputedKey(node.argument)]
					);
				}
			},
			MemberExpression: {
				exit(node, parent) {
					if (node._proxified) return;
					return ifProxy(
						this,
						this.get('object'),
						'get',
						[t.toComputedKey(node)]
					);
				}
			},
			AssignmentExpression: {
				enter(node) {
					if (t.isMemberExpression(node.left)) {
						node.left._proxified = true;
					} else {
						this.skip();
					}
				},
				exit(node) {
					return ifProxy(
						this,
						this.get('left.object'),
						'set',
						[t.toComputedKey(node.left), node.right]
					);
				}
			},
			CallExpression: {
				exit(node, parent, scope) {
					var targetPath = this.get('callee');
					var args = [targetPath.getData('target') || t.identifier('undefined'), t.arrayExpression(node.arguments)];
					var targetNode = targetPath.node, targetExpr = targetNode;
					if (!targetPath.scope.isStatic(targetNode)) {
						targetPath.replaceWith(scope.generateDeclaredUidIdentifier('target'));
						targetExpr = t.assignmentExpression('=', targetPath.node, targetNode);
					}
					return t.callExpression(t.memberExpression(targetExpr, t.identifier('apply')), args);
				}
			}
		}
	});
};
