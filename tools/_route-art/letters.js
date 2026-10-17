/* The four UTRC letter routes.

   Every waypoint is a real place: 'KCC' is the start on King's College Circle,
   a pair of names is an intersection, and an optional trailing [lat,lon]
   disambiguates when two streets of the same name meet more than once.  The
   router joins consecutive waypoints along real pavement, so both the drawn
   shape and the quoted distance come out of the street network rather than
   out of a designer's hand.

   Letters that cannot be drawn in one stroke (T, R) retrace part of
   themselves.  That is honest: the retraced stretch is run twice and counted
   twice, and on the card it simply draws over itself.

   To try an alternative, add it here with a new id and run
     node preview.js <data-dir> <id>
   then point PICK in build.js at the one you want.  */
'use strict';

module.exports = [
  /* U — Monday 5K.  Down the west edge of campus to the waterfront, east
     past Union and the market, then north up Jarvis.  One stroke, nothing
     retraced: the only letter of the four that draws itself cleanly. */
  { id: 'U1', run: 'Monday 5K', letter: 'U', wp: [
    'KCC',
    ['Beverley Street', 'Dundas Street West'],
    ['Queen Street West', 'Beverley Street'],
    ['Queen Street West', 'John Street'],
    ['Front Street West', 'John Street'],
    ['Front Street West', 'Bay Street'],
    ['Front Street East', 'Jarvis Street'],
    ['Queen Street East', 'Jarvis Street'],
    ['Carlton Street', 'Jarvis Street'],
  ]},

  /* T — Wednesday 5K.  King's College Circle sits almost exactly halfway down
     the St. George / Beverley line, so the start lands mid-stem: down to
     Dundas, back up the length of the stem, then the crossbar along Bloor.
     The west arm of the crossbar is run twice. */
  { id: 'T1', run: 'Wednesday 5K', letter: 'T', wp: [
    'KCC',
    ['College Street', 'St. George Street'],
    ['Beverley Street', 'Dundas Street West'],   // foot of the stem
    ['College Street', 'St. George Street'],     // back up
    ['Bloor Street West', 'St. George Street'],  // stem meets the crossbar
    ['Bloor Street West', 'Bathurst Street'],    // west arm
    ['Bloor Street West', 'St. George Street'],  // back to centre
    ['Bloor Street West', 'Bay Street'],         // east arm
  ]},

  /* R — Saturday 8K.  The spine runs from the circle down to Front and back,
     the bowl goes round Queen, Bay and College, and the leg steps down
     through King and Wellington so it clears the bowl.  The leg is a
     staircase only because downtown has no diagonals — on a grid it is
     exactly as long as the diagonal would have been. */
  { id: 'R13', run: 'Saturday 8K', letter: 'R', wp: [
    'KCC',
    ['Queen Street West', 'Beverley Street'],
    ['Front Street West', 'John Street'],        // foot of the spine
    ['Queen Street West', 'Beverley Street'],    // back up to the bowl
    ['Queen Street West', 'Bay Street'],
    ['College Street', 'Bay Street'],
    ['College Street', 'St. George Street'],     // bowl closes on the spine
    ['Queen Street West', 'Beverley Street'],    // down to where the leg starts
    ['King Street West', 'Simcoe Street'],
    ['Front Street East', 'Yonge Street'],
  ]},

  /* C — Saturday 5K, the cafe run.  West along Harbord, the full length of
     Bathurst, then east along Front.  The opening of the C faces campus,
     which is the one part of this that was on purpose. */
  { id: 'C11', run: 'Saturday 5K', letter: 'C', wp: [
    'KCC',
    ['Harbord Street', 'Spadina Avenue'],
    ['Harbord Street', 'Bathurst Street'],
    ['Bathurst Street', 'College Street'],
    ['Bathurst Street', 'Queen Street West'],
    ['King Street West', 'Bathurst Street'],
    ['Front Street West', 'Bathurst Street'],
    ['Front Street West', 'Spadina Avenue'],
    ['Front Street West', 'John Street'],
  ]},
];
