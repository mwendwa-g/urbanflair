const { expressjwt: expressJwt } = require('express-jwt');

function authJwt(){
    const secret = process.env.SECRET;
    const api = process.env.API_URL;

    return expressJwt({
        secret: secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/api\/raldfurniture\/products(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/raldfurniture\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/raldfurniture\/orders(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/raldfurniture\/users(.*)/, methods: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`,
            { url: /\/api\/raldfurniture\/users\/email\/(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/raldfurniture\/users\/(.*)/, methods: ['PUT'] },
            { url: /\/api\/raldfurniture\/orders\/(.*)/, methods: ['PUT'] },
            `/`,
        ]
    }) 
}

async function isRevoked(req, token) {
    const role = token.payload.role;
    if (!role) {
        return true; 
    }
    if (role === "admin") {
        return false; 
    }
    if (role === "delivery" && req.path.includes("orders-list.html")) {
        return false; 
    }
    if (role === "customer" && req.path.includes("index.html")) {
        return false;
    }
    return true;
}


module.exports = authJwt;