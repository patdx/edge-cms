# edge-cms

Goal: Build a simple CMS that could be hosted on cloudflare workers/pages.

- Schema defined in typeorm format(?)
- Convert to database

### node compat

```
            "path": require.resolve("path-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "domain": require.resolve("domain-browser"),
            "stream": require.resolve("stream-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "constants": require.resolve("constants-browserify"),
            "timers": require.resolve("timers-browserify"),

            //Some modules that don't have browser versions are replaced with a blank file.
            //This, of course, breaks some functionality; fortunately for my project this
            //wasn't an issue
            "module": require.resolve("./blank.js"),
            "fs": require.resolve("./blank-fs.js"),
            "tty": require.resolve("./blank.js"),
```
