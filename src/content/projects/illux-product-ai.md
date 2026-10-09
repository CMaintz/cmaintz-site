---
title: Illux Product AI
glyph: ◈
tagline:
  en: Generative-AI product enrichment & room visualization for Shopware 6
  da: Generativ AI til produktberigelse og rumvisualisering i Shopware 6
summary:
  en: A production Shopware 6 plugin that turns product images into multilingual copy, SEO, categories and tags with generative AI, and lets shoppers see artwork on their own wall before buying. Designed, built and deployed as sole developer.
  da: Et Shopware 6-plugin i produktion, der omdanner produktbilleder til flersproget tekst, SEO, kategorier og tags med generativ AI, og lader kunder se kunstværket på deres egen væg, før de køber. Designet, bygget og udrullet som eneste udvikler.
areas: [ai, backend, platform]
frontend: true
aiPowered: true
category: professional
order: 1
featured: true
role: Sole developer - design through production
context: WEXO A/S internship · client Illux · final exam project
start: 2025-10
end: 2026-01
stack: [PHP 8.2+, Shopware 6.6-6.7, Symfony Messenger, RabbitMQ, Google Gemini, Generative AI / LLM APIs, TypeScript, Vue, SSE, MySQL]
repos: [ai-auto-product-enrichment]
live: https://www.illux.dk/illu-grafica/eye-on-the-ball/?material=17782-mat-fine-art-papir-230g
metrics:
  - value: "3,000+"
    label: { en: products enriched, da: produkter beriget }
  - value: "100s"
    label: { en: of hours of manual work saved, da: af timers manuelt arbejde sparet }
  - value: "4+"
    label: { en: languages per call (configurable), da: sprog pr. kald (konfigurerbart) }
---

## The problem

Illux sells artwork online, and the categories, tags, metadata and translations for its catalogue didn't exist in any data source. Every product's description, SEO metadata, categories and per-language translations (Danish, English, Norwegian, Swedish) had to be written by hand, a large and recurring cost as the catalogue grew. At the other end of the funnel, wall art is hard to sell online because customers can't picture it on their wall.

## What I built

A Shopware 6 plugin with two halves, a **PHP 8.2+** backend, a **Vue** admin UI and a **TypeScript** storefront, built end to end as sole developer: problem framing, design, data modelling, implementation, testing, deployment and operation. I made the key technical decisions (messaging, processing flow, resilience) in close dialogue with my mentor, the project lead and the customer.

It started as an ambitious exam project where only part was expected to get built. It was finished in full and deployed to production a few days before the internship ended.

**Product enrichment.** Product images, plus name, manufacturer and attributes, go to a generative-AI API through a shared, **provider-agnostic abstraction layer**, and come back as schema-enforced JSON: SEO metadata, customer-facing descriptions and whitelisted property, category and tag assignments in every configured language from a single call (four at launch).

Each call carries up to six products, with a system instruction, the prompt and an enforced JSON response schema; the exam version runs on **Google Gemini** (2.5 Flash for analysis, 2.5 Flash Image for scenes). Length limits are settings too: meta title 60 characters, meta description 155, description 500, five keywords per language by default. Processing runs asynchronously through **Symfony Messenger over RabbitMQ**, so batches never block a web request.

**Properties the shop can trust.** The AI fills artwork properties such as style, subject and mood from a **whitelist of the shop's existing options**. When nothing fits, it may propose a new option, but proposals land in an admin queue and are only added once approved.

**Artwork visualization.** On the product page, shoppers choose frame, size and approximate print material, then pick curated room scenes or **upload a photo of their own room**. The piece is composited into each scene with frame-accurate rendering (the product's frame-corner reference images guide the frame, the artwork's real dimensions lock its aspect ratio, and furniture in the room serves as a scale reference), and each tile updates the moment it's ready over **server-sent events**. An admin module generates new photorealistic interiors from structured photographic parameters (scene type, décor style, lens, angle, lighting, mood, palette), held in a pending-approval queue, with a prompt preview before anything is generated. Try it live on an Illux product page: click "visualiser i flere rum".

## Technical highlights

- **Event-driven modular monolith** - architecture chosen from concrete analysis of payload sizes, product volume and scaling needs
- **Schema-enforced AI output** - no brittle text parsing; every configured language in one call; the LLM provider can be swapped without touching domain logic
- **Resilient batching** - up to 500 products per run (6 per API call, 30 per queue chunk), retry with exponential backoff, rate limiting and caching against external AI services. Result records are created up front, so a redelivered message can't produce duplicates; jobs report live progress, can be cancelled mid-run, and watch their own memory use
- **Configurable confidence heuristics** - the model's per-field confidence, weighted per field, minus deterministic penalties for short or over-long text, too few keywords, generic stock phrases, hedging words, cross-language duplicates, missing or uncertain properties and incomplete responses. Every weight, penalty, threshold and word list is a setting, the total penalty is capped, and each penalty leaves a plain-language warning for the reviewer
- **Human-in-the-loop approval** - a transaction-safe workflow with an adjustable review threshold; the customer can switch off review routing (full auto-apply) or auto-apply (everything reviewed)
- **Time-savings dashboard** - hours saved, calculated from configurable minutes per description, per extra translation, per SEO set and per property
- **Full audit trail** - reviewer, exact prompt, model + version, confidence, approval history and batch provenance for every analysis
- **Evaluation & regression harness** - compares models and prompt strategies on average confidence, and catches quality drift across model and prompt changes
- **Deliberate patterns** - orchestrators per workflow, Builder + Director for prompts, factories for requests and schemas, Message/Handler commands, cache-invalidating subscribers
- **Hands-off operation** - a scheduled task analyses new artwork products automatically (every 8 hours by default), a second cleans up old jobs, and a CLI command and admin API cover bulk runs
- **Deep Shopware integration** - custom DAL entities + translations, 8 migrations, installers, cache-invalidating subscribers, and a Vue admin module in Danish and English

## Result

For most of the catalogue it **eliminated manual enrichment work entirely** across **3,000+ products**, saving **hundreds of hours** of manual work. It became a **business-critical part of Illux's platform**, is still in daily use, and laid the foundation for an upcoming crowdsourced artwork platform. The visualization shipped with the new storefront, with the aim of lifting product-page conversion and reducing returns caused by size or appearance mismatch.

> The public repository is the version handed in for my exam, not the polished version running for the customer.
