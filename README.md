# 🍽️ Slider – Drag, Glide & Explore ✨

An **interactive, futuristic menu slider**.This UI showcases **beautiful food & drinks cards** with :

- 🎚️ Smooth **horizontal drag-to-scroll**
- 🌀 A glowing **scrubber handle** that syncs with scrolling
- 🖱️ **Click-to-open cards** that navigate to live recipe / cocktail / food sites  
- 🌈 Animated gradients, neon glows, and micro-interactions

---

## 🌟 Features

- 🎢 **Drag to Scroll**  
  - Click and drag (or swipe on touch devices) to smoothly scroll the menu.

- 🎛️ **Scrubber Control**  
  - A circular **“DRAG”** handle moves on a track and controls the horizontal scroll.
  - Rotation and position of the handle are synced with the content scroll.

- 🍟 **Category-Based Cards**  
  - Cards are labeled as:
    - 🧇 `Bites`
    - 🥤 `Drinks`
    - 🍰 `Dessert`
  - Each card has:
    - A cover image
    - Title
    - Description
    - Price
    - Tag/pill (e.g., *Shareable*, *Zero proof*, *Light finish*)

- 🌐 **Clickable Cards (Live Links)**  
  - Clicking on a card (without dragging) opens its related website in a **new tab**.

- 🌌 **Modern UI & Animations**  
  - Animated **background gradient**
  - Floating **orb glow**
  - 3D hover effects on cards
  - Light sweeps and conic gradient glows inside the shell and scrubber

- 📱 **Responsive Layout**  
  - Works nicely on desktop and adapts on smaller screens:
    - Hides top-right nav links on very small widths
    - Cards resize with viewport

---

## 🧰 Tech Stack

| Part          | Technology     |
|---------------|----------------|
| Markup        | HTML5          |
| Styling       | Modern CSS3 (Gradients, Animations, Responsive) |
| Interactions  | Vanilla JavaScript (ES6) |
| Fonts         | System UI stack |

---

🕹️ How to Use

Once the page is open:

🧭 Top Navigation

Right-side links (Wizardry, Patreon, YouTube) are just external navigation examples.

🎚️ Slider Interaction

Hover over the cards area.

Drag horizontally with your mouse (or swipe on touch devices) to explore all items.

The horizontal scroll & the scrubber handle stay in sync.

🌀 Scrubber Handle

At the bottom of the slider, drag the round “DRAG” button left/right.

This moves the visible set of cards.

The handle rotates as you move it – nice little micro-interaction!

🖱️ Open Card Links

Click (without dragging) on any card.

It will open the associated site (Serious Eats, Liquor.com, etc.) in a new tab.

🧠 Cards distinguish between dragging vs clicking using a small movement threshold, so accidental drags don’t trigger clicks.

🎨 Customization Ideas

Want to make this your own? Here are some ideas:

🖼️ Change Images & Content

Edit each <article class="slider-card"> in index.html

Swap images (<img src="...">) with your own Unsplash or product links

Update titles, descriptions, prices, and tags

🌈 Tweak Colors & Theme

All main colors are in :root in styles.css:

--bg-main, --accent, --accent-pink, --accent-cyan, etc.

Modify them to create:

A coffee shop menu ☕

A gaming library 🎮

A movie catalog 🎬

📲 Add Category Chips (Optional)

The JS already supports category chips via data-category-chip attributes.

You can add navigation chips (e.g., “Bites / Drinks / Dessert”) that scroll to the first card in that category.

🧪 Browser Support

✅ Works best on:

Chrome

Edge

Firefox

Safari (modern versions)

Uses only modern-but-widely-supported CSS & JS features.

✍️ Author

👨‍💻 Rama Lingeswara Rao Sivakavi
Frontend & UI Enthusiast, bringing smooth interactions & delightful visuals to the web.

🌐 GitHub: https://github.com/your-username

💼 Portfolio: add your portfolio link here

✉️ Email: add your email here

Feel free to fork, star ⭐, and customize this layout for your own menus, galleries, product sliders, or showcases!

📜 License

You can use, modify, and extend this project for learning and personal projects.
For commercial usage, please review/attach a proper license (e.g., MIT) as needed.

💡 “Great UI isn’t just about pixels, it’s about the way everything moves, reacts, and feels when you touch it.”
