# Update forestry frontmatter

Updates frontmatter for forestry.io from a source directory to a target. Reads from `.forestry/front_matter` at the source and basically mirrors that into the same path at the target. However, the `pages` parameter in each frontmatter template file is preserved, because this is how forestry knows which frontmatter template to use for which file.

## Example usage

Copy frontmatter templates from `site/.forestry/front_matter` directory to `other-site/.forestry/front_matter`:

```bash
> npx update-forestry-frontmatter site other-site
```