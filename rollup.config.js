const typescript = require("rollup-plugin-typescript2")

module.exports = {
    input: `./src/index.ts`,
    plugins: [
        typescript({
            tsconfig: `./tsconfig.json`,
            useTsconfigDeclarationDir: true,
            clean: true
        })
    ],
    output: [
        { format: "cjs", file: `./dist/index.js` },
        { format: "es", file: `./dist/index.es.js` }
    ]
}
