'use strict';
const Boom = require('boom');

exports.register = function (plugin, options, next) {

    //Check if header contains version
    const DEFAULT_HEADER_KEY = 'version';
    const DEFAULT_PATTERN = /^(v[1-9])$/;
    const versionHeader = options.header || DEFAULT_HEADER_KEY;
    const pattern = options.pattern || DEFAULT_PATTERN;
    const supported_versions = options.supported_versions || ['1.0'];
    const default_version = options.default_version || '1.0';

    // server.select if you have more than one connection
    const table = plugin.table();
    const route_version_map = {};

    // On Startup - Get the list of all Server routes registered in the server.
    table[0].table.forEach((route) => {

        route_version_map[route.path] = route.settings.plugins.apiVersion || default_version;
    });

    plugin.ext('onRequest', (request, reply) => {

        const urlPath = request.url.pathname.split('/');
        urlPath[0] === '' ? urlPath.shift() : null;
        const reqHeader = request.headers[versionHeader];

        // If there is no request version - just continue as usual..
        if (!reqHeader || urlPath.indexOf("credential-management") === -1) {

            request.headers.apiVersion = default_version;
            return reply.continue();
        }

        const requestedVersionMatch = reqHeader.match(pattern) || [null,null,default_version];
        if (requestedVersionMatch && !pattern.test(urlPath[0])) {
            const origUrl = '/' + urlPath.join('/');
            const originalConfiguredVersion = route_version_map[origUrl];
            const requestedVersion = requestedVersionMatch[2];

            if (supported_versions.indexOf(requestedVersion) < 0) {
                return reply(Boom.unsupportedMediaType('The specified version is not supported'));
            }
            urlPath.unshift('', requestedVersion);
            const versionedUrl = urlPath.join('/');

            const route = plugin.match(request.method, versionedUrl);
            const originalRoute = plugin.match(request.method, origUrl);

            // Get the version for an url path.
            const configuredVersion = route_version_map[versionedUrl];
            // Try to find the exact match for the version
            if (route) {
                request.setUrl(versionedUrl + (request.url.search || ''));
                request.headers.apiVersion = requestedVersion;
            }
            else {
                // If none matches - then throw not found error error.
                return reply(Boom.notFound('The requested URL/Method was not found on this server.'));
            }

        }
        if (!request.headers.apiVersion) {
            request.headers.apiVersion = default_version;
        }

        reply.continue();
    });
    next();
};

exports.register.attributes = {
    name: 'api-versioning',
    version: '0.0.6'
};
