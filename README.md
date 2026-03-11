# EvenFeed Demo

Static demo for a unified ticket feed with:

- `index.html`: admin console for provider settings, feed rules, API-managed mode, widget preview, and embed code
- `widget.html`: standalone embeddable widget surface
- `app.js`: shared state, preview logic, mock provider adapters, and API/direct-mode seams
- `styles.css`: dashboard and widget styling

## Run it

Open [index.html](C:\Users\iampa\OneDrive\Documents\New project\index.html) in a browser, or serve the folder locally if you want to test direct Ticketmaster requests.

## Modes

- `Demo`: uses bundled mock Ticketmaster and Tickets.com events
- `API managed`: expects your backend to own provider credentials and return normalized event JSON
- `Browser direct`: calls Ticketmaster Discovery directly when an API key is present; Tickets.com stays mocked because that integration is typically partner-gated

## Suggested backend contract

`POST /api/integrations/config`

```json
{
  "mode": "api",
  "providers": {
    "ticketmaster": {
      "enabled": true,
      "apiKey": "server-side",
      "source": "ticketmaster",
      "countryCode": "US"
    },
    "ticketscom": {
      "enabled": true,
      "baseUrl": "https://provider.example.com",
      "tenant": "club-slug",
      "token": "server-side"
    }
  },
  "filters": {
    "city": "Chicago",
    "classification": "music",
    "keyword": "",
    "startDate": "2026-03-11",
    "daysOut": 45
  },
  "widget": {
    "title": "Live event inventory",
    "subtitle": "Unified tickets from your primary providers.",
    "theme": "night-market",
    "layout": "stack",
    "maxItems": 6,
    "showPrice": true
  }
}
```

`GET /api/feed/events`

```json
{
  "events": [
    {
      "id": "provider-event-id",
      "provider": "Ticketmaster",
      "providerKey": "ticketmaster",
      "title": "Sample Event",
      "venue": "Venue Name",
      "city": "Chicago",
      "dateTime": "2026-03-21T19:30:00-05:00",
      "priceFrom": 59,
      "category": "music",
      "url": "https://tickets.example.com/event/123",
      "badge": "Live"
    }
  ]
}
```
