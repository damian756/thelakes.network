# thelakes.network: November 2026 report

Internal. Work of 11 Nov 2026 on `main`. The site is one static page (`index.html`) served by Vercel, plus one Vercel Function (`api/contact.js`). `docs/` and `tests/` are kept out of the deployment by `.vercelignore`.

**Standing rule (Damian, 11 Nov 2026): traffic first.** His words: "their only goal is to drive traffic, we dont need to focus much on conversion, but just raw numbers. Having high traffic is what will sell the advert space locally". Every choice is judged by visits from search. Titles and descriptions are written for what people search, a live title's main phrase is not traded for a tidier one, and there is no conversion work beyond stage B (no extra calls to action, pop-ups or funnels).

Commits:
- `748a390` (stage 1, live 17:10 UTC): contact form.
- `1b8a6e8`: copy on the approved pattern.
- `065ae6e`: improvements.
- `5c4e42f`: review fixes.
- `9f011ea`: this report, first version.
- `76180c6`: favicon.
- `1d645cb` and `3283df9`: fonts served from the site, with their licences.
- `618af27`: privacy wording beside the form and in the footer.
- `088be19`: the full Ahrefs sentence (pushed and live, checked on the page).
- The advertising wording commit (section "Advertising now"), then this report, updated. Neither changes a privacy sentence.
- `a1691d6`, `7c66d58` and `a802480`: the SEO pass (section "SEO pass"), then this report, updated.

## Stage 1: contact form, no email address

**Found.**
- The form posted to `contact.php`, which Vercel cannot run. A POST answered 405, and a GET downloaded the PHP source, which named hello@thelakes.network. Nothing from the form had ever been delivered.
- thelakes.network has no MX record and no Resend records.

**Changed (`748a390`).**
- `api/contact.js`:
  - Required fields: `name` (max 200), `email` (validated, used as reply-to) and `message` (max 5000).
  - `enquiry` must be one of Featured listing, Partnership opportunity, Press or media, Advertising or General enquiry. Anything else becomes General enquiry.
  - A hidden honeypot field, `website`.
  - Every typed value is escaped.
- It sends through Resend's HTTP API from "The Lakes Network <noreply@southportguide.co.uk>" (a verified domain) to damian@churchtownmedia.co.uk.
- If the key is missing or Resend refuses, it answers 502 with a plain message and logs only the error's name and message.
- The page posts JSON from its own script. Without JavaScript, a plain form post gets a 303 back to the page.
- Removed:
  - the printed address;
  - `contact.php`;
  - the title and copy em dashes;
  - the "available in 20 languages" claim (Hike The Lakes routes English only).

**Proven live by the coordinating chat.**
- A marked test arrived from "The Lakes Network".
- `/contact.php` answers 403.
- `/api/contact.js` answers as the function and does not serve its source.

**Test.** `tests/contact.test.mjs`, 9 checks, run with `node --test tests/contact.test.mjs`. It uses a fake fetch, so nothing is sent. Key needed: `RESEND_API_KEY` (added by Damian on 11 Nov).

## Stage 2: what was found and changed (`1b8a6e8`)

**Found, ranked.**
1. **Claims that were not true or not shown:**
   - "No sponsored editorial";
   - "Revenue comes from affiliate commissions and featured listings, disclosed clearly on every page" (the company no longer uses affiliate links);
   - "Written by someone who walks the fells, watches the ospreys, and knows which pub lets you in with wet boots. Not content farms. Not AI-generated listicles.";
   - "The Lake District is genuinely world-class";
   - "Built differently. On purpose."
2. **Unsourced facts.**
   - In the purpose paragraph:
     - "Sixteen lakes";
     - ospreys "after a 150-year absence";
     - red deer in Martindale and red squirrels in Grizedale;
     - "one of the most-visited national parks in Europe".

     The osprey project's own site (ospreywatch.co.uk) carries injected payday-loan text, so it was not used as a source.
   - In the stats bar:
     - "20 Languages on Hike" is false;
     - "160+" species should be exactly 160 (the entries in The Lakes Wildlife's species data: 80 birds, 25 insects, 25 mammals, 30 plants);
     - "Multilingual" is false;
     - "214 Routes" is wrong: Hike The Lakes has route guides for 21 fells.
3. **Layout.**
   - The Hike The Lakes card text sat lower than the others: `.card p { flex: 1 }` also stretched the domain line.
   - At 1440 the footer left "3NU." alone on a line, and at 390 it broke "Hike The / Lakes".

**Changed.**
- **Hero lead:** "Independent guides to the Lake District: one for visitors, one for fell walkers working through the Wainwrights, and one for its wildlife."
- **Purpose.** Facts from the Lake District National Park Authority's facts and figures page:
  - England's largest national park;
  - home to the country's highest mountain and its deepest lake;
  - 17.45 million visitors in 2025.

  It then says what the three guides are and that practical details are checked against official sources. The money line reads: "Our income comes from businesses that pay for featured listings and advertising. Paying for a space does not change what we write."
- **Stats:**
  - 3 Independent Guides;
  - 214 Wainwright Fells;
  - 160 Wildlife Species;
  - 2,362 km² Of National Park (LDNPA).
- **What we stand for**, on the wording approved for seftoncoast.network:
  - **Independent:** "We are paid by businesses for featured listings and advertising. Paying for a space does not change what we write."
  - **Checked:** "We check opening times, parking, prices and access details against official sources when we write a page and when we revise it. If we can't confirm something, we leave it out."
  - **Useful:** "Built for the visitor making a decision: which route, where to stay, when to go, what to expect. Practical first, inspirational second."
  - **Focused:** "Three guides that cover the Lake District: visiting, fell walking and wildlife."
- **Site cards:** rewritten plainly. The Hike tags are now "214 Fells", and "Multilingual" is gone.
- **Footer:** "© 2026 The Lakes Network. Published by Churchtown Media Ltd (Company No. 16960442). Registered office: Suite RA01, 195-197 Wood Street, London, E17 3NU."
- **Screenshots:**
  - `screens/before-home-1440.jpg`, `before-home-390.jpg`;
  - `after-home-1440.jpg`, `after-home-390.jpg`;
  - the stage 1 form: `s1-form-1440.jpg` and `s1-form-sent-390.jpg`.

**Sources** (in `sources/`, all accessed 11 Nov 2026):
- **LDNPA facts and figures**, https://www.lakedistrict.gov.uk/learning/factsandfigures. Used for:
  - England's largest national park;
  - its highest mountain and deepest lake;
  - 2,362 km² (912 square miles);
  - 17.45 million tourists in 2025.
- **The Wainwright Society**, https://www.wainwright.org.uk/: the 214 completers register.
- **The approved Sefton wording**, https://www.seftoncoast.network/: the pattern for "What we stand for".
- The species count of 160 comes from `C:\Projects\lakes-wildlife\content\species\*.json`.

## Improvements, ranked (Damian, 11 Nov: "feel free to do anything extra that's needed")

| # | Item | Effort | State |
|---|---|---|---|
| 1 | Canonical, og:url, og:image, twitter:image, sitemap and robots.txt named https://thelakes.network, which redirects (307) to www. All now name https://www.thelakes.network/ | 10 min | Done, `065ae6e` |
| 2 | Organization JSON-LD: The Lakes Network, parent Churchtown Media Ltd, its three guides | 10 min | Done, `065ae6e` |
| 3 | Hero image width, height and fetchpriority (no layout jump, faster largest paint) | 5 min | Done, `065ae6e` |
| 4 | Contrast: hero coordinates 3.1:1 to 6.2:1; card numbers to full colour; a stronger form focus ring | 10 min | Done, `065ae6e` and `5c4e42f` |
| 5 | Level grids at every width: cards 3 or 1; values 4, 2 or 1; stat numbers on one line; footer wraps below 400 px (it scrolled sideways at 360 and 320) | 20 min | Done, `065ae6e` and `5c4e42f` |
| 6 | og:image size declared 1200x630 but the image is 768x1024 | 2 min | Done, `5c4e42f` |
| 7 | Screenshots in `docs/` would have been deployed | 2 min | Done, `5c4e42f` (`.vercelignore`) |
| 8 | No privacy notice beside the form, which collects a name, email address and message | 30 min | Done, `618af27` and `088be19` (wording approved by Damian) |
| 9 | No favicon: `/favicon.ico` is a 404 on every visit | 15 min | Done, `76180c6`: a plain L in the page's green, SVG with an ICO |
| 9a | Fonts loaded from Google Fonts (a request to Google on every visit) | 20 min | Done, `1d645cb`: Inter and Playfair Display served from the site as woff2; `3283df9` adds the SIL Open Font License texts beside them |
| 10 | The apex redirect is 307 (temporary). Making it 308 tells search engines it is permanent | Owner | Vercel domain settings |
| 11 | No visit counts (Ahrefs only) | Owner | Needs a database URL on the Vercel project |
| 12 | Emoji icons on the site cards | None | Left, matching the approved Sefton network page; now hidden from screen readers |

Screenshots at 1440, 1024, 768 and 390: `screens/improve-home-1440.jpg`, `-1024`, `-768` and `-390`. A check at 320, 360, 390, 700, 768, 820, 900, 1000, 1024 and 1440 found no sideways scroll.

## Independent review and what was done

**Range.** The reviewer read `748a390..065ae6e` cold, changed nothing and re-fetched the LDNPA page. Every fact matched:
- largest national park;
- highest mountain and deepest lake;
- 2,362 km²;
- 214;
- 17.45 million;
- 160 unique species entries.

**Findings and what was done (`5c4e42f`).**

| # | Severity | Finding | Done |
|---|---|---|---|
| 1 | Must | The footer line forced 364 px, so 360 and 320 px phones scrolled sideways | Wraps below 400 px |
| 2 | Should | "2,362 km²" broke onto two lines at 700 to 820 px | `white-space: nowrap` |
| 3 | Should | Values left 3+1 at 772 to 1023 px; cards left 2+1 at 600 to 700 px | Fixed column counts |
| 4 | Should | `docs/` would deploy, including the withdrawn claims in the before shots | Added to `.vercelignore` |
| 5 | Should | og:image size wrong | 768x1024 |
| 6 | Should | "conservation groups" was unsupported | Removed |
| 7 | Should | Two section labels were overridden to 16 px grey | Selector raised |
| 8 | Note | Apex 307 | Owner (Vercel) |
| 9 | Note | Weak focus ring; card numbers at 3.36:1 | Fixed |
| 10 | Note | Emoji read aloud by screen readers | `aria-hidden` |
| 11 | Note | "cover only the Lake District" (the wildlife guide includes Leighton Moss, Lancashire) | "cover the Lake District" |
| 11 | Note | No privacy line beside the form | Proposal |
| 11 | Note | Non-standard `Host:` line in robots.txt | Removed |

**Checks the reviewer marked met:**
- facts;
- claims (after finding 6);
- no em dash;
- no address (`node --test` 9/9);
- JSON-LD valid and true;
- canonical consistent;
- every field labelled;
- honeypot hidden from screen readers and keyboard.

## Advertising now (stage 3, approved by Damian)

**Before:** the page said "Our income comes from businesses that pay for featured listings and advertising" and "We are paid by businesses for featured listings and advertising". Neither is true today: no advert has been sold yet, and The Lakes Guide's Pro (the Featured badge) opens later. The form offered a "Featured listing" enquiry, which no site sells.

**Now:**
- Both lines read: "Businesses can pay to advertise on the guides, and every advert is labelled. Paying for a space does not change what we write."
- The Work with the Network text names what is on offer: "advertising on the three guides, a free listing in The Lakes Guide, partnerships and press enquiries". It links to each guide's /advertise page, where the options and prices are (the network bundle is £99 a month plus VAT, sold on each guide's page).
- The form's enquiry types, in the page and in `api/contact.js`, are now Advertising, Free listing in The Lakes Guide, Partnership opportunity, Press or media, and General enquiry. `tests/contact.test.mjs` checks that the two lists match: 9/9.
- No overflow at 1440, 1024, 768 or 390.

**Push order:** push this after The Lakes Guide, so its /advertise page is live before the network page links to it.

## SEO pass (11 Nov 2026, night)

On top of `abdde67`, not pushed. Live (`088be19`) and local were compared first: the live page, sitemap and robots.txt match the repo.

**Commits.**
- `a1691d6`, schema. Organization and WebSite now sit in one JSON-LD graph:
  - `@id` values on the www hosts, and the same `@id`s the three guides and Churchtown Media already use for themselves, so the nodes join up instead of repeating with different data;
  - the parent on https://www.churchtownmedia.co.uk (the apex answers 307), named "Churchtown Media" with `legalName` "Churchtown Media Ltd", as its own site has them;
  - a WebSite node, "The Lakes Network", published by Churchtown Media (the footer says "Published by Churchtown Media Ltd"). Google reads WebSite on a home page for the site name it shows in results, so it fits a one-page site. No SearchAction (there is no search), no logo (the only mark is the favicon's L), no ratings.
- `7c66d58`, footer: the Churchtown Media link on www, its canonical address. The visible text is unchanged.
- `a802480`, title and description, for what people search:
  - title "The Lakes Network: Three Guides to the Lake District" (52 characters), was "The Lakes Network: Three Guides. One Landscape.". The brand phrase stays first. The tagline went because no one searches it, and nothing shows the page ranking for anything (see "Traffic");
  - description "Independent Lake District guides: The Lakes Guide for things to do, Hike The Lakes for the 214 Wainwright fells, and The Lakes Wildlife for birds and nature." (157), was a list of the three names and "Built by Churchtown Media";
  - og and twitter title and description match. It is true of the page after tonight's advertising wording: the page still calls the guides independent, and Hike The Lakes has a page for each of the 214 fells.

**Checked and right.**
- **Canonical:** one tag, absolute, https://www.thelakes.network/, the page itself. og:url is the same. og:image and twitter:image are on www and answer 200. `/?sent=1`, `/?error=1` and `/index.html` serve the same page with the clean canonical. No robots meta and no X-Robots-Tag, so index, follow. http://www answers 308 to https.
- **Schema:** one block, parses, matches the page, implies nothing the network does not have.
- **Sitemap:** 1 URL, https://www.thelakes.network/, lastmod 2026-11-11 (the day the page last changed, still true after these commits). Served on 127.0.0.1:3114 it answers 200, with no robots meta and a canonical equal to the sitemap URL. `changefreq` and `priority` are left; search engines ignore them.
- **robots.txt:** `Allow: /` and `Sitemap: https://www.thelakes.network/sitemap.xml`. Nothing is blocked.
- **Speed:** fonts from the site and preloaded, hero image sized, analytics async. Nothing to fix.
- No em dash in `index.html`, robots, sitemap or `api/contact.js`. `node --test tests/contact.test.mjs`: 9/9.
- Not touched: the contact form route, the privacy wording, and no /advertise page of its own.

**For Damian.**
- **Push order.** Checked at 21:10 and again at 21:18 UTC: https://www.thelakeswildlife.co.uk/advertise answered 404. Hike's answered 200. The Lakes Guide's still showed the page from before stage B (its old description, "List your business on The Lakes Guide. Free and premium listing options..."). `6f3324a` links to all three, so it and everything on top of it should go only once The Lakes Guide's and Wildlife's /advertise are live. The three SEO commits do not depend on `6f3324a` and could be cherry-picked onto `088be19` if you want them live sooner. None has to go before a privacy commit.
- **Submit:** the home page, https://www.thelakes.network/, and the sitemap https://www.thelakes.network/sitemap.xml, after the push.
- **Hike The Lakes card, made true** (follow-up commit): it said "Guides to all 214 Wainwright fells: routes, conditions and what to expect on each summit", but 193 fell pages have no route guide yet. Now: "All 214 Wainwright fells: the height, grid reference and nearest fells for every one, and route guides for 21 so far, for walkers working through the list." Update the number as the fell guide batches go live.
- **Owner settings, as before:** the apex redirect is 307, and 308 would say it is permanent. `/index.html` serves a copy of the page. The canonical covers it; `cleanUrls` in `vercel.json` would redirect it, but that is a Vercel setting, so it is left.
- **For the guides' own passes:** all three link to https://thelakes.network (the apex, a 307 hop) in their footers and list it, and https://churchtownmedia.co.uk, in their Organization `sameAs`. `sameAs` is meant for the same organisation's other profiles, not sister sites.

## Traffic: what to do next

Ranked by likely visits gained. There is no evidence of visits to rank by: the Ahrefs API answered 403 for thelakes.network, the page has no visit log, and a web search on 11 Nov found no page from thelakes.network (a US search engine, not Google). So the ranking is reasoned, with no numbers.

The page's job is to send people to the three guides. The only search term it can realistically win is its own name ("the lakes network"). "Lake District guides" is dominated by the National Park Authority, Cumbria Tourism and guidebook publishers, and one page on a new domain will not beat them. The guides are where the visits are.

1. **Get it indexed.** Submit the sitemap and request indexing of the home page in Search Console once pushed. Make the apex redirect 308, and point the guides' links at www. This only wins brand searches, but nothing else happens until the page is in the index.
2. **"Latest from the network" strip** (proposed under "Keeping it fresh"). Three links, one to the newest post on each guide. It helps the guides more than this page: new posts get one more link and are found sooner, and the page changes when the guides do. It needs the guides' feeds and a build step, so it is a change to how the page is made.
3. **Card links to each guide's main sections**, for example Hike The Lakes' fell list, The Lakes Guide's things to do and The Lakes Wildlife's species. Useful for a visitor who knows what they want, and plain links, not calls to action. The gain is small because each guide already links to those pages from its own menus.
4. **More pages here: not worth it.** Network pages on Lake District subjects would compete with the guide that covers the same subject, on a domain with no authority. The same writing earns more on the guide. Posts a month on the network page: none.

## Keeping it fresh

The network page has no blog. Its job is to point to the three guides and take enquiries.

**Realistic rhythm:** a check once a quarter:
- the stats (the species count from The Lakes Wildlife's data, route guides on Hike The Lakes);
- the LDNPA visitor figure when the next year's figure is published;
- the year in the footer each January.

**A proposal for later, not built:** a small "Latest from the network" strip of three links, one to the newest post on each guide. It would give the page fresh internal links without new writing. It needs the three sites' feeds and a build step, so it is a change to how the page is made.

## Suggestions left for Damian

- **The privacy line beside the form, and a favicon:** both done (see the improvements table).
- **Vercel settings:**
  - make the apex redirect 308;
  - for visit counts, a database URL and a small function.
- **One claim to keep true.** The page now says only that businesses can pay to advertise and that adverts are labelled. When Pro opens on The Lakes Guide, the line can mention featured listings again.
- **Price recheck:** look at the advertising prices again in three months (mid-February 2027).

## Checks run

- `node --test tests/contact.test.mjs`: 9/9.
- No em dash in `index.html`, robots, sitemap or `api/contact.js`.
- JSON-LD parses.
- Screenshots at 1440, 1024, 768 and 390, checked as tiles.
- Overflow check from 320 to 1440.
- There is no package.json, so there is no build, lint or npm audit for this site.
