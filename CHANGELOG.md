# Change Log

## 1.0.3 (2015-12-3)

**Bug fixes:**

* Fixed [issue #16](https://github.com/nordnet/cordova-hot-code-push-cli/issues/16).
* Fixed [issue #18](https://github.com/nordnet/cordova-hot-code-push-cli/issues/18).
* Fixed [issue #17](https://github.com/nordnet/cordova-hot-code-push-cli/issues/17).

**Enchancements:**

* Merged [pull request #21](https://github.com/nordnet/cordova-hot-code-push-cli/pull/21). Thanks to [@andreialecu](https://github.com/andreialecu) build can be deployed to frankfurt aws region.

**Docs:**

* Added `Default configuration file` section in the readme.

## 1.0.2 (2015-10-26)

**Bug fixes:**

- Fixed [issue #10](https://github.com/nordnet/cordova-hot-code-push-cli/issues/10). Now ignored files will not trigger update request.
- Fixed [issue #5](https://github.com/nordnet/cordova-hot-code-push-cli/issues/5) thanks to [@Sirikon](https://github.com/Sirikon). Merged his [pull request #12](https://github.com/nordnet/cordova-hot-code-push-cli/pull/12).
- Fixed [issue #8](https://github.com/nordnet/cordova-hot-code-push-cli/issues/8). Hidden files are now ignored by `build` and `server` commands. They are not gonna break the update procedure.

**Enchancements:**

- For `build`, `deploy` and `server` commands you can now specify path to your web project's directory. If not defined - `www` is used, as before. Fixes [issue #6](https://github.com/nordnet/cordova-hot-code-push-cli/issues/6) and [issue #7](https://github.com/nordnet/cordova-hot-code-push-cli/issues/7).

**Docs:**

- Updated documentation according to the changes.

## 1.0.1 (2015-09-08)

- Added change log file.
- Removed unused dependencies.
- Updated readme file.
