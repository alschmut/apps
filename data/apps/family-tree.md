---
order: 3
app_name: Family Tree
title: "Family Tree: Your family tree from Contacts"  # <title>
description: >-                                     # meta description + app row text
  Turns your contacts into a family tree: add parents, children and partners once, and they are
  saved right in Contacts, on all your devices. No account, nothing to type twice.
tagline: Your family tree from Contacts
accent: "#4A7DB8"
icon: /assets/apps/family-tree/icon-256.png
icon_touch: /assets/apps/family-tree/icon-180.png
icon_favicon: /assets/apps/family-tree/icon-64.png
# Not yet on the App Store: no app_store_id or app_store_url, a "Coming soon" label in place of the
# App Store badge, and no "Get the app" button. Add both and remove this flag once it is released.
coming_soon: true
hero:
  title: Your contacts, as a family tree.
  subtitle: >-
    Family Tree draws your family from the mother, father, child and partner entries in your
    contacts. Add relatives once: they are saved right in Contacts, so your tree is on all your
    devices through iCloud.
  trust: ["iPhone & iPad", No account, Contacts never sent to us]
  image: 01-family-tree.jpg
  image_alt: Family Tree on iPhone, showing four generations of a family as a tree
sections:
  screenshots: { title: A look at Family Tree, description: "A tree of every generation, relatives added in a few taps, and a PDF to share." }
  features:    { title: Built on your contacts, description: "No second database and no account: your family is already in your phone." }
  support:     { title: Support, description: "Something not working, or an idea? Write to apps@t-schmutz.de. I read every message." }
  download:    { title: Family Tree is coming soon, text: "Family Tree will soon be on the App Store for iPhone and iPad. Family Tree Pro, a one-time in-app purchase, adds the PDF export, dates of death and quiet birthdays." }
features:
  - { icon: diagram-3,       title: Built on your contacts,  text: "Mother, father, son, daughter, spouse and partner entries become a real family tree. Relatives you already entered show up right away, and the tree follows every change." }
  - { icon: people,          title: Explore the tree,        text: "Generations as rows, parents above and children below. Tap anyone to put them at the center, show ancestors, descendants or both, and see brothers and sisters through shared parents." }
  - { icon: person-plus,     title: Grow your tree,          text: "Add a father, mother, son, daughter or partner with Add Relative: pick a contact or create one, saved in one step. Edit a name and every relative's entry follows." }
  - { icon: wrench,          title: Fix what does not match, text: "Contacts stores relatives as written names, so a typo can break a link. Broken Relations lists every such name: choose the right contact, or delete the entry." }
  - { icon: hourglass-split, title: Remember those who passed, text: "With Family Tree Pro, add dates of death, and keep the birthdays of relatives who passed away as quiet birthdays: in the tree, without an iOS reminder." }
  - { icon: lock,            title: Your contacts are safe,  text: "Family Tree only writes what you add or edit, never deletes a contact, and asks before deleting a relation. Your contacts are never sent to us." }
faq:
  - q: Why does Family Tree use the Contacts app?
    a: Your family already lives in Contacts. Family Tree reads the related names on your contact cards, such as mother or son, and draws them as a tree. Relatives you add are saved there too, so your tree is on all your devices when your contacts sync with iCloud.
  - q: Will Family Tree change or delete my contacts?
    a: Only when you add, edit or delete something yourself, and nothing else on the contact changes. Family Tree never deletes a contact, and it asks before deleting a relation. Delete the app and your family stays in Contacts.
  - q: Why is a relative missing from the tree?
    a: 'Contacts saves family as a written name, like "Mother: Maria Smith", and it only shows if it is spelled exactly like her contact. Names that do not match a contact are listed under Broken Relations, where you can choose the right contact. Nothing entered yet? Add her with Add Relative.'
  - q: How do I stop birthday reminders for relatives who passed away?
    a: Save their birthday as a quiet birthday. It shows in the tree, but iOS sends no reminder. Set it up once under Settings › Quiet Birthdays (Family Tree Pro), then edit the contact and switch its birthday to a quiet birthday.
  - q: What does Family Tree Pro include?
    a: A one-time purchase, no subscription, that supports the app's development. It adds the PDF export, dates of death and quiet birthdays, and every future feature, and is shared with your Family Sharing group.
  - q: Do you collect data about me?
    a: Family Tree has no account, and your contacts are never sent to us; they sync only through your own iCloud. Usage data and crash reports help improve the app, never contain names, and can be turned off in Settings. The [privacy policy](/privacy-policy/) explains each service.
  - q: How do I get in touch?
    a: Write to [apps@t-schmutz.de](mailto:apps@t-schmutz.de), or use Feedback in the app's Settings.
# The carousel shows the framed App Store screenshots in screenshots/framed/, without captions; the
# hero and the main page show the plain ones. With iPad screenshots the carousel gets an iPhone / iPad picker.
framed_screenshots: true
ipad_landscape: true
screenshots:
  - { file: 01-family-tree.jpg,        alt: "A family tree of four generations with names and dates" }
  - { file: 02-add-relation.jpg,       alt: "Adding a daughter to Clara and Thomas Hoffmann by choosing a contact" }
  - { file: 03-export-pdf.jpg,         alt: "A preview of the family tree as a PDF, ready to share" }
  - { file: 04-family-tree-dark.jpg,   alt: "The family tree in dark mode, centered on Clara Hoffmann" }
  - { file: 05-contact-list.jpg,       alt: "A searchable list of every contact with relatives" }
  - { file: 06-quiet-birthday.jpg,     alt: "Setting up quiet birthdays for relatives who passed away" }
  - { file: 07-onboarding-privacy.jpg, alt: "The welcome screen explaining that your contacts stay safe and private" }
screenshots_ipad:
  - { file: ipad-01-family-tree.jpg,        alt: "The contact list beside a family tree of four generations on iPad" }
  - { file: ipad-02-add-relation.jpg,       alt: "Adding a relative to a couple in the tree on iPad" }
  - { file: ipad-03-export-pdf.jpg,         alt: "A family tree exported as a PDF on iPad" }
  - { file: ipad-04-family-tree-dark.jpg,   alt: "The family tree in dark mode on iPad" }
  - { file: ipad-06-quiet-birthday.jpg,     alt: "Setting up quiet birthdays on iPad" }
  - { file: ipad-07-onboarding-privacy.jpg, alt: "The welcome screen explaining that your contacts stay safe and private, on iPad" }
---
