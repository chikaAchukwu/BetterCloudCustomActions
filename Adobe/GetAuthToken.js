const axios = require('axios');
const jwt = require('jsonwebtoken');
let secrets;
let errorCallback;

const getToken = async () => {
    try {
        const date = new Date(),
            privateKey = `-----BEGIN PRIVATE KEY-----\n${secrets.privateKey}\n-----END PRIVATE KEY-----`,
            jwt_url = `https://ims-na1.adobelogin.com/ims/exchange/jwt`,
            jwtPayload = {
                exp: Math.ceil(date.setHours(date.getHours() + 1) / 1000),
                iss: secrets.orgId,
                sub: secrets.technicalAccountId,
                aud: `https://ims-na1.adobelogin.com/c/${secrets.clientId}`,
                "https://ims-na1.adobelogin.com/s/ent_user_sdk": true,
                "https://ims-na1.adobelogin.com/s/ent_adobeio_sdk": true
            },
            signOptions = {algorithm: 'RS256'},
            token = jwt.sign(jwtPayload, privateKey, signOptions),
            postData = `client_id=${encodeURIComponent(secrets.clientId)}&client_secret=${encodeURIComponent(secrets.clientSecret)}&jwt_token=${encodeURIComponent(token)}`,
            axios_jwt_request = {
                method: 'post',
                url: jwt_url,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: postData
            };
        const response = await axios(axios_jwt_request);
        const json_jwt_response = response.data;
        return json_jwt_response.access_token ? json_jwt_response.access_token : errorCallback('noToken');
    } catch (err) {
        errorCallback(`Error: ${err.message}`);
    }
};


module.exports = async (input, callback, error) => {
    try {
        errorCallback = error;
        secrets = input.secrets;

        const accessToken = await getToken(error);
        input.request.headers = {
            "X-Api-Key": secrets.clientId,
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        callback(input.request);
    } catch (err) {
        error(`Error: ${err.message}`);
    }
};