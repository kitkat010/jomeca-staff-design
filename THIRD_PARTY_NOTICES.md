# Third-party notices

## Shadcn Space

The October 28 staff court-rate cards adapt the free `card-24` image/content/footer composition from <https://shadcnspace.com/r/card-24.json>, reviewed with its declared dependencies. The adaptation uses existing React/Lucide components and scoped CSS, without adding Motion or overwriting shared primitives. Event fixtures, attendee avatars, fake locations and remote assets are excluded. Images reuse the already approved local sport photographs recorded in the media register; they are stock illustrations, not asserted photos of individual Jomeca courts. The Shadcn Space MIT notice below applies to this adaptation.

The reservation planner also adapts the free `calendar-02` selected-day styling and `calendar-03` inline calendar/time composition, reviewed October 20, 2026 from <https://shadcnspace.com/r/calendar-02.json> and <https://shadcnspace.com/r/calendar-03.json>. Random demo booked days, Faker and hardcoded appointment times are excluded. The adaptations use real server availability and existing button primitives. These adaptations are covered by the Shadcn Space MIT notice below.

The court selector and gallery lightbox compositions are adapted from the supplied `landingpage.com` React prototype's `services-02` and `gallery-05` Shadcn Space patterns. The adaptations replace the content, visuals, motion and styling; no remote images or premium templates are bundled. Source: <https://github.com/shadcnspace/shadcnspace>. Public license: <https://github.com/shadcnspace/shadcnspace/blob/main/LICENSE>.

MIT License

Copyright (c) 2026 Shadcn Space

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## shadcn/ui and other dependencies

Styled booking-report downloads use ExcelJS 4.4.0, MIT License, Copyright (c) 2014–2019 Guyon Roche. The complete license remains in `node_modules/exceljs/LICENSE`. Its UUID dependency is overridden to patched 11.1.1; the app uses ExcelJS for writing a controlled, locally authored template, not importing customer workbooks. The blank template at `apps/api/assets/reports/booking-report-template.xlsx` is original Jomeca report artwork generated with the bundled spreadsheet authoring tool and contains no customer records.

The October 27 staff sidebar adapts the official shadcn/ui Base Nova sidebar, button, input, separator, sheet, skeleton, tooltip and mobile hook from <https://ui.shadcn.com/r/styles/base-nova/sidebar.json> and its declared registry dependencies. Documentation: <https://ui.shadcn.com/docs/components/base/sidebar>. These sources use the shadcn MIT license reproduced below. Adaptations include Jomeca navigation, scoped colors, an external-store mobile hook, an editable-field shortcut guard, and memory-only collapse state. Existing public-site components are preserved. Base UI React 1.9.0 is MIT-licensed, Copyright (c) 2019 Material-UI SAS; its complete license is distributed in the installed package at `node_modules/@base-ui/react/LICENSE`. No premium blocks or remote assets were imported.

The button, accordion and dialog primitives follow shadcn/ui composition conventions and adapt the supplied prototype. See <https://github.com/shadcn-ui/ui/blob/main/LICENSE.md>. The upstream shadcn/ui project uses the MIT License, Copyright (c) 2023 shadcn.

MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Radix primitives, Lucide icons and the other npm dependencies retain their respective package licenses. Exact resolved packages are recorded in `package-lock.json`.

The calendar foundation uses MIT-licensed React DayPicker 10.0.2, date-fns 4.4.0 and transitive @date-fns/tz. Their license files remain with the installed packages. Sources: <https://github.com/gpbl/react-day-picker> and <https://github.com/date-fns/date-fns>.

## Staff dashboard composition

The October 27 overview adapts the user-supplied free `dashboard-shell-01` statistics, sales overview and earning-report chart composition, including Recharts hover details. Registry: <https://shadcnspace.com/r/dashboard-shell-01.json>. The three supplied code attachments contain identical block source. Jomeca replaces sample sales, countries, profiles, growth percentages and CRM actions with booking counts, net verified receipts by session date, status counts and authorized navigation. No remote avatars or illustrations are bundled. Source dependencies were reviewed: existing React 19, Tailwind 4 and TypeScript support the block; the adaptation adds only Recharts 3.10.1 (MIT, Copyright 2015-present recharts), with its complete license in `node_modules/recharts/LICENSE`. The Shadcn Space MIT notice above applies to the adapted composition. The earlier sidebar remains the user-selected shadcn Base UI implementation.

The October 24, 2026 staff redesign uses the user-provided Shadcn Space CRM dashboard as visual reference: <https://dashboard.shadcnspace.com/dashboards/crm-dashboard>. The sidebar, overview, charts, tables and scoped styles are original Jomeca code built with the existing shadcn/Radix foundation and Lucide icons. No dashboard source, premium templates, sample CRM data, proprietary assets or additional dependencies were imported. Existing component licenses above continue to apply.

## Artwork and media

Phase 6 adds locally served stock photographs by Mattia Graziani, Palak Pitroda, eedgar ivann and Fotógrafo Samuel Cruz under the Unsplash License, plus stock film by PNW Production, 林林 and Frank Schrader under the Pexels License. The hero combines trimmed/cropped clips from these three filmmakers. The user supplied and authorized the Jomeca Center logo separately. Source links, license links, review date, derivatives and usage limits are recorded in [the media register](MEDIA_SOURCES.md). This media is not covered by the component MIT licenses and is labelled as stock inspiration, not actual facility photography. No premium stock subscriptions or new registry imports were used.

The court and event artwork in `apps/web/src/components/court-art.tsx` is original schematic SVG artwork. It is not a photograph and does not assert actual finishes, dimensions or amenities. The location graphic is decorative, not a surveyed map. No images from the earlier prototype or reference websites have been redistributed.

The six sports glyphs in `apps/web/src/components/sports-ribbon.tsx` are original project SVG drawings. The accompanying Sparkles and pause/play icons come from the existing Lucide dependency and retain its package license.

## Lenis smooth scrolling

Locomotive's current scroll foundation uses Lenis. This project uses the standalone Lenis 1.3.27 package for eased public-page wheel scrolling, alongside original Jomeca reveal/parallax code. No Locomotive website assets, brand layout, typography code or animation source was copied. The official package has no runtime dependencies; installation used `--ignore-scripts`. Documentation reviewed October 21, 2026: <https://github.com/darkroomengineering/lenis> and <https://scroll.locomotive.ca/docs>.

The MIT License

Copyright (c) 2024 darkroom.engineering

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Dashboard Shell 01 adaptation — October 24, 2026

The staff shell and overview adapt the free `dashboard-shell-01` registry block, reviewed from <https://shadcnspace.com/r/dashboard-shell-01.json>. The source composition (sidebar/header, primary statistics with two secondary cards, activity chart, ring chart and table/widget grid) is adapted for React Router and the existing Jomeca API. The original commerce data, external profile imagery, premium promotion, placeholder destinations and sample charts are excluded. Existing Radix Dialog and Lucide primitives provide accessible navigation/search/account dialogs; no additional runtime dependency is installed. Charts render actual API summaries using HTML/SVG.

Free License — Copyright (c) 2026 Shadcn Space. License reviewed at <https://shadcnspace.com/license>:

Our UI materials are free to use. You are free to use these components and templates in personal projects, commercial projects, and client work. You can also share or distribute them if needed.

You may download, copy, change, share, use in personal or commercial projects, and sell projects built using this code without special permission. You must not scam anyone using the Shadcn Space name, pretend the components are your original product, use the Shadcn Space brand/logo/name as your own, or misuse or misrepresent its intellectual property. If you copy or share the software, include the copyright notice and this license text in all copies or important portions. The software is provided as is, without guarantees; Shadcn Space is not responsible for bugs, data loss, project issues or damage from use.

## PDF-LIB

Downloadable booking tickets and generated email acknowledgements use PDF-LIB 1.17.1. Reviewed <https://pdf-lib.js.org/> and the installed package license. PDF generation runs on the API and includes only booking/financial snapshot data, never customer access tokens or uploaded bank screenshots. Its standard-fonts, upng, pako and tslib dependencies retain their package licenses.

MIT License

Copyright (c) 2019 Andrew Dillon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The October 28 Gymnasium image uses cottonbro studio's [Gymnasium Wooden Floor](https://www.pexels.com/photo/gymnasium-wooden-floor-7201556/) under the [Pexels license](https://www.pexels.com/license/). Local responsive WebP variants are illustrative stock photographs. See `docs/media-register.md` for provenance and scope.
