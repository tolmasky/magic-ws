var Module = require("module");

var fs = require("fs");
var path = require("path");
var spawnSync = require("child_process").spawnSync;


// We are modifying the lookup paths to behave as such:
// 0th:             [WORKSPACE] - These are overriden packages.
// 1st - (N-1)th:   [Standard Lookup Paths]
// Nth:             [resolveLookupPaths(root)] - These are simulated peer dependencies.

// FIXME: Should we *only* climb into known packages?
module.exports = function modifyResolveLookupPaths(packages)
{
    var oldResolveLookupPaths = Module._resolveLookupPaths;
    var mappings = getPackageMappings(packages);

    Module._resolveLookupPaths = function(request, parent, newReturn)
    {
        var result = oldResolveLookupPaths.apply(this, arguments);
        var firstCharacter = request.charAt(0);

        if (firstCharacter === "/" ||
            request.substr(0, 2) === "./" ||
            request.substr(0, 3) === "../")
            return result;

        var pathComponents = request.split(path.sep);
        var name = firstCharacter === "@" ?
            path.join(pathComponents[0], pathComponents[1]) :
            pathComponents[0];

        var mapping = mappings[name];
        var workspaceResult = mapping ? [mapping.path] : [];
        var rootResult = !process.mainModule ? [] :
            parent === process.mainModule ? [] :
            oldResolveLookupPaths.apply(this, [request, process.mainModule, newReturn]);

        if (newReturn)
            return workspaceResult.concat(result || []).concat(rootResult);

        return [result[0], workspaceResult.concat(result[1]).concat(rootResult[1])];
    }
}

function getPackageMappings(descriptions)
{
    return Object.keys(descriptions)
        .map(function (name)
        {
            var description = descriptions[name];
            var fullPath = description.path;

            var ending = "/" + name;
            var namedCorrectly = fullPath.substr(fullPath.length - ending.length) === ending;
            var scoped = description.scoped;

            if (namedCorrectly)
                return { name: name, path: getSearchPath(fullPath, scoped) };

            var checksum = getChecksum(description);
            var tmpPath = path.join(
                "/tmp/petrified-links/",
                checksum,
                (scoped ? path.dirname(name) : ""));
 
            spawnSync("mkdir", ["-p", tmpPath], { stdio: [0, 1, 2] });
    
            var linkPath = path.join(tmpPath, path.basename(name));

            if (!fs.existsSync(linkPath))
                fs.symlinkSync(fullPath, linkPath, "dir");

            return { name: name, path: getSearchPath(linkPath, scoped) };
        })
        .reduce(function (mappings, description)
        {
            mappings[description.name] = description;
            
            return mappings;
        }, Object.create(null));
}

function getSearchPath(fullPath, scoped)
{
    if (scoped)
        return path.dirname(path.dirname(fullPath));

    return path.dirname(fullPath);
}

function getChecksum(mapping)
{
    return require("crypto")
        .createHash("sha512")
        .update(JSON.stringify(mapping))
        .digest("base64")
        .replace(/\//g, "_");
}
