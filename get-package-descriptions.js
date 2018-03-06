var fs = require("fs");
var path = require("path");
var cwd = process.cwd();
var globSync = require("fast-glob").sync;
var isGlob = require("is-glob");


module.exports = function getPackageDescriptions(workspaces, packages)
{
    var fromWorkspaces = pipe(
        flatMap(glob(false)),
        flatMap(readdir),
        flatMap(getPackageDescription(true)))(workspaces);
    var fromPackages = pipe(
        flatMap(glob(true)),
        flatMap(getPackageDescription(false)))(packages);

    return fromWorkspaces
        .concat(fromPackages)
        .reduce(function (descriptions, description)
        {
            descriptions[description.name] = description;

            return descriptions;
        }, Object.create(null));
}

function pipe()
{
    var fs = arguments;

    return function pipe(input)
    {
        var index = 0;
        var count = fs.length;
        
        for (; index < count; ++index)
            input = fs[index](input);

        return input;
    }
}

function flatMap(f)
{
    return function (array)
    {
        return [].concat.apply([], array.map(f));
    }
}

function readdir(directory)
{
    return fs.readdirSync(directory).map(function (filename)
    {
        return path.join(directory, filename);
    });
}

function glob(justPackages)
{
    return function (pattern)
    {
        if (!isGlob(pattern))
            return [path.resolve(cwd, pattern)];

        var options = { absolute: true, onlyDirectories: true };
        var results = globSync(pattern, options);

        if (!justPackages)
            return results;

        return results
            .filter(function (path)
            {
                return getPackageName(path) !== void(0);
            });
    }
}

function getPackageDescription(ignoreNonPackage)
{
    return function (fullPath)
    {
        if (path.basename(fullPath).charAt(0) === ".")
            return nothingOrThrow(ignoreNonPackage, fullPath);

        if (!fs.statSync(fullPath).isDirectory())
            return nothingOrThrow(ignoreNonPackage, fullPath);

        var packagePath = path.join(fullPath, "package.json");
        var name = getPackageName(fullPath);

        if (typeof name === "undefined")
            return nothingOrThrow(ignoreNonPackage, fullPath);

        var scoped = name.charAt(0) === "@";

        return { scoped: scoped, name: name, path: fullPath, packagePath: packagePath };
    };
}

function getPackageName(fullPath)
{
    try
    {
        return require(path.join(fullPath, "package.json")).name;
    }
    catch (e) { }
}

function nothingOrThrow(ignore, path)
{
    if (ignore)
        return [];

    throw new Error(path + " is not a valid node package.");
}
