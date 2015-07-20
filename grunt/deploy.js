module.exports = {
	nucpnoutil01: {
		credentials: ".abc-credentials",
		targetName: "nucpnoutil01",
		target: "/opt/newsdev/news-projects/root/composite-builder/",
		files: [{
			expand: true,
			cwd: 'build/',
			src: ["**/*"]
		}]
	}
};
