# Ali Youssef Portfolio - React Version

This is a complete React rebuild of the original HTML/CSS/JS portfolio website, maintaining 100% design fidelity, all animations, and all interactive features.

## Features

- ✅ **Exact Design Match**: All styling, colors, and layouts preserved
- ✅ **All Animations**: GSAP animations fully implemented
- ✅ **All Interactions**: Hover effects, click handlers, and form validations
- ✅ **React Router**: Client-side routing for all pages
- ✅ **Responsive Design**: Mobile and desktop layouts maintained
- ✅ **Theme Support**: Dark/light theme toggle (currently hidden but functional)

## Tech Stack

- React 18
- React Router DOM
- GSAP (for animations)
- EmailJS (for contact form)
- Tailwind CSS (via existing CSS)
- Vite (build tool)

## Installation

1. Navigate to the react-portfolio directory:
```bash
cd react-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
react-portfolio/
├── src/
│   ├── components/
│   │   ├── Header.jsx      # Navigation header with theme toggle
│   │   └── Footer.jsx      # Footer component
│   ├── pages/
│   │   ├── Home.jsx        # Home/landing page
│   │   ├── About.jsx       # About page with timeline
│   │   ├── Contact.jsx     # Contact form page
│   │   ├── Services.jsx     # Services page
│   │   ├── Skills.jsx       # Skills & expertise page
│   │   └── Projects.jsx     # Projects portfolio page
│   ├── assets/
│   │   └── images/         # All image assets
│   ├── config.js           # EmailJS configuration
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # React entry point
│   └── index.css           # All CSS styles (copied from original)
├── public/                 # Public assets
├── package.json
└── vite.config.js
```

## Pages

- **Home** (`/`) - Hero section with signature animation, core technologies, and CTA
- **About** (`/about`) - Biography, career timeline, skills proficiency
- **Contact** (`/contact`) - Contact form with EmailJS integration
- **Services** (`/services`) - Service offerings
- **Skills** (`/skills`) - Technical skills and expertise
- **Projects** (`/projects`) - Project portfolio

## Animations

All GSAP animations from the original site are preserved:
- Signature drawing animation
- Fade-in effects on scroll
- Card hover animations
- Button hover effects
- Hero text character animations
- Hero image 3D tilt effect
- Scroll-triggered animations

## Deployment

### For Hostinger Premium Plan:

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder contents to your Hostinger hosting

3. Configure `.htaccess` for React Router (create in public folder):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. The build output will be in the `dist` folder - upload all contents to your web root

## Notes

- All original CSS is preserved in `src/index.css`
- All images are copied to `src/assets/images/`
- EmailJS configuration is in `src/config.js`
- Theme toggle is hidden by default (can be enabled in Header.jsx)
- All animations use GSAP exactly as in the original

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design maintained

