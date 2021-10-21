const crypto = require("crypto");

class Hash{
    static SHA512(text){
        const hash = crypto.createHash("sha512");

        return hash.update(text).digest("hex");
    };

    static SHA256(text){
        const hash = crypto.createHash("sha256");

        return hash.update(text).digest("hex");
    };
}

module.exports = {
    Hash
}