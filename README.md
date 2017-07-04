This is a *Hapi* plugin to support API versioning.

#### Note: This is tailored for our project requirements.

#### Usage:

#### Install: `npm install`

#### Usage in Hapi Server:

```javascript
server.register({
        register: require('./../api-version'),
        options: {
            pattern: /^(application\/user-management-)(.*?)(\+json)/,
            header: 'content-type',
            supported_versions: ['1.0', '1.1','1.2'],
            default_version: '1.0'
        }
    },(err)=>{
        //.....
    ))
```

#### Route Configuration:

```javascript
    //Request to /service1 with header application/user-management-1.1+json
    server.route({
        method: 'GET',
        path: '/1.1/service1',
        handler: function (request, reply) {

            return reply('Service 1: 1.1 Version');
        }
    });
    //Default Implementation of Service 1
    //Request to /service1 with header application/user-management-1.0+json
    server.route({
            method: 'GET',
            path: '/service1',
            handler: function (request, reply) {
                    return reply('Service 1: 1.0 Default Version');
            }
        });
```