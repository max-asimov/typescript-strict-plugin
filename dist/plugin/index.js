"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InMemoryProgram_1 = require("./InMemoryProgram");
const PluginStrictFileChecker_1 = require("./PluginStrictFileChecker");
const utils_1 = require("./utils");
const init = (mod) => {
    const ts = mod.typescript;
    function create(info) {
        const inMemoryProgram = new InMemoryProgram_1.InMemoryProgram(ts, info);
        const proxy = (0, utils_1.setupProxy)(info);
        (0, utils_1.log)(info, 'Plugin initialized');
        proxy.getSemanticDiagnostics = function (filePath) {
            const strictFile = new PluginStrictFileChecker_1.PluginStrictFileChecker(info).isFileStrict(filePath);
            if (strictFile) {
                return inMemoryProgram.getSemanticDiagnostics(filePath);
            }
            else {
                return info.languageService.getSemanticDiagnostics(filePath);
            }
        };
        return proxy;
    }
    return { create };
};
module.exports = init;
