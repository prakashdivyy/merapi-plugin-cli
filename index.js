"use strict";

const esprima = require("esprima");
const getfn = require("./lib/getfn");
const yargs = require("yargs");
const _ = require("lodash");
const createAction = require("./lib/helper");

module.exports = function (merapi) {

    return {
        apps: [],

        typeCli(name, opt) {
            this.apps.push(name);
            return function* (config, injector, logger) {
                let app = {};

                let getFn = getfn(injector);

                opt.config = opt.config || "commands";
                let cfg = config.default(opt.config, {});

                for (let key in cfg) {
                    let data = cfg[key];
                    if (data.type === "group") {
                        let sc = {};
                        for (let subcommand in data.subcommands) {
                            sc[subcommand] = Object.assign({}, data.subcommands[subcommand]);
                            sc[subcommand].handler = yield injector.resolveMethod(sc[subcommand].handler);
                            if (sc[subcommand].args) {
                                sc[subcommand].arguments = _.filter(esprima.tokenize(sc[subcommand].args), function (o) { return o.type === "Identifier"; });
                            }
                        }
                        yargs.command(key, data.desc, (yargs) => {
                            yargs.demandCommand(1);
                            for (let c in sc) {
                                let cmd = sc[c].args ? `${c} ${sc[c].args}` : `${c}`;
                                createAction(yargs, cmd, sc[c]);
                            }
                        })
                    } else {
                        data.handler = yield injector.resolveMethod(data.handler);
                        if (data.args) {
                            data.arguments = _.filter(esprima.tokenize(data.args), function (o) { return o.type === "Identifier"; });
                        }
                        let cmd = data.args ? `${key} ${data.args}` : `${key}`;
                        createAction(yargs, cmd, data);
                    }
                }

                app.start = function () {
                    let argv = yargs.command("version", "Show CLI version", (yargs) => { }, (yargs) => {
                        console.log(config.default("version", "0.0.1"));
                    }).version(false).demandCommand(1, '').showHelpOnFail(true).strict().argv;
                    if (!argv._[0]) {
                        yargs.help();
                    }
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