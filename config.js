/* ==========================================================================
   WEDDING DETAILS — edit everything here. No other file needs to change.
   ========================================================================== */
window.WEDDING = {
  // The couple
  partner1: "Syed Saad Hassan Gillani",
  partner2: "Nigah-e-Eman",
  monogram: ["S", "E"],          // initials shown on the wax seal & wreath
  hashtag: "#SaadwedsEman",

  // Main date shown on the invitation (used for the countdown)
  // Format: YYYY-MM-DDTHH:MM in the venue's local time
  mainDate: "2027-01-06",
  utcOffset: "+05:00",           // venue time-zone offset, e.g. "+05:00", "+01:00", "-04:00"
  timezone: "Asia/Karachi",      // IANA zone, used for "Save to calendar" links

  invitationLine:
    "request the honour of your presence as we begin our forever together",

  quote: {
    text: "Whatever our souls are made of, his and mine are the same.",
    author: "Emily Brontë",
  },

  // Add, remove or reorder events freely
  // events: [
  //   {
  //     title: "The Ceremony",
  //     icon: "rings",              // "rings" | "glass" | "moon" | "flower"
  //     start: "2027-03-13T16:00",
  //     end: "2027-03-13T19:00",
  //     venue: "The Rosewood Gardens",
  //     address: "12 Garden Avenue, Your City",
  //     mapQuery: "", // optional: exact Google Maps search text or leave blank to use venue + address
  //   },
  //   {
  //     title: "The Reception",
  //     icon: "glass",
  //     start: "2027-03-14T19:30",
  //     end: "2027-03-14T23:30",
  //     venue: "The Grand Ivory Hall",
  //     address: "88 Lakeside Boulevard, Your City",
  //     mapQuery: "",
  //   },
  // ],

  // dressCode: "Formal · Soft pastels welcome",


  // Optional background music: put an mp3 at assets/music.mp3 (leave as is).
  // If the file doesn't exist, the music button simply stays hidden.
  music: "assets/music.mp3",
};
