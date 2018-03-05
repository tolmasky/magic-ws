var transformFileSync = require("babel-core").transformFileSync;
var fs = require("fs");
var Module = require("module");


module.exports = function (options)
{
    var normalized = options.map(function (options)
    {
        if (options.sources || options.source)
            return [toMatch(options.sources || options.source), options.options];

        if (options.match === false)
            return [never, options.options];

        if (!options.match)
            throw new Error("bootstrap/babel-register must either include match or source");

        return [options.match, options.options];
    });

    const original = Module._extensions[".js"];

    Module._extensions[".js"] = function (module, filename)
    {
        var found = normalized.find(function (pair)
        {
            return pair[0](filename);
        });

        if (!found) 
            return original(module, filename);

        var options = Object.assign({ ast: false }, found[1]);
        var transformed = transformFileSync(filename, options).code;

        return module._compile(transformed, filename);
    }
}

function never()
{
    return false;
}

function toMatch(source)
{
    var escaped = Array.isArray(source) ?
        source.map(escapeRegExp).join("|") : 
        escapeRegExp(source);

    var regexp = new RegExp("^(" + escaped + ")/(?!(.*/)?node_modules/)");

    return function (filename)
    {
        return regexp.test(filename);
    };
}

function escapeRegExp(string)
{
    return "(" + string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + ")";
}

