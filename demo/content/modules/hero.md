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
  type: Image
- template: hero
  heading: Mobile image
  text: Use a separate image for mobile if needed; make button CTA if needed
  link: "#"
  linktext: Buy now
  linkmodifier: cta
  image: hero.jpg
  overlayinvert: true
  imagemobile: hero-mobile.jpg
  type: Image
- template: hero
  heading: Small details that make a big difference
  link: "#"
  linktext: Shop originals
  image: category-hero-16x9.jpg
  imagemobile: category-hero-mobile.jpg
  overlayhorizontal: right
  overlaysmall: true
  type: Image
- template: hero
  image: hero-sneakers.jpg
  heading: Image can be full-width
  link: "/collections/sneakers"
  linktext: Shop sneakers
  overlayhorizontal: right
  fullwidth: true
  type: Image
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
  type: Image
- template: hero
  heading: Mobile overlay can be right aligned and desktop left...
  overlaysmall: true
  image: hero.jpg
  overlayinvert: true
  imagemobile: hero-mobile.jpg
  overlaymobile: right
  overlayhorizontal: left
  overlayalign: left
  type: Image
- template: hero
  image: "/befunky-collage.jpg"
  heading: Add a background to the overlay if needed
  text: "**Add markdown** to the text if you want. From the beach, to the snow, and
    everything in between!"
  overlayinvert: true
  overlaybg: true
  type: Image
- template: hero
  type: Youtube Video
  youtubeid: lJIrF4YjHfQ
  youtubeautoplay: false
  youtubenocontrols: true
  youtubeloop: true
  overlaybg: true
  heading: You can add a youtube video as the hero background
  text: But be careful with text content, since (at least) Firefox by default disables
    autoplay!
- template: hero
  type: Vimeo Video
  vimeoid: 459323817
  vimeobg: false
- template: hero
  heading: Vertical alignment top
  overlayvertical: top
  image: hero.jpg
  overlayinvert: true
  type: Image
- template: hero
  heading: Vertical alignment bottom
  text: "... as well as narrow container"
  narrow: true
  overlayvertical: bottom
  image: hero.jpg
  overlayinvert: true
  type: Image
- template: hero
  image: "/befunky-collage.jpg"
  heading: Add a *yellow text* to the overlay with a background
  text: "***Add yellow bold*** to the text if you want"
  yellow_emphasis: true
  overlaymobile: show
  overlayinvert: true
  overlaybg: true
  type: Image
title: Hero demo

---
# Hero

Hero component is usually contained withing the page max width, but can occasionally span the entire width of the screen. If contained within the page width, the hero still fills the entire viewport on smaller screen sizes (tablet portrait and mobile).

On mobile, the overlay is usually disabled and the content is displayed below the image/video. Occasionally, the overlay can be enabled for mobile as well.

It consists of a background element, which can be a static image or an embedded video (not supported yet), and the overlaying content. The overlaying content can currently be aligned to center (default), right or left.

Furthermore, the (text) content of the overlay can be justified to left, right or center.

The image used is cropped to 1:1 on mobile using a best guess of the focal point of the image. If needed, the image for mobile can be cropped and set manually. For desktop 2:1 aspect ratio should be used.

To make the content stand out, it should be possible to set a transparent overlay between the image and the content (not supported yet).
