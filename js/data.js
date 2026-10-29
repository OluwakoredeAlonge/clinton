/* Placeholder content. The backend will replace WORKS / EXHIBITIONS with API data of the same shape.
   Each work:  { id, title, year, cat, medium, w, h (cm), status, price, exh, desc, image? }
   When `image` is set it is used instead of the generated placeholder. */
(function () {
  const ARTIST = {
    name: 'Clinton Vane', first: 'Clinton', last: 'Vane',
    tagline: 'Painter, full time since 2011',
    email: 'studio@clintonvane.art', phone: '+000 000 000 0000',
    address: 'Studio 4, The Foundry, 12 Mill Lane', city: 'Your City',
    social: [['Instagram', '#'], ['YouTube', '#'], ['Vimeo', '#']],
  };

  const W = (id, title, year, cat, medium, w, h, style, pal, status, price, exh, desc) =>
    ({ id: 'w' + id, title, year, cat, medium, w, h, style, pal, seed: 'clinton-' + id, status, price, exh, desc });

  const WORKS = [
    // The Weight of Light — 2026
    W(1, 'First Light on the Ledger', 2026, 'Landscape', 'Oil on linen', 180, 120, 'landscape', 'ember', 'Available', 24000, 'e2026', 'The hour before the heat arrives, when every surface is still deciding what colour it will be.'),
    W(2, 'Harmattan Noon', 2026, 'Landscape', 'Oil on linen', 150, 100, 'landscape', 'ochre', 'Available', 18500, 'e2026', 'Dust turns the sun into a coin. Painted over eleven mornings from the same hillside.'),
    W(3, 'Where the Gold Settles', 2026, 'Abstract', 'Oil and cold wax on canvas', 200, 150, 'abstract', 'ochre', 'Reserved', 28000, 'e2026', 'Built from thin glazes, scraped back and rebuilt until the surface held its own light.'),
    W(4, 'Kiln Hour', 2026, 'Still life', 'Oil on panel', 80, 100, 'stilllife', 'clay', 'Available', 9800, 'e2026', 'A potter\'s shelf at the end of a firing: heat still travelling through the clay.'),
    W(5, 'Woman Holding the Window', 2026, 'Portrait', 'Oil on linen', 90, 120, 'portrait', 'rose', 'Available', 14200, 'e2026', 'A sitter who asked to be painted facing the light, not the painter.'),
    W(6, 'Dust, Then Water', 2025, 'Abstract', 'Acrylic on canvas', 240, 180, 'abstract', 'tide', 'Available', 36000, 'e2026', 'The largest canvas of the series. Two weather systems meeting on a single plane.'),
    W(7, 'Four O\'Clock Verandah', 2026, 'Figurative', 'Oil on linen', 120, 160, 'figurative', 'ember', 'Sold', null, 'e2026', 'Three figures, one long shadow, and the quiet of an afternoon with nowhere to be.'),
    W(8, 'The Long Burn', 2026, 'Abstract', 'Oil on linen', 220, 140, 'colorfield', 'ember', 'Available', 31000, 'e2026', 'Stacked fields of colour that glow from underneath, like coals under ash.'),
    W(9, 'Ember Study II', 2026, 'Abstract', 'Mixed media on board', 50, 60, 'abstract', 'ember', 'Available', 3200, 'e2026', 'A small study for The Long Burn, made in a single afternoon.'),
    W(10, 'After the Burn', 2026, 'Landscape', 'Oil on linen', 160, 110, 'landscape', 'dusk', 'Available', 21000, 'e2026', 'The field the morning after. Smoke, and a surprising amount of green.'),
    // Tidewater — 2024
    W(11, 'Low Tide, Sunday', 2024, 'Seascape', 'Oil on linen', 200, 130, 'seascape', 'tide', 'Sold', null, 'e2024', 'The whole coast exhaling.'),
    W(12, 'Salt Line', 2024, 'Seascape', 'Oil on linen', 160, 100, 'seascape', 'tide', 'Private collection', null, 'e2024', 'Where the water stops being a rumour and becomes a horizon.'),
    W(13, 'The Boats Wait', 2023, 'Seascape', 'Oil on panel', 120, 80, 'seascape', 'indigo', 'Sold', null, 'e2024', ''),
    W(14, 'Undertow', 2024, 'Abstract', 'Acrylic on canvas', 180, 180, 'abstract', 'tide', 'Sold', null, 'e2024', 'Painted from memory of a swim that went further than planned.'),
    W(15, 'Fisherman\'s Daughter', 2024, 'Portrait', 'Oil on linen', 70, 90, 'portrait', 'clay', 'Private collection', null, 'e2024', ''),
    W(16, 'Harbour Lights', 2024, 'City', 'Oil on linen', 150, 100, 'city', 'indigo', 'Sold', null, 'e2024', ''),
    W(17, 'Flood Season', 2024, 'Seascape', 'Watercolour on paper', 56, 76, 'seascape', 'tide', 'Available', 4800, 'e2024', 'A rare watercolour: three washes, no corrections.'),
    // Hours of Rain — 2022
    W(18, 'Hours of Rain', 2022, 'City', 'Oil on linen', 200, 150, 'city', 'dusk', 'Private collection', null, 'e2022', 'The title piece. A city reflected in itself.'),
    W(19, 'Umbrella Market', 2022, 'Figurative', 'Oil on linen', 140, 100, 'figurative', 'dusk', 'Sold', null, 'e2022', ''),
    W(20, 'Wet Tarmac', 2022, 'City', 'Oil on panel', 120, 90, 'city', 'rose', 'Sold', null, 'e2022', ''),
    W(21, 'Green After', 2022, 'Landscape', 'Oil on linen', 130, 90, 'landscape', 'moss', 'Available', 12500, 'e2022', 'What the land does with a week of rain.'),
    W(22, 'Thunder Study', 2021, 'Abstract', 'Ink on paper', 60, 80, 'ink', 'mono', 'Sold', null, 'e2022', ''),
    W(23, 'Mother at the Door', 2022, 'Portrait', 'Oil on linen', 80, 100, 'portrait', 'moss', 'Private collection', null, 'e2022', ''),
    // Quiet Furnace — 2020
    W(24, 'Quiet Furnace', 2020, 'Abstract', 'Oil on linen', 170, 130, 'colorfield', 'clay', 'Private collection', null, 'e2020', 'Made in the first winter of studio isolation.'),
    W(25, 'Bowl, Lemon, Lamp', 2020, 'Still life', 'Oil on panel', 50, 40, 'stilllife', 'ochre', 'Sold', null, 'e2020', ''),
    W(26, 'Self, Seven Months In', 2020, 'Portrait', 'Oil on linen', 60, 80, 'portrait', 'mono', 'Private collection', null, 'e2020', ''),
    W(27, 'Empty Market', 2020, 'City', 'Acrylic on canvas', 100, 80, 'city', 'clay', 'Sold', null, 'e2020', ''),
    W(28, 'The Window Remains', 2020, 'Still life', 'Gouache on paper', 40, 50, 'stilllife', 'jade', 'Sold', null, 'e2020', ''),
    // Inheritance of Colour — 2018
    W(29, 'Grandfather\'s Cloth', 2018, 'Abstract', 'Mixed media on canvas', 150, 150, 'abstract', 'rose', 'Private collection', null, 'e2018', ''),
    W(30, 'Indigo Elders', 2018, 'Figurative', 'Oil on linen', 130, 170, 'figurative', 'indigo', 'Sold', null, 'e2018', ''),
    W(31, 'Market of Reds', 2018, 'Abstract', 'Acrylic on canvas', 110, 140, 'abstract', 'ember', 'Sold', null, 'e2018', ''),
    W(32, 'Mango Season', 2018, 'Still life', 'Oil on panel', 60, 60, 'stilllife', 'ochre', 'Sold', null, 'e2018', ''),
    W(33, 'Road to the Village', 2017, 'Landscape', 'Oil on linen', 120, 80, 'landscape', 'moss', 'Sold', null, 'e2018', ''),
    // First Harvest — 2016
    W(34, 'First Harvest', 2016, 'Landscape', 'Oil on linen', 100, 70, 'landscape', 'ochre', 'Private collection', null, 'e2016', ''),
    W(35, 'Cassava Women', 2016, 'Figurative', 'Oil on linen', 90, 120, 'figurative', 'clay', 'Sold', null, 'e2016', ''),
    W(36, 'Red Earth Study', 2015, 'Landscape', 'Charcoal on paper', 50, 70, 'ink', 'mono', 'Sold', null, 'e2016', ''),
    W(37, 'Boy with Kite', 2016, 'Portrait', 'Oil on linen', 60, 80, 'portrait', 'indigo', 'Private collection', null, 'e2016', ''),
    W(38, 'Cathedral of Rust', 2016, 'Abstract', 'Oil on linen', 100, 100, 'colorfield', 'clay', 'Sold', null, 'e2016', ''),
    // Studio / unaffiliated
    W(39, 'Studio Floor, Midnight', 2025, 'Abstract', 'Mixed media on canvas', 90, 90, 'abstract', 'jade', 'Available', 7400, null, 'Everything the floor has ever caught.'),
    W(40, 'Palm Wine Hour', 2025, 'Figurative', 'Oil on linen', 100, 140, 'figurative', 'jade', 'Available', 13800, null, ''),
    W(41, 'Monsoon Mountain', 2025, 'Landscape', 'Ink on rice paper', 70, 100, 'ink', 'mono', 'Available', 5200, null, ''),
    W(42, 'Rooftops, Eleven PM', 2025, 'City', 'Oil on linen', 90, 120, 'city', 'dusk', 'Available', 11200, null, ''),
    W(43, 'Blue Hour Portrait', 2025, 'Portrait', 'Pastel on paper', 50, 65, 'portrait', 'indigo', 'Available', 3900, null, ''),
    W(44, 'Study for a Sun', 2025, 'Landscape', 'Watercolour on paper', 38, 28, 'landscape', 'rose', 'Available', 1800, null, ''),
  ];

  const QUOTES = {
    a: ['Paint this ambitious does not ask permission. It simply arrives, and the room rearranges itself around it.', 'Meridian Arts Journal'],
    b: ['Vane has the rare ability to make scale feel intimate. You walk into a canvas the way you walk into a memory.', 'The Quarterly Brush'],
    c: ['The most generous colourist working in oil today.', 'Daily Chronicle · Culture'],
  };

  const EXHIBITIONS = [
    {
      id: 'e2026', edition: 6, title: 'The Weight of Light', subtitle: 'Ten large paintings on heat, dust and the hour after the burn.',
      start: '2026-10-10', end: '2026-12-06', venue: 'The Grand Hall Gallery', city: 'Your City', address: '1 Museum Avenue',
      curator: 'Amara Lindqvist', hours: 'Tue – Sun, 10:00 – 18:00 · Late Thursdays until 21:00', tickets: 'Free entry · Opening-night by invitation',
      cover: { seed: 'cover-2026', style: 'landscape', pal: 'ember' }, accent: '#e8702f',
      pull: 'Light has weight. You only notice when it leaves.',
      statement: [
        'For two years I have been chasing a single sensation: the moment a landscape stops being a place and becomes a temperature. These ten paintings are my attempt to hold that moment still long enough to be looked at.',
        'The largest canvases were painted standing on a ladder, with brushes tied to broom handles. I wanted the body to remember how far a horizon actually is.',
        'The show moves from first light to the last ember. Walk it slowly, and in order, if you can.',
      ],
      rooms: [
        { name: 'Morning Ledger', wall: '#1b1512', text: 'Early light, low sun. The hour of promises.', workIds: ['w1', 'w2', 'w3'] },
        { name: 'Noon, Unforgiving', wall: '#201a14', text: 'Heat, dust and the people who work through it.', workIds: ['w4', 'w5', 'w6', 'w7'] },
        { name: 'After the Burn', wall: '#17110f', text: 'Embers, smoke, and the green that follows.', workIds: ['w8', 'w9', 'w10'] },
      ],
      press: [QUOTES.a, QUOTES.b],
      installation: [['Main hall, looking east', 'inst-a1', 'landscape', 'ember'], ['Room two at opening', 'inst-a2', 'abstract', 'ochre'], ['Detail, Where the Gold Settles', 'inst-a3', 'abstract', 'ochre'], ['The long wall', 'inst-a4', 'colorfield', 'ember']],
      catalogue: { title: 'The Weight of Light', pages: 184, price: 65 },
      stats: { visitors: null },
    },
    {
      id: 'e2024', edition: 5, title: 'Tidewater', subtitle: 'A coastline, remembered at six scales.',
      start: '2024-03-14', end: '2024-05-19', venue: 'Harbourside Arts Centre', city: 'Your City', address: '8 Quay Street',
      curator: 'Jonas Ekwueme', hours: 'Daily, 10:00 – 19:00', tickets: 'Free entry',
      cover: { seed: 'cover-2024', style: 'seascape', pal: 'tide' }, accent: '#8cc3c2',
      pull: 'The sea is the only subject that never sits still, which is why I keep returning.',
      statement: [
        'Tidewater began as a single morning on a beach near my grandmother\'s house and grew into a year-long study of how water behaves when you stop trying to describe it.',
        'The paintings range from a watercolour the size of a hymn book to a canvas two metres long.',
      ],
      rooms: [
        { name: 'Ebb', wall: '#0f1a1e', text: 'Low water, long shadows.', workIds: ['w11', 'w12', 'w13'] },
        { name: 'Flood', wall: '#0c171c', text: 'The harbour wakes up.', workIds: ['w14', 'w15', 'w16', 'w17'] },
      ],
      press: [QUOTES.c], installation: [['Entrance hall', 'inst-b1', 'seascape', 'tide'], ['Ebb room', 'inst-b2', 'seascape', 'indigo'], ['Opening night', 'inst-b3', 'city', 'indigo']],
      catalogue: { title: 'Tidewater', pages: 128, price: 48 }, stats: { visitors: 21400 },
    },
    {
      id: 'e2022', edition: 4, title: 'Hours of Rain', subtitle: 'The city, doubled by water.',
      start: '2022-09-02', end: '2022-11-13', venue: 'Old Arcade Gallery', city: 'Your City', address: '22 Arcade Row',
      curator: 'Amara Lindqvist', hours: 'Wed – Sun, 11:00 – 18:00', tickets: 'Free entry',
      cover: { seed: 'cover-2022', style: 'city', pal: 'dusk' }, accent: '#e0749a',
      pull: 'Rain is a free lesson in how little we actually see.',
      statement: ['Painted through a wet season in which the studio roof leaked, Hours of Rain is a portrait of a city seen through reflection, steam and umbrellas.', 'Look for the colours that only exist when it is wet.'],
      rooms: [{ name: 'Wet Season', wall: '#150f1c', text: 'Streets, markets, and green after.', workIds: ['w18', 'w19', 'w20', 'w21', 'w22', 'w23'] }],
      press: [QUOTES.b], installation: [['Arcade hall', 'inst-c1', 'city', 'dusk'], ['Closing weekend', 'inst-c2', 'figurative', 'dusk']],
      catalogue: { title: 'Hours of Rain', pages: 112, price: 42 }, stats: { visitors: 17800 },
    },
    {
      id: 'e2020', edition: 3, title: 'Quiet Furnace', subtitle: 'Work made in isolation, shown at last.',
      start: '2020-10-08', end: '2020-12-20', venue: 'The Foundry Space', city: 'Your City', address: '12 Mill Lane',
      curator: 'Self-curated', hours: 'By timed ticket', tickets: 'Timed tickets, limited capacity',
      cover: { seed: 'cover-2020', style: 'colorfield', pal: 'clay' }, accent: '#dba87f',
      pull: 'Small rooms. Honest paint.',
      statement: ['A year of looking at the same four walls produces a particular kind of attention. These are the paintings that attention made.'],
      rooms: [{ name: 'The Studio', wall: '#1b120d', text: 'Quiet things, made loudly.', workIds: ['w24', 'w25', 'w26', 'w27', 'w28'] }],
      press: [QUOTES.a], installation: [['Entrance', 'inst-d1', 'colorfield', 'clay'], ['Still-life wall', 'inst-d2', 'stilllife', 'ochre']],
      catalogue: { title: 'Quiet Furnace', pages: 72, price: 30 }, stats: { visitors: 4200 },
    },
    {
      id: 'e2018', edition: 2, title: 'Inheritance of Colour', subtitle: 'What the elders wore, and what I did with it.',
      start: '2018-06-01', end: '2018-08-12', venue: 'Civic Gallery', city: 'Your City', address: '5 Civic Square',
      curator: 'Jonas Ekwueme', hours: 'Tue – Sun, 10:00 – 17:00', tickets: 'Free entry',
      cover: { seed: 'cover-2018', style: 'abstract', pal: 'rose' }, accent: '#c9506b',
      pull: 'Every family has a palette. This is mine.',
      statement: ['A show about cloth, markets and the colours that travel through families without anyone naming them.'],
      rooms: [{ name: 'The Market', wall: '#1d0f14', text: 'Reds, indigos and everything between.', workIds: ['w29', 'w30', 'w31', 'w32', 'w33'] }],
      press: [QUOTES.c], installation: [['Gallery one', 'inst-e1', 'abstract', 'rose'], ['Opening night', 'inst-e2', 'figurative', 'indigo']],
      catalogue: { title: 'Inheritance of Colour', pages: 96, price: 36 }, stats: { visitors: 9300 },
    },
    {
      id: 'e2016', edition: 1, title: 'First Harvest', subtitle: 'The first solo show: twelve paintings and a borrowed room.',
      start: '2016-04-09', end: '2016-05-29', venue: 'Corner House Gallery', city: 'Your City', address: '3 Corner Street',
      curator: 'Self-curated', hours: 'Fri – Sun, 12:00 – 18:00', tickets: 'Free entry',
      cover: { seed: 'cover-2016', style: 'landscape', pal: 'ochre' }, accent: '#ecc15a',
      pull: 'You start where you are, with what is in front of you.',
      statement: ['Everything I knew at the time, hung in a room I could barely afford. I am still proud of it.'],
      rooms: [{ name: 'The Beginning', wall: '#1d160c', text: 'Early work, hung by hand.', workIds: ['w34', 'w35', 'w36', 'w37', 'w38'] }],
      press: [], installation: [['Corner House, opening', 'inst-f1', 'landscape', 'ochre']],
      catalogue: { title: 'First Harvest', pages: 40, price: 20 }, stats: { visitors: 2100 },
    },
  ];

  const TIMELINE = [
    ['2026', 'Sixth solo exhibition, The Weight of Light', 'The Grand Hall Gallery'],
    ['2024', 'Tidewater, 21,000 visitors in nine weeks', 'Harbourside Arts Centre'],
    ['2023', 'Artist-in-residence, coastal programme', 'Three months, one sketchbook a week'],
    ['2022', 'Hours of Rain; acquisition by the National Collection', 'Old Arcade Gallery'],
    ['2018', 'Inheritance of Colour; Emerging Painter Prize', 'Civic Gallery'],
    ['2016', 'First solo exhibition, First Harvest', 'Corner House Gallery'],
    ['2011', 'Leaves teaching to paint full time', 'Studio 4, The Foundry'],
  ];

  window.SITE = { ARTIST, WORKS, EXHIBITIONS, TIMELINE };
})();
