---
title: Email Template Preview
glyph: ✉
tagline:
  en: Preview transactional emails with real order data, rendered like Gmail would
  da: Forhåndsvis transaktionsmails med rigtige ordredata, renderet som i Gmail
summary:
  en: A Shopware 6 admin plugin that renders transactional email templates against live customer and order data, with Gmail-style and device emulation, so teams can QA mail before customers see it.
  da: Et Shopware 6-admin-plugin, der renderer transaktionsmails med rigtige kunde- og ordredata samt Gmail- og enhedsemulering, så teams kan kvalitetssikre mails, før kunderne ser dem.
category: professional
order: 9
role: Developer
context: WEXO A/S internship · universal customer platform
start: 2025-09
dateApprox: true
stack: [PHP, Shopware 6, Symfony, Vue, Twig, SCSS, DAL]
repos: []
---

## The problem

Transactional emails were hard to verify before release: the stock editor only shows placeholder data and has no rendering fidelity. Validating a template against a complex order meant placing test orders through the storefront.

## What I built

A Shopware 6 admin plugin that previews email templates rendered with **real customer and order data** pulled live from the Data Abstraction Layer. It handles almost all nested and configurable `OrderLineItem` structures through simple association tweaks. It doesn't just inject data: it **emulates how the mail actually renders**, including a Gmail-style mode and device/client emulation - and a test mail can be sent straight from the editor.

## Highlights

- Real DAL data instead of placeholders
- Gmail-style rendering and device emulation
- Preview + test-send controls inside the admin mail-template editor, backed by admin-API endpoints
- Removed the need for storefront test orders; faithful previews reduce deployment errors and raise release confidence
