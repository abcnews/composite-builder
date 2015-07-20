module.exports = {
	"static": {
		"files": [{
			"expand": true,
			"cwd": "src/",
			"src": ["**/*", "!scripts/**", "!styles/**", "!vendor/**"],
			"dest": "build/"
		}]
	}
};
