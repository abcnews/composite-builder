module.exports = {
	newsdev3: {
		credentials: ".abc-credentials",
		targetName: "newsdev3",
		target: "/var/www/html/tools/composite-builder/",
		files: [{
			expand: true,
			cwd: 'build/',
			src: ["**/*"]
		}]
	}
};
