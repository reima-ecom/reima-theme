---
layout: page
modules:
- template: products
  collection: tops
  title: All tops
- template: products
  collection: tops
  title: Limited to 10
  limit: 10
- template: products
  collection: tops
  title: Limited to four
  limit: 4
- template: products
  collection: tops
  title: Limited to four
  limit: 4
  show_all: All Tops
- template: products
  collection: tops
  title: Split product into color variants
  split_colors: true
- template: products
  collection: tops
  title: Carousel
  limit: 12
  columnstablet: '3'
  columnsdesktop: '4'
  carousel_enabled: true
  carousel_dots: true
  carousel_autoplay: true
  carousel_autoplay_speed: 7000

---

# Products listing

The `products` module shows products in a particular collection in a grid layout. You can limit the number of products to show, in which case a "show more" button will be shown.
