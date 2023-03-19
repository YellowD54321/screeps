module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    copy: {
      nestedFolders: {
        cwd: "src/",
        src: ["*/*.js"],
        // dest: "/",
        expand: true,
        rename: function (dest, src) {
          // Change the path name utilize underscores for folders
          return src.replace(/\//g, "_");
        },
        options: {
          process: function (content, srcpath) {
            return content.replaceAll("../", "");
          },
        },
      },
      main: {
        expand: true,
        cwd: "src/",
        src: ["*.js"],
        // dest: "/",
        options: {
          process: function (content, srcpath) {
            const reg = /require\(.\.\/(.*)/g;
            const requireArray = content.match(reg);

            if (!requireArray) {
              return content;
            }

            let result = content;
            for (const originString of requireArray) {
              const firstSlashIndex = originString.indexOf("/");

              if (firstSlashIndex < 0) {
                continue;
              }

              const headSting = originString.slice(0, firstSlashIndex + 1);
              const subString = originString.slice(firstSlashIndex + 1);
              const replaceString = subString.replaceAll("/", "_");
              result = result.replace(originString, headSting + replaceString);
            }
            return result;
          },
        },
        // ext: ".min.js",
        // extDot: "first",
      },
    },
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  // grunt.loadNpmTasks("grunt-contrib-uglify");
  // grunt.loadNpmTasks("grunt-contrib-concat");

  grunt.registerTask("default", ["copy"]);
};
