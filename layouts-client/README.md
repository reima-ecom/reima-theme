# Client css and js

Directory structure should mimic the `layouts` directory. However, layouts that have own JS entry points are in the root of `src`. So this is more of a guideline than a rule.

Files and folders starting with a dot (`.`) are helpers or dependencies that do not have a corresponding layout file.

JS entry points are built with `rollup` to the `public` directory.

CSS files should be used as assets (resources) in the corresponding layouts.