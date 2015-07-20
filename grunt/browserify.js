module.exports = {
	"options": {
		"transform": ["brfs"]
	},
	"dev": {
		"options": {
			"debug": true
		},
		"files": {
			"build/scripts/index.js": ["src/scripts/index.js"],
			"build/scripts/archive.js": ["src/scripts/archive-index.js"]
		}
	},
	"prod": {
		"files": {
			"build/scripts/index.js": ["src/scripts/index.js"],
			"build/scripts/archive.js": ["src/scripts/archive-index.js"]
		}
	}
};
