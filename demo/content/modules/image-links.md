---
layout: page
modules:
- template: image-links
  heading: Hot right now
  horizontal: left
  vertical: top
  align: left
  small: true
  cards:
  - heading: One step ahead
    text: Meet our new colorful sneakers
    image: "/hot-sneakers.jpg"
    linktext: Buy now
    link: "/"
  - heading: SS20
    text: Meet our fresh new patterns
    image: "/whats-hot-01.jpg"
    linktext: Buy now
    link: "/"
- template: image-links
  colorinvert: true
  cards:
  - heading: Infant outdoor clothing
    image: "/infants.jpg"
    imagemobile: "/infants-square.jpg"
  - heading: Toddler outdoor clothing
    image: "/toddlers.jpg"
    imagemobile: "/toddlers-square.jpg"
    link: "#"
  - heading: Kids outdoor clothing
    image: "/kids.jpg"
    imagemobile: "/kids-square.jpg"
    link: "#"
    linktext: Buy now
- template: image-links
  colorinvert: true
  horizontal: right
  vertical: bottom
  small: true
  columnstablet: ''
  columnsdesktop: '4'
  cards:
  - heading: Infant outdoor clothing
    image: "/infants-square.jpg"
    link: "#"
  - heading: Toddler outdoor clothing
    image: "/toddlers-square.jpg"
    link: "#"
  - heading: ''
    image: "/kids-square.jpg"
    link: "#"
    text: This card only has some text
  - heading: Kids outdoor clothing
    image: "/purpose-beach.jpg"
    link: "#"
- template: image-links
  colorinvert: true
  columnstablet: ''
  cards:
  - heading: Infant outdoor clothing
    image: "/infants.jpg"
    imagemobile: "/infants-square.jpg"
    link: "#"
  - heading: Toddler outdoor clothing
    image: "/toddlers.jpg"
    imagemobile: "/toddlers-square.jpg"
    link: "#"
  - heading: Kids outdoor clothing
    image: "/kids.jpg"
    imagemobile: "/kids-square.jpg"
    link: "#"
    linktext: Buy now
- template: image-links
  colorinvert: true
  horizontal: right
  vertical: bottom
  small: true
  columnstablet: '2'
  columnsdesktop: '4'
  carousel_enabled: true
  carousel_dots: true
  carousel_arrows: false
  carousel_autoplay: true
  carousel_autoplay_speed:
  cards:
  - heading: Infant outdoor clothing
    image: "/infants-square.jpg"
    link: "#"
  - heading: Toddler outdoor clothing
    image: "/toddlers-square.jpg"
    link: "#"
  - heading: Kids outdoor clothing
    image: "/kids-square.jpg"
    link: "#"
    linktext: Buy now
  - heading: Kids outdoor clothing
    image: "/purpose-beach.jpg"
    link: "#"
    linktext: Buy now
  - heading: Infant outdoor clothing
    image: "/infants-square.jpg"
    link: "#"
  - heading: Toddler outdoor clothing
    image: "/toddlers-square.jpg"
    link: "#"
  - heading: Kids outdoor clothing
    image: "/kids-square.jpg"
    link: "#"
    linktext: Buy now
  - heading: Kids outdoor clothing
    image: "/purpose-beach.jpg"
    link: "#"
    linktext: Buy now
- template: image-links
  colorinvert: true
  horizontal: right
  vertical: bottom
  small: true
  columnstablet: 
  columnsdesktop: 
  carousel_enabled: true
  carousel_dots: true
  carousel_arrows: false
  carousel_autoplay: true
  carousel_autoplay_speed: 15000
  cards:
  - heading: Infant outdoor clothing
    image: "/infants-square.jpg"
    link: "#"
  - heading: Toddler outdoor clothing
    image: "/toddlers-square.jpg"
    link: "#"
  - heading: Kids outdoor clothing
    image: "/kids-square.jpg"
    link: "#"
    linktext: Buy now
  - heading: Kids outdoor clothing
    image: "/purpose-beach.jpg"
    link: "#"
    linktext: Buy now
  - heading: Infant outdoor clothing
    image: "/infants-square.jpg"
    link: "#"
  - heading: Toddler outdoor clothing
    image: "/toddlers-square.jpg"
    link: "#"
  - heading: Kids outdoor clothing
    image: "/kids-square.jpg"
    link: "#"
    linktext: Buy now
  - heading: Kids outdoor clothing
    image: "/purpose-beach.jpg"
    link: "#"
    linktext: Buy now

---
# Image links (banners)

These behave pretty much the same manner as hero component, but they usually occupy a lot smaller portion of the page. They can be arranged with a grid to display either three, two or one banner on a same row. On mobile, they should either be stacked or displayed in a horizontal scroll component, depending how important it is to display them all without scrolling.

Each of the banners can use a different image for mobile. If not specified, the main image is cropped as a best guess to 1:1 aspect ratio.

The images are shown stacked on mobile (up to but not including 768px width). The default behavior is that grid cells are a minimum of 350px wide and fill the entire width. It is possible to specify the number of columns for tablet and desktop. This is done via @media min-width, so if you leave desktop unselected it will inherit the value from tablet.
