const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const parseServerConfig = require('../config.json');

const app = express();
const api = new ParseServer(parseServerConfig);

if (process.env.NODE_ENV !== 'producation') {
    const dashboard = new ParseDashboard({
        apps: [
            {
                serverURL: 'http://localhost:3000/api/v1',
                appId: parseServerConfig.appId,
                masterKey: parseServerConfig.masterKey,
                appName: parseServerConfig.appName,
            }
        ],
    });
    app.use('/dashboard', dashboard);
}

app.use('/api/v1', api);

app.listen(3001, () => {
    console.log(`Application running on ${3000}`);
});
