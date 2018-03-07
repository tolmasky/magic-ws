var path = require("path");
var getPackageDescriptions = require("./get-package-descriptions");

var options = require("commander")
    .usage("magic-ws [commands]")
    .option("-w, --workspace [workspace]", "Workspace location", collect, [])
    .option("-p, --package [package]", "Package location", collect, [])
    .option("-b, --babel", "Turn on automatic Babel transpilation")
    .parse(getBootstrappedArgv());

var cwd = process.cwd();
var workspaces = options.workspace;
var packages = options.package;
var descriptions = getPackageDescriptions(workspaces, packages);

require("./modify-resolve-lookup-paths")(descriptions);

if (options.babel)
{
    try
    {
        var presetPath = require.resolve("@isomorphic/babel-preset");
        var node = process.versions.node;
        var registrations = require("./get-registrations")(node, descriptions, presetPath);

        require("./babel-register")(registrations);
    }
    catch (e)
    {
        throw new Error("--babel is not yet supported.");
    }
}

function resolve(relative)
{
    return path.resolve(cwd, relative);
}

function collect(val, memo)
{
    memo.push(val);
    return memo;
}

function getBootstrappedArgv()
{
    var bootstrapArgs = process.env["MAGIC_WS_BOOTSTRAP_ARGS"];
    var bootstrapArgv = [process.argv0, __filename];
    var index = 0;

    while (index < bootstrapArgs.length)
    {
        var semicolon = bootstrapArgs.indexOf(";", index);
        var length = +bootstrapArgs.substring(index, semicolon);
    
        bootstrapArgv.push(bootstrapArgs.substr(semicolon + 1, length));
        index = semicolon + length + 1;
    }
    
    return bootstrapArgv;
}
