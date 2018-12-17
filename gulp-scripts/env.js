module.exports.setEnvDev = function() {
    return process.env.NODE_ENV = 'dev';
};

module.exports.setEnvProd = function() {
    return process.env.NODE_ENV = 'prod';
};

module.exports.isEnvDev = function() {
    return process.env.NODE_ENV === 'dev';
};