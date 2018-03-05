var fs = require("fs");
var path = require("path");
var hasOwnProperty = Object.prototype.hasOwnProperty;


module.exports = function getPresetOptions(node, packagePath)
{
    var packageJSON = require(packagePath);
    var hasGenericJSX = hasDependency("generic-jsx", packageJSON);
    var hasReact = hasDependency("react", packageJSON);

    return { node: node, "generic-jsx": hasGenericJSX, "react": hasReact };
}

function hasDependency(dependency, packageJSON)
{
    if (hasPath(["isomorphic", dependency], packageJSON))
        return packageJSON.isomorphic[dependency];

    return  hasPath(["dependencies", dependency], packageJSON) ||
            hasPath(["peerDependencies", dependency], packageJSON);
}

function hasPath(path, object)
{
    return !!path.reduce(function (parent, key)
    {
        if (!parent)
            return false;
        
        if (!hasOwnProperty.call(parent, key))
            return false;

        return parent[key] || { };
    }, object);
}
