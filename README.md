# Magic Workspaces

Magic Workspaces are kind of like [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/)
or [Lerna](https://github.com/lerna/lerna) but completely **dynamic** and **configuration-free**.
They're great if you've ever had to link in a package you're actively editing, swap in testing mocks,
and much more. Chances are at some point you'e been frustrated with some aspect of node's module system
during development, and Magic Workspaces may have very well been able to bail you out!

## Getting Started

You can grab `magic-ws` from npm:

```bash
$ npm install magic-ws -g
```

The fundamental primitive in `magic-ws` is the package hot-swap:

```bash
# /path/to/my-package will be used in place of package in my-app
$ magic-ws -p /path/to/my-package node my-app
```

`magic-ws` uses the `name` property in the `package.json` so it doesn't matter what the package's
enclosing folder name is. The best part is, your original package remains **completely unchanged**.
It's trivial to compare the differences in behavior by just running your code with and without
the `magic-ws` prefix. So, when might you want to use this?

## Swap in your own fork when debugging a dependency

Have you ever found a bug in a dependency and wanted to either debug it or fix it? Lerna won’t be
helpful here unless the dependency is part of your mono-repo, and most other solutions
involve actually mutating your node_modules folder with npm-link or worse, throwing up your hands 
and editing the files in `node_modules` directly. **Don't do that!** `magic-ws` makes doing things
the right way just as easy. Just clone the module and point to it:


```bash
$ git clone git://github.com/third-party/buggy-package /path/to/buggy-package
$ magic-ws -p /path/to/buggy-package node my-app
```

## Solve the annoying requiring yourself conundrum when testing

Yup, you can just "hot-swap" in yourself so that tests can just do require("my-package") instead of
`require("../../..")`. You can make things even easier by putting `magic-ws tests/` straight into
your `package.json` so `npm test` just works.


```bash
# Just use . (ourselves) for the package.
$ magic-ws -p . npm test
```

## Hot-swap in mocks for your tests

Say you have a bunch of mock modules you regularly use for testing. Instead of injecting them in
manually, you could just swap them in so that the code can remain agnostic:

```bash
$ magic-ws -p ./tests/mocks/* npm test
```

Now every package in `./test/mocks/` will be used in place of the real ones. Just make sure their names
match in the `package.json` and that's all there is to it.

## Create Lerna-like Workspaces without the configuration

As you probably picked up above, you can use globs to easily swap in entire collections of packages.
But we also provide the `-w` (or `--workspace`) flag to make this use case more explicit:

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
