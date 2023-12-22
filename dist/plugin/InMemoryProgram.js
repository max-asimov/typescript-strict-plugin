"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryProgram = void 0;
/**
 * djb2 hashing algorithm
 * http://www.cse.yorku.ca/~oz/hash.html
 */
function generateDjb2Hash(data) {
    let acc = 5381;
    for (let i = 0; i < data.length; i++) {
        acc = (acc << 5) + acc + data.charCodeAt(i);
    }
    return acc.toString();
}
class InMemoryProgram {
    constructor(_ts, info) {
        this._ts = _ts;
        this.info = info;
        this.host = undefined;
        this.program = undefined;
    }
    getSourceFile(fileName, languageVersionOrOptions) {
        var _a;
        // Assume the file is canonicalized and absolute.
        const path = fileName;
        let sourceFile = this.info.project.getSourceFile(path);
        // This case occurs when trying to resolve .d.ts outputs of project references.
        if (!sourceFile && languageVersionOrOptions) {
            sourceFile = (_a = this.host) === null || _a === void 0 ? void 0 : _a.getSourceFile(fileName, languageVersionOrOptions);
            if (sourceFile) {
                // SemanticDiagnosticBuilder requires that the file has a version.
                // We use the same hashing function that is used in the TypeScript repo as fallback.
                sourceFile.version = generateDjb2Hash(sourceFile.text);
            }
        }
        return sourceFile;
    }
    getSemanticDiagnostics(filePath) {
        const currentProgram = this.info.languageService.getProgram();
        if (!currentProgram) {
            return this.info.languageService.getSemanticDiagnostics(filePath);
        }
        const rootFiles = [...currentProgram.getRootFileNames()];
        const options = { ...currentProgram.getCompilerOptions(), strict: true };
        this.host = this._ts.createCompilerHost(options);
        const compilerHost = {
            ...this.host,
            // Assume we can ignore the other arguments to these function.
            getSourceFile: (fileName, languageVersionOrOptions) => this.getSourceFile(fileName, languageVersionOrOptions),
            getSourceFileByPath: (fileName, path, languageVersionOrOptions) => this.getSourceFile(fileName, languageVersionOrOptions),
        };
        const configFileParsingDiagnostics = currentProgram.getConfigFileParsingDiagnostics();
        const projectReferences = currentProgram.getProjectReferences();
        // Always create a new program since we assume the file has changed if diagnostics are requested.
        this.program = this._ts.createSemanticDiagnosticsBuilderProgram(rootFiles, options, compilerHost, this.program, configFileParsingDiagnostics, projectReferences);
        const strictDiags = this.program.getSemanticDiagnostics(this.getSourceFile(filePath));
        // Assume the diagnostics won't be mutated.
        return strictDiags;
    }
}
exports.InMemoryProgram = InMemoryProgram;
