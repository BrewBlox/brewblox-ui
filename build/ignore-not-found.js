/*
 * For performance reasons, TS code is compiled with the transpileOnly flag
 * At that point, interfaces no longer exist, and warnings are generated for interfaces
 * imported from typing files.
 *
 * Any actual import issues during compilation are reported as errors, so we want to skip the warnings.
 *
 * Code copied from https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-390889335
 * date: 2019/12/18
*/

const ModuleDependencyWarning = require('webpack/lib/ModuleDependencyWarning');

module.exports = class IgnoreNotFoundExportPlugin {
  apply(compiler) {
    const messageRegExp = /export '.*'( \(reexported as '.*'\))? was not found in/;
    function doneHook(stats) {
      stats.compilation.warnings = stats.compilation.warnings.filter(function (warn) {
        if (warn instanceof ModuleDependencyWarning && messageRegExp.test(warn.message)) {
          return false;
        }
        return true;
      });
    }
    if (compiler.hooks) {
      compiler.hooks.done.tap('IgnoreNotFoundExportPlugin', doneHook);
    } else {
      compiler.plugin('done', doneHook);
    }
  }
};
