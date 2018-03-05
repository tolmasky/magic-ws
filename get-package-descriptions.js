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

function getPackageDescriptionsAsArray(source, mayContainPackages)
{
    var children = fs.readdirSync(source)
        .map(function (filename)
        {
            if (filename.charAt(0) === ".")
                return [];

            var fullPath = path.join(source, filename);
            var packagePath = path.join(fullPath, "package.json");

            try { var name = require(packagePath).name; }
            catch (e)
            {
                if (!mayContainPackages)
                    return [];

                return getPackageDescriptionsAsArray(fullPath, false);
            }

            var scoped = name.charAt(0) === "@";

            return { scoped: scoped, name: name, path: fullPath, packagePath: packagePath };
        });

    return [].concat.apply([], children);
}
