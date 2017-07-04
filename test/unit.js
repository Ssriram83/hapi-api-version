'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;

const Code = require('code'); // assertion library
const expect = Code.expect;


const it = lab.it;
let server;

lab.before((done) => {
    require('./mock-server')((obj) => {

        server = obj;
        done();

    });
});

const options = (url, contentType) => {

    return {
        method: 'GET',
        url,
        headers: {
            'Content-Type': contentType
        }
    };

};

describe('API Version Plugin', () => {

    it('Should call a versioned service when header explicitly', (done) => {

        server.inject(options('/service1', 'application/user-management-1.1+json'), (response) => {

            expect(response.payload).to.equal('Service 1: 1.1 Version');
            done();
        });
    });

    it('Should call unversioned service when version in the header is default version', (done) => {

        server.inject(options('/service2', 'application/user-management-1.0+json'), (response) => {

            expect(response.payload).to.equal('Service2 - Default Version:1.0');
            done();
        });
    });

    it('Should fallback to default version when no header is specified', (done) => {

        server.inject(options('/service2', 'application/json'), (response) => {

            expect(response.payload).to.equal('Service2 - Default Version:1.0');
            done();
        });
    });

    it('Should call versioned service when version is specified in the header and is allowed in the route config', (done) => {

        server.inject(options('/service3', 'application/user-management-1.2+json'), (response) => {

            expect(response.payload).to.equal('Service 3: V1.0, 1.1, 1.2');
            done();

        });
    });

    it('Should throw an error when unsupported version is called', (done) => {

        server.inject(options('/service3', 'application/user-management-1.4+json'), (response) => {

            expect(response.statusCode).to.equal(415);// Un supported media type
            done();
        });
    });

    it('Should throw an error when route config does not support version', (done) => {

        server.inject(options('/service1', 'application/user-management-1.2+json'), (response) => {

            expect(response.statusCode).to.equal(404);// Not found - because 1.2 is supported by server but not found in route.
            done();
        });
    });


    it('Should Contain a apiVersion in the request header', (done) => {

        server.inject(options('/service1', 'application/user-management-1.1+json'), (response) => {

            expect(response.request.headers.apiVersion).to.equal('1.1');
            done();
        });
    });


    it('Should Contain default version in the request header', (done) => {

        server.inject(options('/service1', 'application/json'), (response) => {

            expect(response.request.headers.apiVersion).to.equal('1.0');
            done();
        });
    });
});
