# BRT timetable page fixtures

Captured 2026-09-24 with `curl -L`, a desktop Chrome User-Agent and
`Accept-Language: ja`. Both pages returned HTTP 200 with no redirect — the final
URL equals the requested one in each case.

| File | URL | Bytes |
|---|---|---|
| `b02-kachidoki-brt.html` | https://www.tokyo-brt.co.jp/bus-stops/b02-kachidoki-brt | 325,433 |
| `b11-toranomon-hills.html` | https://www.tokyo-brt.co.jp/bus-stops/b11-toranomon-hills | 61,484 |

## Where the timetable comes from

**The full timetable is in the static HTML of each page.** There is no XHR, no
JSON endpoint, no separate timetable page and no PDF involved: the departure
times are server-rendered into `<table>` elements and are present in the bytes
saved here. No rendered-DOM capture was needed, and no additional source file has
been saved, because there is no additional source.

The only JavaScript on the page (an inline `window.onload` at the end of the
article) copies an `h1` string into place. The tab switching is pure CSS —
`<input type="radio" class="checker">` plus `<label class="tab">` — so **every
tab's table is in the HTML at once**, including the ones not visible on load.

Structure, common to both pages:

```
div#stop-time-table
└── div.tab-box
    ├── input.checker#tab1 … #tab3      (radio; CSS-only tab switching)
    ├── div.tab-menu  →  label.tab per direction
    └── div.tabItem#tabItem1 … #tabItem3
        ├── div.weekday-block  →  table.table-tt.weekday   (平日)
        ├── div.holiday-block  →  table.table-tt.holiday   (土休日)
        ├── legend <p> lines
        └── div.update > span.marker    (the as-of date)
```

Inside a table, one `<tr>` is one hour: `<th class="bg11">` holds the hour and the
`<td>` holds one `div.item` per departure:

```html
<div class="item">
    <div class="time green">31</div>
    <div class="subs">
        <div class="sub">虎<span class="noPrint">ノ門</span></div>
        <div class="sub">&nbsp;</div>
    </div>
</div>
```

An hour with no service still emits one `div.item` whose `div.time` is `&nbsp;`.

## Telling Toranomon Hills departures from Shimbashi ones (Kachidoki)

This is the `tabItem1` table only — the 【B01】新橋・【B11】虎ノ門ヒルズ direction.

**The mark is the character 虎, in `div.sub` inside the departure's `div.subs`.**
An unmarked departure has `<div class="sub">&nbsp;</div>` instead. There is no
icon and no dedicated CSS class on the mark — the discriminator is the text
content of `div.sub`.

The mark is written so that print and screen differ:

```html
<div class="sub">虎<span class="noPrint">ノ門</span></div>
```

On screen it reads **虎ノ門**; in print, `.noPrint` is hidden so it reads **虎**.
Either way, testing whether `div.sub` starts with 虎 is the robust check.

The legend, verbatim from the page (both lines live, not commented out):

```html
<p>無<span class="noPrint">印</span>：【B01】新橋 止まり</p>
<p>虎<span class="noPrint">ノ門</span>：【B11】虎ノ門ヒルズ行</p>
```

which reads on screen as:

> 無印：【B01】新橋 止まり
> 虎ノ門：【B11】虎ノ門ヒルズ行

So: **marked 虎 → 虎ノ門ヒルズ行 (Toranomon Hills); unmarked → 新橋止まり
(terminates at Shimbashi).** In the weekday table that is 59 marked against 113
unmarked, 172 departures in total.

### Do not use the colour class

`div.time` also carries `blue` or `green`. **It does not encode the destination.**
In the `tabItem1` weekday table the marks split 113 / 59 while the colours split
121 blue / 51 green — different numbers, and departures such as `28虎{blue}` and
`26{green}` occur, so the two are independent. The colour legend that would
explain it (`：幹線ルート` / `：晴海・豊洲ルート`) is **commented out** in the
HTML and is not shown to a reader.

## Weekday / Saturday / holiday split

**There is no separate Saturday timetable.** Each direction has exactly two
tables, in the same tab, one after the other — not tabs, not headings:

| Block | Table class | `<thead>` label |
|---|---|---|
| `div.weekday-block` | `table.table-tt.weekday` | 平日 |
| `div.holiday-block` | `table.table-tt.holiday` | 土休日 |

So Saturday is folded in with holidays as 土休日. Both pages also carry this note:

> ＊お盆期間（8/13～15）及び年末年始（12/30～1/3）については土休日ダイヤで運行いたします＊

## Directions listed

**`b02-kachidoki-brt.html` lists three directions**, as three CSS tabs. Note the
DOM order is not the display order — `tabItem2` is shown third:

| Tab | Direction | Marks used (weekday) |
|---|---|---|
| `tabItem1` (shown 1st, `checked`) | 【B01】新橋・【B11】虎ノ門ヒルズ 行 | 虎ノ門, else unmarked |
| `tabItem3` (shown 2nd) | （幹線ルート）【B05】国際展示場・【B06】東京テレポート 行 | テレ, else unmarked |
| `tabItem2` (shown 3rd) | （晴海・豊洲ルート）【B22】晴海BRT・【B23】豊洲・【B03】ミチノテラス豊洲 行 | 豊洲, ミチ, 晴海 (none unmarked) |

**`b11-toranomon-hills.html` lists one direction only** — southbound. Toranomon
Hills is the northern terminus, so there is nothing to list the other way. Its
single tab covers both routes at once and its heading is the two run together:

> （幹線ルート）【B03】豊洲市場前・【B05】国際展示場行（晴海・豊洲ルート）【B22】晴海BRTターミナル・【B23】豊洲・【B03】ミチノテラス豊洲行

Its legend (all four lines live):

> 晴海：【B22】晴海BRTターミナル 止まり
> 豊洲：【B23】豊洲 止まり
> ミチ：【B03】ミチノテラス豊洲 行
> 国展：【B05】国際展示場 行

On this page **every departure carries a mark** — there is no unmarked case — and
`div.time` carries **no colour class at all**.

## "Effective from" date

**Neither page shows a 改正 date.** What both show, once per tab, is an as-of
date in `div.update > span.marker`:

> 2026年09月16日現在

## Parsing traps found while reading these files

1. **Commented-out legends.** Both pages carry several legend blocks inside
   `<!-- -->`, including ones naming marks the table does not use (市場 on b11,
   the colour legend on b02). Strip comments before reading legends or you will
   attribute marks that are not shown.
2. **An uppercase `<P>` tag.** On `b11-toranomon-hills.html` the ミチ legend line
   is `<P>ミ<span class="noPrint">チ</span>：…</P>` — uppercase open and close.
   A case-sensitive `<p>` match silently drops it, and ミチ is the most-used mark
   on that page.
3. **`html.parser` mis-nests the Kachidoki tab-1 legend.** In document order the
   legend sits inside `div#tabItem1` (offset ~162.7k, before `tabItem2` at
   ~163.5k), but BeautifulSoup's `html.parser` closes the tab early and
   `tabItem1.find_all("p")` returns nothing. Locate legends by position, or use a
   more forgiving parser.
4. **Full-width characters.** The legends mix ＢＲＴ (full-width) on b02 with BRT
   (half-width) on b11 for the same stop, and use the full-width colon ：.
5. **Two departures in the same minute.** Legitimate, e.g. Kachidoki weekday
   13:45 has both a 虎 and an unmarked departure. Do not de-duplicate on time.

## Weekday timetables, read off the pages

Minutes are listed per hour in the order printed. On the Kachidoki tables a
trailing mark is the destination mark; no mark means the unmarked case named in
that tab's legend. `—` is an hour with no service.

### b02 Kachidoki — 【B01】新橋・【B11】虎ノ門ヒルズ 行 — 平日
`虎` = 虎ノ門ヒルズ行; unmarked = 新橋止まり.

```
 5  —
 6  12  31虎  46虎  58
 7  05  07虎  16  26  28虎  38虎  42虎  46  54虎  57
 8  01虎  05  09虎  13  15虎  21  25虎  29  31虎  36  41虎  49  51虎  58虎
 9  06虎  09  18  26虎  27  35  45  46虎  54
10  01虎  03  07  15  16虎  23  31虎  33  41  50  51虎  58
11  06虎  07  16  22  26虎  30  37  45  46虎  52
12  00  06虎  08  15  22  26虎  30  37  45  46虎  52
13  00  06虎  08  16  22  26虎  30  37  45虎  45  52  57
14  01虎  07  16  21虎  23  30  36虎  37  45  52  58虎
15  01  09  11虎  17  22  27  32虎  34  40  46虎  47  54
16  01  06虎  07  15  21  21虎  26  32  38  41虎  44  51
17  00  01虎  04  10  16  16虎  22  28  31虎  35  40  45  51  51虎  56
18  00  06虎  09  17  22  26虎  27  31  39  41虎  47  56
19  01虎  08  15虎  16  27  33虎  39  50  50虎
20  04  13虎  18  32虎  33  46  52虎  58
21  12虎  13  29  32虎  43  52虎
22  03  14虎  25  33  45
```

172 departures: 59 marked 虎 (Toranomon Hills), 113 unmarked (Shimbashi).

### b02 Kachidoki — （幹線ルート）【B05】国際展示場・【B06】東京テレポート 行 — 平日
`テ` = 東京テレポート行; unmarked = 国際展示場行.

```
 5  —
 6  25  49
 7  10  19  30  39  48  58
 8  07  11  15  20  27  31  35  39  44  48  55
 9  01  05  09  16  23  32  37  41  49  58
10  08  17テ  21  29  37  47  55
11  04  12  21  30  36  44テ  51  59
12  06  14  22  29テ  36  44  51  59
13  06  14テ  22  30  36  44  51  59
14  06  11  21テ  30  37  44  51  59
15  06  15  23テ  31  36  41  48  54
16  01  08  15  21  29  35  40  46  52  58
17  05  14  18  23  30  36  42  47  54  59
18  05  08  14  23  34  45
19  01  10  20  30  41  53
20  04  17  31  46  59
21  11  26  42  56
22  16  38
```

119 departures: 6 marked テ, 113 unmarked.

### b02 Kachidoki — （晴海・豊洲ルート）【B22】晴海BRT・【B23】豊洲・【B03】ミチノテラス豊洲 行 — 平日
`豊` = 豊洲止まり; `ミ` = ミチノテラス豊洲行; `晴` = 晴海BRTターミナル止まり.

```
 5  —
 6  —
 7  09豊  24豊  39豊
 8  01豊  19豊  34豊  49豊
 9  09豊  24豊  44豊  59ミ
10  19ミ  34豊  54豊
11  09豊  29豊  44豊  59豊
12  19ミ  39ミ  59豊
13  19豊  39豊  59豊
14  19豊  39ミ  59豊
15  09豊  31豊  44豊
16  09豊  24豊  44豊  59豊
17  19豊  34豊  54豊
18  09豊  29豊  44豊
19  04豊  14ミ  34豊  49豊
20  04豊  24ミ  44ミ
21  04ミ  24ミ  44ミ
22  04晴  24ミ  46ミ
```

53 departures: 39 豊, 13 ミ, 1 晴. None unmarked.

### b11 Toranomon Hills — southbound (both routes) — 平日
`豊` = 豊洲止まり; `ミ` = ミチノテラス豊洲行; `国` = 国際展示場行; `晴` = 晴海BRTターミナル止まり.

```
 5  —
 6  56豊
 7  11豊  26豊  48豊  59国
 8  05豊  15国  20豊  32国  35豊  49国  55豊
 9  00国  10豊  21国  30豊  45ミ
10  05ミ  20豊  40豊  55豊
11  15豊  30豊  45豊
12  05ミ  25ミ  45豊
13  05豊  25豊  45豊
14  05豊  25ミ  45豊  55豊
15  17豊  30豊  55豊
16  10豊  30豊  45豊
17  05豊  20豊  40豊  55豊
18  15豊  30豊  50豊
19  00ミ  20豊  35豊  50豊
20  10ミ  30ミ  50ミ
21  10ミ  30ミ  50晴
22  10ミ  32ミ
```

59 departures: 39 豊, 13 ミ, 6 国, 1 晴. None unmarked.
