module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    copy: {
      nestedFolders: {
        cwd: "src/",
        src: ["**/*.js"],
        // dest: "/",
        expand: true,
        rename: function (dest, src) {
          // Change the path name utilize underscores for folders
          return src.replace(/\//g, "_");
        },
        options: {
          process: function (content, srcpath) {
            const pathArray = srcpath.split("/").slice(1).slice(0, -1);
            const reg = /require\(.*/g;
            const requireArray = content.match(reg);

            if (!requireArray) {
              return content;
            }

            let result = content;
            for (const requireString of requireArray) {
              const requirePath = requireString.match(/(?:'|")(.*)(?:'|")/)[1];

              if (requirePath.includes("../")) {
                const requirePathArray = requirePath.split("/");
                const relativePathArray = requirePathArray.filter(
                  (item) => item === ".."
                );

                const prefixArray = pathArray.slice(
                  0,
                  pathArray.length - relativePathArray.length
                );

                const resultArray = [
                  ...prefixArray,
                  ...requirePathArray,
                ].filter((item) => item !== "..");
                const resultString = resultArray.join("_");

                // so bad, but optimize this in the future
                const replaceString = requireString.replace(
                  /(?:'|").*(?:'|")/,
                  '"./' + resultString + '"'
                );
                result = result.replace(requireString, replaceString);
              } else {
                const firstSlashIndex = requireString.indexOf("./");

                if (firstSlashIndex < 0) {
                  continue;
                }

                const headSting = requireString.slice(0, firstSlashIndex + 2);
                const subString = requireString.slice(firstSlashIndex + 2);
                const replaceString =
                  pathArray.join("_") + "_" + subString.replaceAll("/", "_");

                result = result.replace(
                  requireString,
                  headSting + replaceString
                );
              }
            }
            return result;
          },
        },
      },
      main: {
        expand: true,
        cwd: "src/",
        src: ["*.js"],
        options: {
          process: function (content, srcpath) {
            const reg = /require\(.\.\/(.*)/g;
            const requireArray = content.match(reg);

            if (!requireArray) {
              return content;
            }

            let result = content;
            for (const requireString of requireArray) {
              const firstSlashIndex = requireString.indexOf("/");

              if (firstSlashIndex < 0) {
                continue;
              }

              const headSting = requireString.slice(0, firstSlashIndex + 1);
              const subString = requireString.slice(firstSlashIndex + 1);
              const replaceString = subString.replaceAll("/", "_");
              result = result.replace(requireString, headSting + replaceString);
            }
            return result;
          },
        },
      },
    },
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.registerTask("default", ["copy"]);
};
