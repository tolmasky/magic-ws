# Magic Workspaces

Magic Workspaces are a **dynamic** and **configuration-free** way of easily linking packages together.
Chances are at some point you've been frustrated with some aspect of node's module system during
development that Magic Workspaces could have solved. They're great if you've ever had to link in a
package you're actively editing, swap in testing mocks, and much more. You can think of Magic Workspaces
as [Lerna Workspaces](https://github.com/lerna/lerna) for code that's not in your mono repo.

## Getting Started

You can grab `magic-ws` from npm. Make sure to install it globally:

```bash
$ npm install magic-ws -g
```

The fundamental primitive in `magic-ws` is the package hot-swap (`-p`):

```bash
$ magic-ws -p /path/to/package node my-app
```

With the above command, anyone requiring "package" will get your custom version
found at `/path/to/package` instead the one it would normally find in `node_modules`.
Your app's folder structure remains **completely unchanged**, so it's trivial to 
compare the differences in behavior by just running your code with and without the
`magic-ws` command.

## Swap in your own fork when debugging a dependency

Have you ever found a bug in a dependency and wanted to either debug it or fix it?
Most solutions involve manually mutating your project with npm-link, or worse, 
throwing up your hands and editing the files in `node_modules` directly.
**Don't do that!** `magic-ws` makes doing things the right way just as easy.
Just clone the module and point to it:

```bash
$ git clone git://github.com/third-party/buggy-package /path/to/buggy-package
$ magic-ws -p /path/to/buggy-package node my-app
```

`magic-ws` uses the `name` property in the `package.json` so it doesn't actually
matter what the replacement package's enclosing folder name is.

## Solve the annoying requiring yourself conundrum when testing

Yup, you can just "hot-swap" in yourself so that tests can do `require("my-package")` instead of
`require("../../..")`:


```bash
# Make ourselves (.) available to tests.
$ magic-ws -p . npm test
```

You can make things even easier by putting `magic-ws node tests/` straight into your `package.json`
so `npm test` just works.

## Hot-swap in mocks for your tests

Say you have a bunch of mock modules you regularly use for testing. Instead of injecting them in
manually, you could just swap them in so that the code can remain agnostic:

```bash
$ magic-ws -p ./tests/mocks/* npm test
```

Now every package in `./test/mocks/` will be used in place of the real ones. Just make sure their names
match in the `package.json` and that's all there is to it.

## Create Lerna-like Workspaces without the configuration

You can use globs to easily swap in entire collections of packages, but we also provide the `-w` 
(or `--workspace`) flag to make this use case more explicit:

```bash
$ magic-ws -w ./my-mono-repo ./my-mono-repo/main-app
``` 

Now every package in `./my-mono-repo` will be "visible" to every other package in `./my-mono-repo`. The nice
part about this is that this is probably the closest you can get to sharing resources while still maintaining
package structures as close to what you'll be shipping to your users. All of `magic-ws`'s flags are repeatable,
so if you for example have many mono-repo's that contain shared packages you can test a main-app that makes use
of *all of them* without having to create an even larger mono-repo:

```bash
$ magic-ws -w ./mono-repo-one -w ./mono-repo-two ./main-app
``` 

Of course, Lerna handles much more than just linking packages together, so `magic-ws` can be a very useful tool
in tandem with Lerna (like in the multiple workspaces example above).

## Magic Workspaces form a Virtual Environment

`magic-ws` is very robust since it forms something akin to a virtual environment where these hot-swaps happen.
This means you can run **any** script that eventually calls into node and the swapping will still work (that's
why the `npm` example above worked). Additionally, if the node process `exec`s, `spawn`s, and `fork`s, those
too will keep the hot-swaps. Again, all this happens without actually mutating your code, so you could for
example run your code's test suite normally and with `magic-ws` in parallel.

## Support: Node 4 and Up

The only caveat is that in specificaly in Node 4 you can't use magic-ws for the node REPL. As of Node 5 this
works fine however. If there is a lot of desire for this feature it can be made to work. `magic-ws` can also
probably be made to work in Node 0.10.
