"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const core = __importStar(require("@actions/core"));
function getConfig() {
    return {
        url: core.getInput('url'),
        storage: core.getInput('storage'),
        gh_pages_branch: core.getInput('gh_pages_branch'),
        gh_pages_url: core.getInput('gh_pages_url'),
        git_username: core.getInput('git_username'),
        git_email: core.getInput('git_email'),
        fragmentation_strategy: core.getInput('fragmentation_strategy'),
        fragmentation_page_size: parseInt(core.getInput('fragmentation_page_size')),
        datasource_strategy: core.getInput('datasource_strategy')
    };
}
exports.getConfig = getConfig;
