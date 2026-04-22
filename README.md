# The Hourly Chronicle

A newspaper-style website where an AI newsroom agent generates and updates stories automatically.

## Features

- Classic newspaper-inspired layout with standard sections (World, Politics, Business, Technology, Sports, Entertainment, Lifestyle).
- Slick modern visual refresh with elevated cards, sticky glass-style header, and responsive layouts.
- AI agent scheduler that runs every hour to:
  - create new articles,
  - add live updates to ongoing stories.
- AI-powered **News Forecast** section that predicts likely developments for the next 6–24 hours.
- Manual **Run Agent Now** button for editors/demos.
- Per-article comment sections where readers can engage.
- Comments are persisted in browser local storage.

## Run locally

Open `index.html` in a browser.

> Tip: For a local server, you can run:
>
> ```bash
> python3 -m http.server 8080
> ```
