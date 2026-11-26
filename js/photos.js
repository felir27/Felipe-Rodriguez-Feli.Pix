/* Site content: photos, categories and shoots. Images live in images/ (web-size exports). */

const SITE = {
  name: "Felipe Rodriguez",
  tagline: "Photography",
  pitch: "Headshots, events, team and graduation photos in Miami and Atlanta.",
  heroImage: "images/paddle-sunset.jpg",
  aboutImage: "images/backlit-driver.jpg",
  location: "Miami & Atlanta",
  email: "feliperodriguezgomis@gmail.com",
  instagram: "https://www.instagram.com/feli.pix_/",
  formEndpoint: "",

  about: [
    "I'm Felipe, a mechanical engineering student at Georgia Tech. I live in Miami and go to school in Atlanta.",
    "Outside of class I'm on HyTech Racing, Georgia Tech's Formula SAE Electric team, and I travel with a camera whenever I can.",
    "I take on client work in both cities, including headshots, event photography, graduation shoots and more. If you're based in Miami or Atlanta, send me a request below and we can set something up.",
  ],
  aboutShoots: ["Headshots", "Events", "Team photos", "Graduation", "Automotive"],

  shootsIntro: "Shoots I've done for clients and teams: portraits, team photos and live events, photographed to a brief rather than for fun. If you'd like something similar, get in touch.",

  requestTypes: ["Headshots", "Event photography", "Graduation shoot", "Team / club photos", "Automotive shoot", "Something else"],
};

const SUBJECTS = ["street", "motorsport", "sport", "landscape", "architectural", "wildlife", "portrait", "event"];
const COLORS = {
  red: "#c0392b", orange: "#d9772b", yellow: "#d8b43c", green: "#4f8a5b",
  blue: "#3a6ea8", purple: "#7d5a9e", neutral: "#8a8780",
};

const CATEGORIES = [
  { slug: "frame", name: "Through the Frame", cover: "images/cave-cinque.jpg",
    blurb: "Caves, arches, walls and pilings: looking through one thing to find another." },
  { slug: "street", name: "Street", cover: "images/basel-kid.jpg",
    blurb: "Small moments in public: timing, shadow and the odd coincidence." },
  { slug: "motion", name: "Motion", cover: "images/helmet-glove.jpg",
    blurb: "Motorsport with HyTech Racing, cars, and anything else that moves fast." },
  { slug: "place", name: "Light & Place", cover: "images/lake-thun.jpg",
    blurb: "Landscapes and buildings, mostly at the edges of the day." },
  { slug: "detail", name: "Wildlife & Detail", cover: "images/mockingbird.jpg",
    blurb: "Close looks: animals, textures and objects on dark backgrounds." },
];

const SHOOTS = [
  { slug: "hytech-team", name: "HyTech Racing Team Portraits", client: "HyTech Racing", type: "Team photos",
    date: "2026-10-14", location: "Georgia Tech", cover: "images/hytech-mech.jpg",
    blurb: "Sub-team portraits with the HT11 car for the team's 'Meet the Leads' series." },
  { slug: "live-show", name: "Live Show", client: "Live band", type: "Event",
    date: "2026-08-15", location: "Miami, FL", cover: "images/drummer.jpg",
    blurb: "Stage coverage of a live set, shot under colored stage light." },
  { slug: "grad-2025", name: "Graduation Portraits", client: "Private clients", type: "Portraits",
    date: "2026-11-23", location: "Georgia Tech campus", cover: "images/grad-kendrean.jpg",
    blurb: "Cap-and-gown sessions around campus." },
];

/* `settings` holds the location for now (it shows on hover); replace with camera settings later. */
const PHOTOS = [
  {"src": "images/cave-cinque.jpg", "title": "Two in the sea cave", "category": "frame", "subject": "landscape", "color": "neutral", "date": "2026-08-13", "layout": "full", "settings": "Cinque Terre, Italy"},
  {"src": "images/cave-lauterbrunnen.jpg", "title": "Behind the falls", "category": "frame", "subject": "landscape", "color": "green", "date": "2026-06-25", "layout": "full", "settings": "Lauterbrunnen, Switzerland"},
  {"src": "images/stair-tunnel.jpg", "title": "Stairs to daylight", "category": "frame", "subject": "architectural", "color": "neutral", "date": "2026-06-09", "layout": "half", "settings": "Munich, Germany"},
  {"src": "images/david-arch.jpg", "title": "David, through the arch", "category": "frame", "subject": "architectural", "color": "neutral", "date": "2026-08-14", "layout": "half", "settings": "Florence, Italy"},
  {"src": "images/stuttgart-arch.jpg", "title": "Schlossplatz, festival night", "category": "frame", "subject": "architectural", "color": "blue", "date": "2026-05-26", "layout": "half", "settings": "Stuttgart, Germany"},
  {"src": "images/como-window.jpg", "title": "Boats through the wall", "category": "frame", "subject": "landscape", "color": "blue", "date": "2026-08-12", "layout": "half", "settings": "Lake Como, Italy"},
  {"src": "images/paddle-pilings.jpg", "title": "Between the pilings", "category": "frame", "subject": "landscape", "color": "orange", "date": "2026-01-07", "layout": "half", "settings": "Naples, FL"},
  {"src": "images/basel-kid.jpg", "title": "Front-row seat", "category": "street", "subject": "street", "color": "neutral", "date": "2026-06-01", "layout": "full", "settings": "Basel, Switzerland"},
  {"src": "images/firefighter.jpg", "title": "Roadside fire", "category": "street", "subject": "street", "color": "red", "date": "2026-05-10", "layout": "half", "settings": "Lake Okeechobee, FL"},
  {"src": "images/dublin-arch.jpg", "title": "Crossing the light", "category": "street", "subject": "street", "color": "yellow", "date": "2025-07-14", "layout": "half", "settings": "London, UK"},
  {"src": "images/barrier.jpg", "title": "Red barriers", "category": "street", "subject": "street", "color": "red", "date": "2025-07-14", "layout": "half", "settings": "London, UK"},
  {"src": "images/guard.jpg", "title": "Changing of the vans", "category": "street", "subject": "street", "color": "red", "date": "2025-07-12", "layout": "full", "settings": "London, UK"},
  {"src": "images/cafe.jpg", "title": "Café du Théâtre", "category": "street", "subject": "street", "color": "orange", "date": "2026-06-18", "layout": "full", "settings": "Paris, France"},
  {"src": "images/cyclist.jpg", "title": "Evening commute", "category": "street", "subject": "street", "color": "yellow", "date": "2025-07-14", "layout": "full", "settings": "London, UK"},
  {"src": "images/winged-victory.jpg", "title": "Victory, from the crowd", "category": "street", "subject": "architectural", "color": "yellow", "date": "2026-06-18", "layout": "half", "settings": "Musée du Louvre, Paris"},
  {"src": "images/helmet-glove.jpg", "title": "Thumbs up", "category": "motion", "subject": "motorsport", "color": "red", "date": "2026-04-13", "layout": "half", "settings": "Kennesaw, GA"},
  {"src": "images/backlit-driver.jpg", "title": "Lights out", "category": "motion", "subject": "motorsport", "color": "orange", "date": "2026-04-13", "layout": "half", "settings": "Kennesaw, GA"},
  {"src": "images/gt-car.jpg", "title": "In the car", "category": "motion", "subject": "motorsport", "color": "neutral", "date": "2026-05-04", "layout": "half", "settings": "Georgia Tech"},
  {"src": "images/zoom-burst.jpg", "title": "Zoom burst", "category": "motion", "subject": "motorsport", "color": "blue", "date": "2026-04-13", "layout": "half", "settings": "Kennesaw, GA"},
  {"src": "images/f40.jpg", "title": "F40, front corner", "category": "motion", "subject": "motorsport", "color": "red", "date": "2026-04-05", "layout": "half", "settings": "Georgia Tech"},
  {"src": "images/snowboarder.jpg", "title": "Through the snow guns", "category": "motion", "subject": "sport", "color": "neutral", "date": "2026-01-19", "layout": "half"},
  {"src": "images/swim.jpg", "title": "From the grandstands", "category": "motion", "subject": "sport", "color": "blue", "date": "2025-10-17", "layout": "half"},
  {"src": "images/paddle-sunset.jpg", "title": "Paddler at sunset", "category": "place", "subject": "landscape", "color": "orange", "date": "2026-01-07", "layout": "full", "settings": "Naples, FL"},
  {"src": "images/lake-thun.jpg", "title": "Into the lake", "category": "place", "subject": "landscape", "color": "blue", "date": "2026-06-25", "layout": "full", "settings": "Lake Thun, Switzerland"},
  {"src": "images/victory-moon.jpg", "title": "Statue and moon", "category": "place", "subject": "architectural", "color": "blue", "date": "2026-05-26", "layout": "half", "settings": "Stuttgart, Germany"},
  {"src": "images/metz.jpg", "title": "Metz at night", "category": "place", "subject": "architectural", "color": "yellow", "date": "2026-05-22", "layout": "half", "settings": "Metz, France"},
  {"src": "images/eiffel-iron.jpg", "title": "Inside the ironwork", "category": "place", "subject": "architectural", "color": "neutral", "date": "2026-06-18", "layout": "full", "settings": "Paris, France"},
  {"src": "images/skier.jpg", "title": "One line down", "category": "place", "subject": "landscape", "color": "neutral", "date": "2026-06-25", "layout": "half", "settings": "Jungfraujoch, Switzerland"},
  {"src": "images/blinds.jpg", "title": "Blinds at sundown", "category": "place", "subject": "architectural", "color": "orange", "date": "2025-06-24", "layout": "half", "settings": "Atlanta, GA"},
  {"src": "images/vizcaya.jpg", "title": "The canopy bed", "category": "place", "subject": "architectural", "color": "yellow", "date": "2025-07-09", "layout": "half"},
  {"src": "images/mockingbird.jpg", "title": "Mockingbird", "category": "detail", "subject": "wildlife", "color": "purple", "date": "2026-04-25", "layout": "full", "settings": "Georgia Tech"},
  {"src": "images/shark.jpg", "title": "Jaw", "category": "detail", "subject": "wildlife", "color": "neutral", "date": "2026-02-07", "layout": "full", "settings": "Georgia Aquarium"},
  {"src": "images/crab.jpg", "title": "Spider crab", "category": "detail", "subject": "wildlife", "color": "orange", "date": "2026-02-07", "layout": "full", "settings": "Georgia Aquarium"},
  {"src": "images/skull.jpg", "title": "Bookshop shelf", "category": "detail", "subject": "architectural", "color": "orange", "date": "2025-06-01", "layout": "half", "settings": "Old Florida Book Shop"},
  {"src": "images/steering.jpg", "title": "356 interior", "category": "detail", "subject": "motorsport", "color": "neutral", "date": "2026-05-26", "layout": "full", "settings": "Porsche Museum, Stuttgart"},
  {"src": "images/hytech-mech.jpg", "title": "Mechanical leads", "shoot": "hytech-team", "subject": "portrait", "color": "green", "date": "2026-10-14", "layout": "full"},
  {"src": "images/hytech-elec.jpg", "title": "Electrical & software leads", "shoot": "hytech-team", "subject": "portrait", "color": "green", "date": "2026-10-14", "layout": "full"},
  {"src": "images/grad-kendrean.jpg", "title": "Tech Tower", "shoot": "grad-2025", "subject": "portrait", "color": "red", "date": "2025-07-31", "layout": "half"},
  {"src": "images/grad-tower-group.jpg", "title": "The class at Tech Tower", "shoot": "grad-2025", "subject": "portrait", "color": "red", "date": "2026-11-23", "layout": "half"},
  {"src": "images/grad-steps.jpg", "title": "Up the steps", "shoot": "grad-2025", "subject": "portrait", "color": "neutral", "date": "2026-11-23", "layout": "half"},
  {"src": "images/grad-wreck.jpg", "title": "Behind the wheel of the Wreck", "shoot": "grad-2025", "subject": "portrait", "color": "yellow", "date": "2026-11-23", "layout": "half"},
  {"src": "images/grad-seal.jpg", "title": "Seal and cord", "shoot": "grad-2025", "subject": "portrait", "color": "blue", "date": "2026-11-23", "layout": "half"},
  {"src": "images/drummer.jpg", "title": "Drummer, monkey head on", "shoot": "live-show", "subject": "event", "color": "blue", "date": "2026-08-15", "layout": "half"}
];
