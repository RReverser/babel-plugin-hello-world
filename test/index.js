var assert = require('assert');
var babel = require('babel-core');
var chalk = require('chalk');
var clear = require('clear');
var diff = require('diff');
var fs = require('fs');
var path = require('path');

require('babel-register');

var pluginPath = require.resolve('../src');

function runTests() {
	var testsPath = __dirname + '/fixtures/';

	var exitCode = fs.readdirSync(testsPath).map(function(item) {
		return {
			path: path.join(testsPath, item),
			name: item,
		};
	}).filter(function(item) {
		return fs.statSync(item.path).isDirectory();
	}).map(runTest).reduce((acc, cur) => acc + cur, 0);

	return exitCode;
}

function runTest(dir) {
	var exitCode = 0;
	var output = babel.transformFileSync(dir.path + '/actual.js', {
		plugins: [pluginPath]
	});

	var expected = fs.readFileSync(dir.path + '/expected.js', 'utf-8');

	function normalizeLines(str) {
		return str.trimRight().replace(/\r\n/g, '\n');
	}

	process.stdout.write(chalk.bgWhite.black(dir.name));
	process.stdout.write('\n\n');

	diff.diffLines(normalizeLines(output.code), normalizeLines(expected))
	.forEach(function (part) {
		var value = part.value;
		if (part.added) {
			value = chalk.green(part.value);
			exitCode = 1;
		} else if (part.removed) {
			value = chalk.red(part.value);
			exitCode = 1;
		}


		process.stdout.write(value);
	});

	process.stdout.write('\n\n\n');

	return exitCode;
}

if (process.argv.indexOf('--watch') >= 0) {
	require('watch').watchTree(__dirname + '/..', function () {
		delete require.cache[pluginPath];
		clear();
		console.log('Press Ctrl+C to stop watching...');
		console.log('================================');
		try {
			runTests();
		} catch (e) {
			console.error(chalk.magenta(e.stack));
		}
	});
} else {
	var exitCode = runTests();
	process.exit(exitCode);
}
