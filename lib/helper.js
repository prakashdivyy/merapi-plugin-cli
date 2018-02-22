"use strict";

const createAction = function (yargs, command, subcommand) {
    let description = subcommand.desc ? subcommand.desc : "";
    yargs.command(command, description, (yargs) => {
        if (subcommand.params) {
            for (let p in subcommand.params) {
                let params = subcommand.params[p];
                let opt = {
                    type: params.type,
                    describe: params.desc,
                };
                if (params.short) {
                    opt.alias = params.short;
                }
                yargs.option(p, params);
            }
        }
    }, (yargs) => {
        let args = [];
        if (subcommand.arguments) {
            for (let arg of subcommand.arguments) {
                args.push(yargs[arg.value]);
            }
        }
        subcommand.handler(...args);
    });
};

module.exports = createAction;