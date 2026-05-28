# Click

**Click** is a simple, fast, privacy-friendly, and offline-first Progressive Web App (PWA) that generates direct click-to-chat links for **WhatsApp**, **Telegram**, and **Signal** without requiring users to save phone numbers first.

Use the app to quickly open a chat with any phone number by selecting a country code, entering the number, and choosing the preferred messaging service.

> Production URL: **https://click.blzr.sbs/**



## Table of Contents

- [About Click](#about-click)
- [Key Features](#key-features)
- [Why Use Click?](#why-use-click)
- [Supported Messaging Platforms](#supported-messaging-platforms)
- [PWA and Offline Support](#pwa-and-offline-support)
- [SEO, OpenGraph, and Schema-LD](#seo-opengraph-and-schema-ld)
- [Accessibility and Responsive Design](#accessibility-and-responsive-design)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Service Worker and Cache Notes](#service-worker-and-cache-notes)
- [Customization](#customization)
- [Browser Support](#browser-support)
- [Troubleshooting](#troubleshooting)
- [Developer Contact](#developer-contact)
- [License](#license)



## About Click

Click is a lightweight utility web application designed to reduce friction when starting conversations on popular messaging platforms. Instead of saving a contact first, users can generate a direct chat link for WhatsApp, Telegram, or Signal.

The app is built with **vanilla HTML, CSS, and JavaScript**. It does not require frameworks, build tools, package managers, or third-party runtime dependencies.

Click is ideal for:

- quickly starting conversations with unsaved numbers;
- testing messaging links across platforms;
- using a minimal chat-link generator as a web utility;
- installing as a mobile or desktop PWA;
- offline-first usage after the first load.



## Key Features

- **WhatsApp click-to-chat link generator**
- **Telegram phone link generator**
- **Signal phone link generator**
- **Country code selector** powered by `CountryCodes.json`
- **India `+91` default country selection**
- **Clipboard paste support** for phone numbers
- **Simple phone number validation** using digit-count checks
- **Same-tab redirect behavior**
- **Confirmation prompt before opening external chat links**
- **Mobile-friendly responsive layout**
- **System light/dark theme support**
- **Accessible form labels and live error messages**
- **Full-screen loading state while country codes load**
- **Installable Progressive Web App**
- **Offline-first app shell caching**
- **Runtime caching for same-origin assets**
- **OpenGraph and Twitter/X social preview metadata**
- **Schema-LD structured data for WebApplication, WebSite, FAQPage, and Organization**



## Why Use Click?

Click helps users start conversations faster by removing the need to manually save contacts. The app focuses on speed, simplicity, and privacy-friendly usage.

Unlike heavier chat utility tools, Click:

- runs directly in the browser;
- works without a backend server;
- does not require user accounts;
- does not store phone numbers;
- can be installed as a PWA;
- can load offline after installation or first successful visit.


## Supported Messaging Platforms

### WhatsApp

Click generates WhatsApp-compatible links for starting direct conversations with a phone number.

### Telegram

Click generates Telegram phone links where supported by the user’s device and browser environment.

### Signal

Click generates Signal-compatible phone links and attempts to open the native app where available.

> External chat links may still require the target app to be installed or a working network connection, depending on the platform and device.


## PWA and Offline Support

Click includes Progressive Web App support through:

- `site.webmanifest`
- `service-worker.js`
- installable app icons
- maskable Android icon support
- app shell caching
- offline fallback to `index.html`
- runtime caching for future same-origin assets

The service worker caches essential local assets such as:

- `index.html`
- `index.css`
- `index.js`
- `CountryCodes.json`
- app icons
- manifest file
- OpenGraph image

This allows the interface and country list to remain available after the first successful load.


## SEO, OpenGraph, and Schema-LD

Click is optimized for search engines and social sharing with:

- descriptive `<title>` and meta description;
- canonical URL;
- OpenGraph metadata;
- Twitter/X Card metadata;
- structured data using Schema-LD.

Recommended Schema-LD types included:

- `Organization`
- `WebApplication`
- `WebSite`
- `FAQPage`

These structured data blocks help describe the app, publisher, developer contact, app features, FAQ content, and production URL.


## Accessibility and Responsive Design

Click is designed to work well across screen sizes and input methods.

Accessibility-focused improvements include:

- semantic HTML structure;
- visible labels for inputs;
- `aria-live` error and status regions;
- accessible loader status;
- keyboard-focus support;
- skip link support;
- descriptive button labels;
- no-JavaScript fallback message.

Responsive UI improvements include:

- mobile-first layout behavior;
- large tap targets;
- stacked service buttons on small screens;
- safe-area viewport support;
- system light/dark color scheme support.


## Project Structure

```txt
.
├── index.html
├── index.css
├── index.js
├── CountryCodes.json
├── site.webmanifest
├── service-worker.js
├── favicon.svg
├── og-image.png
└── identity/
    ├── og-image.png
    ├── icon.svg
    ├── maskable-icon.svg
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── apple-touch-icon.png
    ├── android-chrome-192x192.png
    ├── android-chrome-512x512.png
    ├── maskable-icon-512x512.png
    └── browserconfig.xml
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/1bl4z3r/click.git
cd click
```

Open `index.html` directly in a browser or run a local static server.


## Local Development

For local testing, use a static server instead of opening files through the `file://` protocol.

Example using VS Code Live Server:

```txt
http://127.0.0.1:5500/
```

Example using Python:

```bash
python -m http.server 5500
```

Then open:

```txt
http://127.0.0.1:5500/
```

> Service workers work on `localhost` and secure HTTPS origins. For production, serve the app over HTTPS.


## Deployment

The production app is intended to be available at:

```txt
https://click.blzr.sbs/
```

The app can also be hosted from a GitHub Pages project path such as:

```txt
https://github.com/1bl4z3r/click/
```

To support both custom domain and GitHub Pages-style hosting, use relative manifest paths:

```json
{
  "id": "./",
  "start_url": "./",
  "scope": "./"
}
```

This avoids origin mismatch warnings in Chromium-based browsers.


## Service Worker and Cache Notes

If the app appears stuck on old files during development or after deployment, clear the previous service worker and cache.

In the browser console:

```js
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => registration.unregister());
});
```

Then hard refresh the page.

In Chrome or Edge DevTools:

1. Open **Application**.
2. Go to **Service Workers**.
3. Click **Unregister**.
4. Go to **Storage**.
5. Click **Clear site data**.
6. Reload the page.


## Customization

### Change app name

Update the name in:

- `index.html`
- `site.webmanifest`
- Schema-LD blocks
- OpenGraph and Twitter metadata

### Change production URL

Update:

- canonical URL
- `og:url`
- `twitter:url`
- Schema-LD `url` and `@id` values
- manifest `id`, if using an absolute same-origin value

### Change theme color

Update:

```css
--primary: #0741ad;
```

and the manifest values:

```json
"theme_color": "#0741ad",
"background_color": "#0741ad"
```

### Update country codes

Edit:

```txt
CountryCodes.json
```

Expected format:

```json
[
  {
    "country": "India",
    "code": "+91",
    "iso": "IN"
  }
]
```

## Browser Support

Click works in modern browsers that support standard HTML, CSS, and JavaScript.

PWA installation behavior varies by browser:

- Chromium-based browsers support the `beforeinstallprompt` flow for custom install buttons.
- Some browsers may show their own install UI instead.
- Some browsers may not support custom install prompts.

If the **Install App** button does not appear, the browser may not support the custom install event, the app may already be installed, or the manifest/service worker criteria may not yet be satisfied.