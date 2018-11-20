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
    "extends": ['vue', 'plugin:vue/recommended'],
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
        ],
        "no-var": "error",
        "no-irregular-whitespace": "error",
        "block-spacing": "error",
        "comma-spacing": "error",
        "func-call-spacing": "error",
        "keyword-spacing": "error",
        "no-trailing-spaces": [
            "error",
            {"skipBlankLines": true }
        ],
        "no-whitespace-before-property": "error",
        "arrow-spacing": "error",
        "vue/max-attributes-per-line": 'off',
        "vue/attributes-order": 'off',
        "vue/no-v-html": 'off'
    }
};