# Hirewell – job board

A small static job board in turquoise and pink. Employers post jobs, and job seekers search and apply.

## Features
- **Find jobs:** search by keyword, filter by location, category and job type, read details, and apply with name, email, resume link and a note.
- **Post a job:** title, company, location, pay (optional), category, type and description. Listings go live right away.
- **My postings:** see the jobs you posted, review applicants, and close a job when it's filled.
- Light and dark themes (follows the device setting), responsive layout, keyboard-friendly.

## Project structure
```
hirewell/
├── index.html      page shell (header, mount point, apply dialog)
├── README.md
├── css/
│   └── style.css   styles and theme colors (CSS variables at the top)
└── js/
    ├── data.js     categories, job types and sample listings
    └── app.js      state, search and filters, apply form, post form, dashboard
```

## Run it
Open `index.html` in a browser. Or serve the folder locally:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Customize
- **Colors:** edit the variables at the top of `css/style.css` (`--brand` turquoise, `--cta` and `--mark` pink). Dark mode values are in the two dark blocks right below.
- **Categories and job types:** edit `CATS` and `TYPES` in `js/data.js`.
- **Sample jobs:** edit the `seed` array in `js/data.js`.

## How data is stored
Jobs and applications are saved in the browser's `localStorage` under the key `hirewell`. This means:
- Data stays in one browser and isn't shared between visitors.
- There are no logins. "My postings" shows jobs posted from the current browser.
- Clearing site data resets the board to the sample listings.

## Next steps for a real launch
1. Replace `save()` and the initial load in `js/app.js` with calls to a backend API and database.
2. Add sign-in for employers and job seekers.
3. Send an email to the employer when someone applies.
4. Move resume links to file uploads.
