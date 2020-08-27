---
layout: page
modules:
- template: hero
  heading: Hero component
  text: You can use **markdown** in the text
  link: "#"
  linktext: Shop originals
  image: hero.jpg
  overlayinvert: true
- template: hero
  heading: Mobile image
  text: Use a separate image for mobile if needed
  link: "#"
  linktext: Buy now
  image: hero.jpg
  overlayinvert: true
  imagemobile: hero-mobile.jpg
- template: hero
  heading: Small details that make a big difference
  link: "#"
  linktext: Shop originals
  image: category-hero-16x9.jpg
  imagemobile: category-hero-mobile.jpg
  overlayhorizontal: right
  overlaysmall: true
- template: hero
  image: hero-sneakers.jpg
  heading: Image can be full-width
  link: "/collections/sneakers"
  linktext: Shop sneakers
  overlayhorizontal: right
  fullwidth: true
- template: hero
  image: stayhome-banner-desktop.jpg
  imagemobile: stayhome-banner-mobile.jpg
  heading: Mobile overlay
  text: Overlay can be enabled on mobile as well
  link: "#"
  linktext: Read more
  overlaymobile: left
  overlayhorizontal: center
  overlayalign: center
- template: hero
  heading: Mobile overlay can be right aligned and desktop left...
  overlaysmall: true
  image: hero.jpg
  overlayinvert: true
  imagemobile: hero-mobile.jpg
  overlaymobile: right
  overlayhorizontal: left
  overlayalign: left
- template: hero
  image: "/befunky-collage.jpg"
  heading: Add a background to the overlay if needed
  text: "**Add markdown** to the text if you want. From the beach, to the snow, and everything in between!"
  overlayinvert: true
  overlaybg: true
title: Hero demo

---
# Hero

Hero component is usually contained withing the page max width, but can occasionally span the entire width of the screen. If contained within the page width, the hero still fills the entire viewport on smaller screen sizes (tablet portrait and mobile).

On mobile, the overlay is usually disabled and the content is displayed below the image/video. Occasionally, the overlay can be enabled for mobile as well.

It consists of a background element, which can be a static image or an embedded video (not supported yet), and the overlaying content. The overlaying content can currently be aligned to center (default), right or left.

Furthermore, the (text) content of the overlay can be justified to left, right or center.

The image used is cropped to 1:1 on mobile using a best guess of the focal point of the image. If needed, the image for mobile can be cropped and set manually. For desktop 2:1 aspect ratio should be used.

To make the content stand out, it should be possible to set a transparent overlay between the image and the content (not supported yet).

## Data format / parameters

- `heading: string`: Heading to be used. Outputs an `h1` heading tag. Uses display font size on desktop.
- `text: string`: Outputs a `p` tag for text content.
- `link: string` and `linktext: string`: Button link parameters.
- `image: path`: Default image to use.
- `imagemobile: path`: Image to use on mobile if smart cropping is not suitable.
- `overlayinvert: boolean`: Make overlay text white.
- `overlayalign: center|left|right`: Justify overlay content (i.e. align overlay text).
- `overlayhorizontal: center|left|right`: Horizontal alignment of overlay element. If left or right, also limits the overlay width to half of the hero width.
- `overlaysmall: boolean`: Decrease overlay heading size to `h4` heading, and limit overlay width to one third of the hero.
- `fullwidth: boolean`: Do not limit hero width (i.e. usually span across the entire page).
- `overlaymobile: left|right`: Show overlay on mobile on this side of the image, limiting size to half the hero width.