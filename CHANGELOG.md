# Changelog

## [0.6.0-0]

* Fixed a mistake distinguishing between Blob and ArrayBuffer
* Updated documentation

## [0.5.0-0]

* Changed exports
* Renamed methods to be more clear

## [0.4.0-0]

* Restructured code

### Added

* Support for multiple clients

## [0.3.0-0] - 2018-02-01

### Added

* `options.fold`, to fold an action to `string` or `ArrayBuffer`
* return falsy to not folding the action to Web Socket
* by default, fold will `JSON.stringify` the action if `meta.send` set to `true` or the Web Socket
* `options.unfold`, to unfold a message to action
* return falsy to not unfolding the message
* the unfolded action must be FSA-compliant
* by default, `unfold` will add `meta.webSocket`
* `send` meta will only match against `true` or the Web Socket, but not `options.namespace`
* this behavior can be changed by overriding `options.fold`

## [0.2.0-0] - 2018-01-25

### Added

* Action `meta` property now include `webSocket`

## [0.1.0-1] - 2017-12-31

## [0.1.0-0] - 2017-12-30

## 0.0.1-0 - 2017-12-29

### Added

* Initial public release
