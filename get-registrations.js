var fs = require("fs");
var path = require("path");

var getPresetOptions = require("./get-preset-options");


module.exports = function getRegistrations(targetNodeVersion, packageDescriptions, presetPath)
{
    var registrationsByKey = Object.keys(packageDescriptions)
        .reduce(function toRegistrations(registrations, name)
        {
            // Easier to just always skip this for now.
            if (name === "@isomorphic/babel-preset" || name === "generic-jsx")
                return registrations;

            var description = packageDescriptions[name];
            var fullPath = description.path;
            var options = getPresetOptions(targetNodeVersion, description.packagePath);
            var key = JSON.stringify(options);
            var babelOptions = { presets: [ [presetPath, options ] ] };

            if (!registrations[key])
                registrations[key] = { sources: [fullPath], options: babelOptions };
            else
                registrations[key].sources.push(fullPath);

            return registrations;
        }, Object.create(null));

    return Object.keys(registrationsByKey)
        .map(function (key) { return registrationsByKey[key] });
}
