import * as importedGrunt from "grunt";

type IGrunt = typeof importedGrunt;

// TODO add .graphql generation to build and watch
const sourceFiles = [
  "src/server/**/*.ts",
  "src/server/*.graphql",
  "!src/client/**/*.ts",
  "!node_modules/**/*.ts",
  "!tmp/**",
  "!./*.ts",
];

const taskOrder = ["copy", "ts"];

module.exports = (grunt: IGrunt) => {
  grunt.initConfig({
    watch: {
      files: sourceFiles,
      tasks: taskOrder,
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ["src/server/*.graphql"],
            dest: "dist/server/",
          },
        ],
      },
    },
    ts: {
      default: {
        tsconfig: "./tsconfig.server.json",
      },
    },
  });
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-ts");
  grunt.registerTask("default", taskOrder);
};
