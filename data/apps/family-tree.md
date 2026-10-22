---
order: 3
app_name: Family Tree
title: "Family Tree: Your family tree from Contacts"  # <title>
description: >-                                     # meta description + app row text
  Turns the relations already saved in your contacts into a family tree: explore it, add parents,
  children and partners, and fix names that do not match. No account, nothing to type again.
tagline: Your family tree from Contacts
accent: "#E8B800"
icon: /assets/apps/family-tree/icon-256.png
icon_touch: /assets/apps/family-tree/icon-180.png
icon_favicon: /assets/apps/family-tree/icon-64.png
# Not yet on the App Store: no app_store_id or app_store_url, a "Coming soon" label in place of the
# App Store badge, and no "Get the app" button. Add both and remove this flag once it is released.
coming_soon: true
hero:
  title: The family you already carry around.
  subtitle: >-
    Family Tree reads the mother, father, child and partner entries in your contacts and draws them
    as a family tree. Contacts stays the single place for your data; the tree just shows it.
  trust: ["iPhone & iPad", No account, Your data stays on your device]
  image: 01-family-tree.jpg
  image_alt: Family Tree on iPhone, showing four generations of a family as a tree
sections:
  screenshots: { title: A look at Family Tree, description: "A tree of every generation, a list of everyone in it, and a PDF to share." }
  features:    { title: Built on your contacts, description: "No second database and no account: your family is already in your phone." }
  support:     { title: Support, description: "Something not working, or an idea? Write to apps@t-schmutz.de. I read every message." }
  download:    { title: Family Tree is coming soon, text: "Family Tree will soon be on the App Store for iPhone and iPad. Family Tree Pro, a one-time in-app purchase, adds the PDF export and dates of death." }
features:
  - { icon: diagram-3,         title: Built on your contacts, text: "The relations in your contacts become a real family tree. Change a contact and the tree follows; nothing is copied into a second database." }
  - { icon: people,            title: Explore the tree,       text: "Generations as rows, parents above and children below. Tap anyone to put them at the centre, and show ancestors, descendants or both." }
  - { icon: person-plus,       title: Grow your tree,         text: "Add a father, mother, son, daughter or partner right from the tree. The contact and the relation are written to Contacts in one step." }
  - { icon: wrench,            title: Fix what does not match, text: "A typo or a nickname quietly breaks a relation. Broken relations lists every name that matched nobody, so you can fix it in Contacts." }
  - { icon: file-earmark-pdf,  title: Share it as a PDF,      text: "With Family Tree Pro, export your family tree as a PDF to share, print or keep, and show dates of death from a date label you choose." }
  - { icon: lock,              title: Private by design,      text: "Your family data never leaves your device. Share all contacts or only a few; the tree works either way, even offline." }
faq:
  - q: Why does Family Tree use the Contacts app?
    a: Your family already lives in Contacts. Family Tree reads the related names on your contact cards, such as mother or son, and draws them as a tree, so there is nothing to type in twice.
  - q: Where are my relations stored?
    a: On the contact cards in Contacts. Every relation you add in Family Tree is written there too, so your other apps and devices see it, and nothing is lost when you delete the app.
  - q: Why is a relation missing or broken?
    a: Contacts saves a related name as plain text. Family Tree connects it to the contact whose full name matches exactly, so a typo, a nickname or a missing middle name is enough to break the link. Broken relations in the people list shows each of them.
  - q: What does Family Tree Pro add?
    a: Family Tree Pro is a one-time in-app purchase that supports the app's development. It adds the PDF export and dates of death, unlocks future features, and is shared with your Family Sharing group.
  - q: Do you collect data about me?
    a: Family Tree has no account, and your contacts never leave your device. It uses usage analytics, which you can switch off in Settings, and crash reports to improve the app. The [privacy policy](/privacy-policy/) explains each service.
  - q: How do I get in touch?
    a: Write to [apps@t-schmutz.de](mailto:apps@t-schmutz.de), or use "Give feedback" in the app's Settings.
# The carousel shows the framed App Store screenshots in screenshots/framed/, without captions; the
# hero and the main page show the plain ones. With iPad screenshots the carousel gets an iPhone / iPad picker.
framed_screenshots: true
screenshots:
  - { file: 01-family-tree.jpg,          alt: "A family tree of four generations with names and dates" }
  - { file: 02-people.jpg,               alt: "A searchable list of everyone with a family relation" }
  - { file: 03-add-relation.jpg,         alt: "Choosing a contact to add as Clara Hoffmann's daughter" }
  - { file: 04-export-pdf.jpg,           alt: "A preview of the family tree as a PDF, ready to share" }
  - { file: 05-family-tree-dark.jpg,     alt: "The family tree in dark mode" }
  - { file: 06-onboarding.jpg,           alt: "The welcome screen explaining that the tree comes from Contacts" }
  - { file: 07-onboarding-privacy.jpg,   alt: "The welcome screen explaining that the data stays on the device" }
screenshots_ipad:
  - { file: ipad-01-family-tree.jpg,        alt: "The people list beside a family tree of four generations on iPad" }
  - { file: ipad-03-add-relation.jpg,       alt: "Adding a relation to a person in the tree on iPad" }
  - { file: ipad-04-export-pdf.jpg,         alt: "A family tree exported as a PDF on iPad" }
  - { file: ipad-05-family-tree-dark.jpg,   alt: "The family tree in dark mode on iPad" }
  - { file: ipad-06-onboarding.jpg,         alt: "The welcome screen explaining that the tree comes from Contacts" }
  - { file: ipad-07-onboarding-privacy.jpg, alt: "The welcome screen explaining that the data stays on the device" }
---
