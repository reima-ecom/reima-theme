---
layout: page
title: Form
modules:
- template: hero
  heading: Hero component
  text: You can use **markdown** in the text
  link: "#"
  linktext: Shop originals
  image: hero.jpg
  overlayinvert: true
  type: Image
- template: content
  content: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel egestas sapien. Cras orci dolor, maximus et libero non, aliquam lobortis turpis.
- template: form
  title: Form test
  description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel egestas sapien.
  thankYouMessage: Thanks!
  submitCta: Submit
  fields:
  - name: First name
    placeholder: First name
    type: text
    required: true
    checked: false
  - name: lastname
    placeholder: Last name
    type: text
    required: true
    checked: false
  - name: Phone
    placeholder: Phone
    type: tel
    required: true
    checked: false
  - name: Email
    placeholder: Email
    type: email
    required: false
    checked: false
  - name: Address1
    placeholder: Address
    type: text
    required: true
    checked: false
  - name: City
    placeholder: City
    type: text
    required: true
    checked: false
  - name: Zip
    placeholder: Postal code
    type: text
    required: true
    checked: false
  - name: Newsletter
    placeholder: I would like to take part in the raffle and receive the Reima Japan newsletter.
    type: checkbox
    required: false
    checked: true
    tags:
    - prospect
    - newsletter
    - babybox-signup
hide_newsletter_sign_up: true
---
