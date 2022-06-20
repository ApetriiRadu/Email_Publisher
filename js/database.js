const connect = require('@databases/sqlite');
const { sql } = require('@databases/sqlite');

const db = connect('emailpub.db');

async function prepare() {
    await db.query(sql`
        CREATE TABLE IF NOT EXISTS users (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                username VARCHAR NOT NULL,
                email VARCHAR NOT NULL
            );
    `);
    await db.query(sql`
        CREATE TABLE IF NOT EXISTS codes (
            code VARCHAR NOT NULL,
            id INTEGER NOT NULL UNIQUE,
            FOREIGN KEY(id) REFERENCES users(id)
        );
    `);
    await db.query(sql`
    CREATE TABLE IF NOT EXISTS posts (
        subject VARCHAR NOT NULL,
        message VARCHAR NOT NULL,
        type BOOLEAN NOT NULL,
        id INTEGER NOT NULL,
        FOREIGN KEY(id) REFERENCES users(id)
    );
`);
}
const prepared = prepare();

async function createUser(username, email) {
    await prepared;
    await db.query(sql`
        INSERT INTO users (username, email)
        VALUES (${username}, ${email});
    `);
}

async function createCode(code, id) {
    await prepared;
    await db.query(sql`
        INSERT INTO codes (code, id)
        VALUES (${code}, ${id})
        ON CONFLICT(id) DO UPDATE SET code = ${code};
    `);
}

async function deleteCode(id) {
    await prepared;
    await db.query(sql`
        DELETE FROM codes 
        WHERE id = ${id};
    `);
}

async function createPost(subject, message, type, id) {
    await prepared;
    await db.query(sql`
        INSERT INTO posts (subject, message, type, id)
        VALUES (${subject}, ${message}, ${type}, ${id});
    `);
}

async function deletePost(subject, message, type, id) {
    await prepared;
    await db.query(sql`
        DELETE FROM posts
        WHERE subject = ${subject} AND message = ${message} AND type = ${type} AND id = ${id};
    `);
}

async function getById(id) {
    await prepared;
    const results = await db.query(sql`
        SELECT * FROM users WHERE id=${id};
    `);
    if (results.length) {
        return results[0];
    } else {
        return undefined;
    }
}

async function getCodeById(id) {
    await prepared;
    const results = await db.query(sql`
        SELECT * FROM codes WHERE id=${id};
    `);
    if (results.length) {
        return results[0];
    } else {
        return undefined;
    }
}

async function getByUsername(username) {
    await prepared;
    const results = await db.query(sql`
        SELECT * FROM users WHERE username=${username};
    `);
    if (results.length) {
        return results[0];
    } else {
        return undefined;
    }
}

async function getByEmail(email) {
    await prepared;
    const results = await db.query(sql`
        SELECT * FROM users WHERE email=${email};
    `);
    if (results.length) {
        return results[0];
    } else {
        return undefined;
    }
}

async function getAllPublicPosts() {
    await prepared;
    const results = await db.query(sql`
        SELECT * FROM posts 
        WHERE type = 'true';
    `);
    if (results.length) {
        return results;
    } else {
        return undefined;
    }
}

async function getAllPostsById(id) {
    await prepared;
    const results = await db.query(sql`
        SELECT * FROM posts 
        WHERE id = ${id};
    `);
    if (results.length) {
        return results;
    } else {
        return undefined;
    }
}

async function getAllPublicPostsById(id) {
    await prepared;
    const results = await db.query(sql`
        SELECT * FROM posts 
        WHERE type = 'true' AND id = ${id};
    `);
    if (results.length) {
        return results;
    } else {
        return undefined;
    }
}

async function getPostsById(id) {
    await prepared;
    const results = await db.query(sql`
        SELECT * FROM posts 
        WHERE type = 'true' AND id = ${id};
    `);
    if (results.length) {
        return results;
    } else {
        return undefined;
    }
}

async function removeById(id) {
    await prepared;
    await db.query(sql`
        DELETE FROM users WHERE id=${id};
    `);
}

// async function run() {
//     // for tests
// }
// run().catch((ex) => {
//     console.error(ex.stack);
//     process.exit(1);
// });

module.exports = {
    db: db,
    getByUsername: getByUsername,
    getByEmail: getByEmail,
    getById: getById,
    createCode: createCode,
    createUser: createUser,
    getCodeById: getCodeById,
    createPost: createPost,
    deleteCode: deleteCode,
    getAllPublicPosts: getAllPublicPosts,
    deletePost: deletePost,
    getAllPostsById: getAllPostsById,
    getAllPublicPostsById: getAllPublicPostsById
}