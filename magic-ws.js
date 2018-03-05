var path = require("path");

var options = require("commander")
    .usage("magic-ws [commands]")
    .option("-w, --workspace", "Workspace location")
    .option("--no-babel", "Turn off automatic Babel transpilation")
    .parse(process.argv);

var cwd = process.cwd();
var workspace = path.resolve(cwd, options.workspace || ".");
var packages = require("./get-package-descriptions")(workspace);
Error.stackTraceLimit = 10000;
console.log(
    "Running `" + "node" + " " + process.argv[2] + " [...] ` " +
    "by overriding the following packages: \n    " + Object.keys(packages).join("\n    ") + "\n")

//if (options.babel && packages["@isomorphic/preset"])
//    require("../@isomorphic/preset");

const relativeEntrypoint = process.argv.splice(2, 1)[0];
const absoluteEntrypoint = path.resolve(cwd, relativeEntrypoint);

require("./modify-resolve-lookup-paths")(workspace, absoluteEntrypoint, packages);

if (options.babel)
{
    var presetPath = require.resolve("@isomorphic/babel-preset");
    var node = process.versions.node;
    var registrations = require("./get-registrations")(node, packages, presetPath);
console.log("REGISTRATIONS: ", registrations);
    require("./babel-register")(registrations);
}

require(absoluteEntrypoint);
