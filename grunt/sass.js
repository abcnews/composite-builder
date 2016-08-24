module.exports = {
	dev: {
		options: {
			style: "nested"
		},
		files: [
			{
				expand: true,
				cwd: 'src/styles',
				src: '**/*.scss',
				dest: 'build/styles',
				ext: '.css',
				extDot: 'last'
			}
		]
	},

	prod: {
		options: {
			style: "compressed"
		},
		files: [
			{
				expand: true,
				cwd: 'src/styles',
				src: '**/*.scss',
				dest: 'build/styles',
				ext: '.css',
				extDot: 'last'
			}
		]
	}

};
