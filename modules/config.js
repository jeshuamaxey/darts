var config = config || {};

config = {
	"meshSize": 200,
	"meshRatio": {
		"bullseye": 6.35/200,
		"bull" : 15.9/200,
		"innerTreble": 99/200,
		"outerTreble": 107/200,
		"innerDouble": 162/200,
		"outerDouble": 170/200
	}
};

/* Fix Variables */
config.mm2px = config.meshSize/400;
config.px2mm = 1/config.mm2px;

module.exports = config;