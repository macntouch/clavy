var config = {
	mongodb: {
		connection: 'mongodb://localhost/purchase'
	},
	app: {
		ip: process.env.OPENSHIFT_NODEJS_IP || 'localhost',
		port: process.env.OPENSHIFT_NODEJS_PORT || 8080
	}
};

if ( process.env.OPENSHIFT_MONGODB_DB_PASSWORD ) {
	config.mongodb.connection = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
	process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
	process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
	process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
	process.env.OPENSHIFT_APP_NAME;
};

module.exports = config;