const { createServer } = require('http');
const { createReadStream } = require('fs');
const fs = require('fs')
const nodemailer = require('nodemailer');
var validator = require("email-validator");

const cooki = require('cookie-parser');
const jwt = require('jsonwebtoken');

var db = require('./js/database');
const { getCodeById, getByEmail } = require('./js/database');

let mailTransporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "726b391c1c05d1",
        pass: "08d1080535d5e6"
    },
    debug: false,
    logger: true
});

let mailDetails = {
    from: 'empub.project@gmail.com',
    to: null,
    subject: null,
    text: null
};

function splitWords(words) {
    var n = words.split("=");
    return n[n.length - 1];
}

function generateCode() {
    var code = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < 6; i++)
        code += possible.charAt(Math.floor(Math.random() * possible.length));
    return code;
}

function parseCookies(request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name ?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

function stringifyCookies(cookies) {
    return Object.entries(cookies)
        .map(([k, v]) => k + '=' + encodeURIComponent(v))
        .join('; ');
}

function checkCookie(req, res) {
    var cookies = parseCookies(req);
    if (Object.keys(cookies).length == 0 && !req.url.startsWith('/verification')) {
        res.writeHead(302, { 'Location': '/verification' });
        res.end();
        return false;
    }
    return true;
}

const port = 3000;
const server = createServer(async(req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.statusCode = 302;
        res.writeHead(302, { 'Location': '/verification' });
        res.end();
    }

    if (req.method === 'GET' && req.url === '/verification') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        createReadStream('verification.html').pipe(res);
    }
    if (req.url === '/verification.css') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/css');
        var cssFile = fs.readFileSync("./css/verification.css", { encoding: "utf8" });
        res.write(cssFile);
        res.end();
    }
    if (req.method === 'GET' && req.url.startsWith('/forum')) {
        if (checkCookie(req, res) == true) {
            res.setHeader('Content-Type', 'text/html');
            createReadStream('forum.html').pipe(res);
        }
    }
    if (req.url === '/forum.css') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/css');
        var cssFile = fs.readFileSync("./css/forum.css", { encoding: "utf8" });
        res.write(cssFile);
        res.end();
    }
    if (req.url === '/forum.js') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/css');
        var file = fs.readFileSync("./js/forum.js", { encoding: "utf8" });
        res.write(file);
        res.end();
    }
    if (req.url === '/verification.js') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/css');
        var file = fs.readFileSync("./js/verification.js", { encoding: "utf8" });
        res.write(file);
        res.end();
    }

    if (req.url.startsWith("/user/email=")) {
        var email = splitWords(req.url);
        var user = await db.getByEmail(email);

        if (validator.validate(email)) {

            if (user != undefined) {
                var code = generateCode();
                await db.createCode(code, user.id);
                mailDetails.to = user.email
                mailDetails.subject = "Your Verification CODE"
                mailDetails.text = `Your code is ${code}`
                mailTransporter.sendMail(mailDetails, function(err, data) {
                    if (err) {
                        console.log('Error Occurs' + err);
                    } else {
                        console.log('Email sent successfully');
                    }
                });

                setTimeout(function() {
                    db.deleteCode(user.id)
                }, 5 * 60 * 1000);
            } else {
                await db.createUser(email, email);
                user = await db.getByEmail(email);
                var code = generateCode();
                await db.createCode(code, user.id);
                mailDetails.to = user.email
                mailDetails.subject = "Your Verification CODE"
                mailDetails.text = `Your code is ${code}`
                mailTransporter.sendMail(mailDetails, function(err, data) {
                    if (err) {
                        console.log('Error Occurs' + err);
                    } else {
                        console.log('Email sent successfully');
                    }
                });
                setTimeout(function() {
                    db.deleteCode(user.id)
                }, 5 * 60 * 1000);
            }
            // logica pt trimis email
            res.statusCode = 200;
            res.end();
        } else {
            res.statusCode = 404;
            res.end();
        }
    }


    if (req.url.startsWith("/user/code=")) {
        var code = splitWords(req.url);
        var header = req.headers['emailuser']
        var user = await db.getByEmail(header)
        var check = await db.getCodeById(user.id)

        if (check.code == code) {
            const token = jwt.sign(user, "secretkey", {
                algorithm: "HS256",
                expiresIn: 600,
            });

            cookies = { "token": token }
            res.writeHead(200, { 'Access-Control-Expose-Headers': 'Set-Cookie', 'Set-Cookie': stringifyCookies(cookies) + "; HttpOnly" });
            res.write(JSON.stringify(cookies))
            res.end();
        } else {
            res.statusCode = 404;
            res.end();
        }

    }

    if (req.method === 'POST' && req.url.startsWith("/post")) {
        const buffers = [];

        for await (const chunk of req) {
            buffers.push(chunk);
        }

        var data = Buffer.concat(buffers).toString();
        data = JSON.parse(data)

        // console.log(JSON.parse(data));
        var cookies = parseCookies(req);
        // console.log(jwt.decode(cookies.token))
        var info = jwt.decode(cookies.token)
        if (data.subiect == '' || data.message == '') {
            res.statusCode = 204;
            res.end();
        } else {
            await db.createPost(data.subiect, data.message, data.type, info.id);

            var totalMinutes = data.hours * 60 + data.minutes
            setTimeout(function() {
                db.deletePost(data.subiect, data.message, data.type, info.id)
            }, totalMinutes * 60 * 1000);

            res.statusCode = 200;
            res.end();
        }
    }

    if (req.url.startsWith('/getPosts')) {
        var results = await db.getAllPublicPosts();
        var final = { submit: true, results: results }

        res.statusCode = 200;
        res.write(JSON.stringify(final));
        res.end();
    }

    var forumProfileRegex = /\/post\/([1-9]\d*$)/

    if (req.method === 'GET' && req.url.match(forumProfileRegex)) {
        var output = req.url.match(forumProfileRegex);

        var cookies = parseCookies(req);
        var info = jwt.decode(cookies.token)

        var results = undefined
        var truth = false;

        if (info.id == output[1]) {
            results = await db.getAllPostsById(info.id);
            truth = true

        } else {
            results = await db.getAllPublicPostsById(output[1]);
        }
        var final = { submit: truth, results: results }

        res.statusCode = 200;
        if (results != undefined) {
            res.write(JSON.stringify(final));
        } else {
            res.write(JSON.stringify(final));
        }
        res.end();
    }
});

server.listen(port);
console.log(`locally running at http://localhost:${port}/`);