'use strict';


const Hapi = require('hapi');

module.exports = function (done, additionalPlugins) {

// Create a server with a host and port
    const server = new Hapi.Server();
    server.connection({});

// Allows 1.0 but not 1.1
    server.route({
        method: 'GET',
        path: '/service1',
        config: {
            plugins: {
                apiVersion: ['1.0']
            }
        },
        handler: function (request, reply) {
            return reply('Service 1: V1.0');
        }
    });


// Supports 1.0,1.1 and 1.2
    server.route({
        method: 'GET',
        path: '/service3',
        config: {
            plugins: {
                apiVersion: ['1.0', '1.1', '1.2']
            }
        },
        handler: function (request, reply) {
            return reply('Service 3: V1.0, 1.1, 1.2');
        }
    });

// In case not explicitly stated - supports only Default version
    server.route({
        method: 'GET',
        path: '/service2',
        handler: function (request, reply) {
            return reply('Service2 - Default Version:1.0');
        }
    });

// Versioned route with apiVersion in the route: Supports only 1.1.
    server.route({
        method: 'GET',
        path: '/1.1/service1',
        handler: function (request, reply) {

            return reply('Service 1: 1.1 Version');
        }
    });

    server.register([{
        register: require('./../api-version'),
        options: {
            pattern: /^(application\/user-management-)(.*?)(\+json)/,
            header: 'content-type',
            supported_versions: ['1.0', '1.1','1.2'],
            default_version: '1.0'
        }
    }], (err) => {
        if (err) {
            throw err;
        }
        server.start((err) => {
            if (err) {
                throw err;
            }
            console.log('Server running at:', server.info.uri);
            return done(server);
        });
    });

}