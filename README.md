# Zuhause Weather Card

A layered layout weather card for Home Assistant focusing on animated atmospheric effects and time-of-day visuals. 

## Features

- Layered architecture (Sky, Weather effects, Icon, Text)
- Astro time-of-day gradients
- Volumetric fog and layered snow effects
- Lightning flashes and rain splashes
- Dawn/dusk horizon motion
- Separated forecast entity support
- Native Home Assistant UI Editor support - no YAML necessary
- Standard tap actions
- Dynamic upcoming forecast hints

## Installation

### HACS (planned)
Installation via the Home Assistant Community Store (HACS) is not yet available, but planned.

### Manual Installation

1. Download the `modern-weather-card.js` and `modern-weather-card-editor.js` files from this repository.
2. Create a folder named `modern-weather-card` inside your Home Assistant `config/www` directory. If you dont know how to access your files inside Home Assistant, check out the Studio Code Server Addon: `https://github.com/hassio-addons/addon-vscode`
   *(Note: if you don't have a `www` directory in your config folder, create one).*
3. Place both `.js` files into the newly created `/config/www/modern-weather-card/` folder.
4. Go to your Home Assistant dashboard, navigate to **Settings -> Dashboards -> Resources (three dots in the top right)**.
5. Click **Add Resource** and paste the following URL:
   `/local/modern-weather-card/modern-weather-card.js`
   *(Optional: If you are upgrading from an older version of the card, append the version number, for example `?v=0.1.0` at the end to try and bust the cache)*
6. Ensure the resource type is set to **JavaScript Module**.
7. Save, reload your browser and dashboard.

## Configuration

Add the card to your dashboard. It can be configured via the visual UI editor or using YAML.

### YAML Variables

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `entity` | string | **Required** | The primary weather entity block to track. |
| `name` | string | `""` | Custom label for the location. |
| `show_forecast` | boolean | `true` | Display the multi-day forecast section. |
| `show_low_temp` | boolean | `false` | Display low temperatures in the forecast. |
| `show_no_temp` | boolean | `false` | Hide temperatures entirely from the forecast. |
| `forecast_days` | number | `5` | Define the number of days rendered in the forecast summary. |
| `animated` | boolean | `true` | Toggle visual animations. |
| `sun_entity` | string | `sun.sun` | Entity used to determine time-of-day gradients. `sun.sun` is enabled by default in Home Assistant. This should help show sunset / night visuals depending on your location and season. |
| `time_format` | string | `default` | Override time display: `default` uses your users setting. Custom overrides with `12`, or `24`. |
| `alert_lookahead` | number | `12` | Hours ahead to scan for upcoming weather events (1-24). |
| `forecast_entity` | string | `config.entity` | Separate entity to source the forecast array, if different from primary. |
| `tap_action` | object | `{ action: 'more-info' }` | Standard Home Assistant action triggered on physical tap/click. |
