# Felipe-Rodriguez-Feli.Pix
My personal photo portfolio.

The site is `index.html` at the top of this repo, with styles in `css/`, behavior in `js/app.js`, and all photo, category and shoot info in `js/photos.js`. Photos live in `images/` as web-size JPGs (2400px long edge, location data removed).

To add or swap a photo: put the JPG in `images/` and add or edit its line in `js/photos.js`. Then make its smaller copies (used on phones and in grids) with `npm i --no-save sharp && node tools/resize.mjs`, which also rewrites `js/sizes.js`. If you skip that step the photo still shows; it just loads the full-size file everywhere.

The contact form opens the visitor's email app with their request filled in. To have it send directly instead, set `formEndpoint` in `js/photos.js` to a form service URL (for example a Formspree form).

The older single-page version is still in `Digital Photography Portfolio/`.
