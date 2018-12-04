const typescript = require("rollup-plugin-typescript2")

const formats = {
    es: "index.es.js",
    cjs: "index.js"
}

const makeConfig = format => ({
    input: `./src/index.ts`,
    plugins: [
        typescript({
            tsconfig: `./tsconfig.json`,
            useTsconfigDeclarationDir: true,
            clean: true
        })
    ],
    external: ["react", "redux"],
    output: {
        name: "refract",
        format,
        file: `./dist/${formats[format]}`
    }
})

module.exports = [makeConfig("cjs"), makeConfig("es")]
