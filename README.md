Composite Builder
=================

A tool for building composite graphics. https://abcnews.github.io/composite-builder/

Developing
----------

Clone this project and use [Aunty](https://github.com/abcnews/aunty) to run a local server using `aunty serve`. 

Releasing
---------

The Composite Builder is now hosted on [GitHub Pages](https://abcnews.github.io/composite-builder/), so don't use aunty's `deploy` or `release` commands. Instead, do the following:

1. Build the project with `aunty build`
2. Commit the changes to `/docs`
3. Bump the major/minor/patch version with `npm version {major|minor|patch}`
4. Push everything to to GitHub with `git push --all && git push --tags`

Authors
-------

- Colin Gourlay ([gourlay.colin@abc.net.au](mailto:gourlay.colin@abc.net.au))
- Joshua Byrd ([byrd.joshua@abc.net.au](mailto:byrd.joshua@abc.net.au))

Licence
-------
[MIT](https://github.com/abcnews/composite-builder/blob/master/LICENSE.md)
