# Kidz Hospital Static Website

Kidz Hospital is a premium, multi-page static website for a pediatric hospital based in Peshawar, Pakistan. It is designed to feel warm, polished, child-friendly, and trustworthy while staying fully deployable on GitHub Pages.

## Project structure

- `index.html` - conversion-focused homepage
- `about.html` - hospital story, mission, vision, values, and care philosophy
- `facilities.html` - visually rich facilities and services page
- `appointment.html` - static-compatible appointment booking form
- `contact.html` - contact details, map placeholder, hours, and local contact cards
- `css/styles.css` - shared design system and responsive styling
- `js/script.js` - mobile navigation, reveal animations, FAQ accordion, sticky header, year, and form validation/submission
- `images/branding/` - logo, favicon, and Open Graph assets
- `images/illustrations/` - homepage, about, and map artwork
- `images/doctors/` - doctor photos used by the homepage and about page
- `.nojekyll` - ensures GitHub Pages serves folders like `/css`, `/js`, and `/images` without Jekyll processing

## Features

- Fully static HTML, CSS, and JavaScript
- Responsive layout for mobile, tablet, and desktop
- Sticky navigation with mobile menu
- Premium pediatric visual identity with gradients, rounded cards, layered sections, and subtle motion
- Home, About, Facilities, Appointment, and Contact pages
- Appointment form with client-side validation and success/error messages
- Static-compatible submission flow using Formspree
- Semantic HTML, visible focus states, accessible labels, and reduced-motion support
- SEO metadata, Open Graph tags, and favicon

## Appointment form setup

The appointment form is already wired for a static hosting workflow. You only need to connect a real Formspree endpoint.

### 1. Create the Formspree form

1. Sign in at `https://formspree.io/`
2. Create a new form using the hospital email address: `contact@kidzhospital.org`
3. Copy the generated endpoint, which looks like:

```text
https://formspree.io/f/xxxxxxxx
```

### 2. Replace the placeholder action

Open `appointment.html` and replace:

```html
action="https://formspree.io/f/your-form-id"
```

with the real endpoint from Formspree.

### 3. Test submission

After replacing the endpoint:

1. Open the site locally in a browser
2. Submit the appointment form with test details
3. Confirm the message arrives in the Formspree inbox for `contact@kidzhospital.org`
4. Configure any spam filtering, auto-response, or redirect options inside Formspree if needed

## Local preview

Because this is a plain static site, you can preview it with any static file server.

If Python 3 is installed:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages deployment

### Automatic deployment with GitHub Actions

This repository now includes a GitHub Pages workflow at `.github/workflows/deploy-pages.yml`.

After you push to GitHub, do this one-time setup in the repository:

1. Open `Settings`
2. Open `Pages`
3. Under `Build and deployment`, set `Source` to `GitHub Actions`

After that, every push to `main` will automatically deploy the site to GitHub Pages.

### Manual branch-based deployment

1. Push the project to GitHub
2. In the repository settings, open `Pages`
3. Under `Build and deployment`, choose:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or your preferred branch)
   - `Folder`: `/ (root)`
4. Save the settings

GitHub Pages will publish the site using the files in the repository root.

### Option 2: Use a custom domain later

If the hospital uses `kidzhospital.org` for the website:

1. Add a `CNAME` file later if needed
2. Point the domain DNS to GitHub Pages
3. Update the canonical and Open Graph URLs if the live domain changes

## Content placeholders to replace before launch

These are intentionally marked in the code so the client can review them safely:

- Emergency hotline
- Full street address and landmark
- Opening hours
- Family testimonials
- Final Formspree endpoint

## Notes

- All assets use relative paths so the project works cleanly on static hosting
- No backend, database, or server runtime is required
- The site is ready to present as a polished static hospital website and ready to deploy once placeholders are replaced
