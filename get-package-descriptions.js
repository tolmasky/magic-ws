var fs = require("fs");
var path = require("path");


module.exports = function getPackageDescriptions(source)
{
    return getPackageDescriptionsAsArray(source, true)
        .reduce(function (descriptions, description)
        {
            descriptions[description.name] = description;

            return descriptions;
        }, Object.create(null));
}

function getPackageDescriptionsAsArray(source, mayContainScopedPackages, prefix)
{
    var children = fs.readdirSync(source)
        .map(function (name)
        {
            if (name.charAt(0) === ".")
                return [];

            var fullPath = path.join(source, name);

            if (name.charAt(0) !== "@")
            {
                var name = prefix ? prefix + "/" + name : name;
                var packagePath = path.join(fullPath, "package.json");

                try { fs.statSync(packagePath) }
                catch (e) { return []; }

                return { name: name, path: packagePath };
            }

            if (!mayContainScopedPackages)
                return [];

            return getPackageDescriptionsAsArray(fullPath, false, name);
        });

    return [].concat.apply([], children);
}
