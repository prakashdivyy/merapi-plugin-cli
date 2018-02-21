"use strict";

const esprima = require("esprima");
const getfn = require("./lib/getfn");
const yargs = require("yargs");

module.exports = function (merapi) {

    return {
        apps: [],

        typeCli(name, opt) {
            this.apps.push(name);
            return function* (config, injector, logger) {
                let app;

                let getFn = getfn(injector);

                opt.config = opt.config || "commands";

                app.start = function () {
                    yargs.argv;
                };

                return app;
            };
        },

        *onStart() {
            for (let i = 0; i < this.apps.length; i++) {
                let app = yield merapi.resolve(this.apps[i]);
                app.start();
            }
        }
    };
};