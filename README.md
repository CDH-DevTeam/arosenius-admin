# The Arosenius archive admin system

This repository holds the source code for the administrativ system for the Ivar Arosenius archive. The system runs on the client and is written in Backbone.js.

The admin system communicates to the server via the [Arosenius API](https://github.com/CDH-DevTeam/arosenius-api).

## Setup

There is no build step, but you need to create `js/config.js` along the lines of:

```js
define(function (require) {
  return {
    apiUrl: "http://api.example.com/admin",
    publicApiUrl: "http://api.example.com"
  };
});
```

## Users

Users are defined in the `users.js` file of the [Arosenius API](https://github.com/CDH-DevTeam/arosenius-api). All users have the same privileges.
