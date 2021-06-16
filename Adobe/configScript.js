const scripts = ['./GetAuthToken', 'CreateUser'].map(require);

let input = {
    payload: 'Not sure what this looks like',
    environment: null,
    secrets: JSON.parse('{"publicKey":"", "clientId":"", "clientSecret":"", "technicalAccountId":"", "orgId":"","privateKey":""}'),
    request: JSON.parse('{"url": "", "method": "POST", "headers": {"Accept":"application/json", "Content-Type":"application/x-www-form-urlencoded"}, "body":{"email":"","role":""}}')
};

let callback = function (webhookRequest) {
    input.request = webhookRequest;
};

let error = function (name) {
    console.log("Failed: " + name);
};

async function executeWebhook(request) {
    const axios = require('axios');

    let rebuiltRequest = {
        url: request.url,
        method: request.method,
        headers: request.headers,
        data: request.body
    };

    axios(rebuiltRequest).then(response => {
        console.log("Webhook Request: " + JSON.stringify(rebuiltRequest));
        console.log("Webhook Response: " + JSON.stringify(response.data));
    }).catch(err => {
        console.log("Webhook Request Error: " + err)
    })
}

async function forOf() {
    let result = [];
    for (const script of scripts) {
        result.push(await script(input, callback, error))
    }
    return executeWebhook(input.request);
}

forOf();
