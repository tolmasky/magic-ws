var Module = require("module");
var oldResolveLookupPaths = Module._resolveLookupPaths;


// We are modifying the lookup paths to behave as such:
// 0th:             [WORKSPACE] - These are overriden packages.
// 1st - (N-1)th:   [Standard Lookup Paths]
// Nth:             [resolveLookupPaths(root)] - These are simulated peer dependencies.

// FIXME: Should we *only* climb into known packages?
module.exports = function modifyResolveLookupPaths(workspace, rootPath)
{
    var root = { id:"///", paths: Module._nodeModulePaths(rootPath) };

    Module._resolveLookupPaths = function(request, parent, newReturn)
    {
        var result = oldResolveLookupPaths.apply(this, arguments);
        var rootResult = parent === root ? [] : 
            oldResolveLookupPaths.apply(this, [request, root, newReturn]);

        if (newReturn)
            return [workspace].concat(result || []).concat(rootResult);

        return [result[0], [workspace].concat(result[1]).concat(rootResult)];
    }
}
