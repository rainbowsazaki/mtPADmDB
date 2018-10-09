module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jquery": true
    },
    "globals": {
      "Vue": true,
      "VueRouter": true,
      "Vuex": true,
      "axios": true,
      "gtag": true,
      "twttr": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2016
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};