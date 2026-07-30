import rss from "@astrojs/rss";

const site = "https://www.things-to-do-in-shanghai-china.com";

const pages = [
  { title: "Best Attractions in Shanghai", description: "Explore Shanghai's best attractions: the Bund, Yu Garden, Shanghai Tower, Disneyland and more.", link: "/attractions/", pubDate: new Date("2026-07-15") },
  { title: "Shanghai Food Guide", description: "From xiaolongbao to Michelin-starred restaurants: the ultimate Shanghai food guide.", link: "/food/", pubDate: new Date("2026-07-10") },
  { title: "Shanghai Nightlife Guide", description: "Rooftop bars, hidden speakeasies, live music clubs, and river cruises after dark.", link: "/nightlife/", pubDate: new Date("2026-07-05") },
  { title: "Day Trips from Shanghai", description: "Ancient water towns, classical gardens, and mountain retreats within easy reach.", link: "/day-trips/", pubDate: new Date("2026-06-28") },
  { title: "Shanghai Itinerary: 3-5 Days", description: "Day-by-day plans for 3 or 5 days in Shanghai. Built by people who know the city.", link: "/itinerary/", pubDate: new Date("2026-06-20") },
];

export async function GET(context) {
  return rss({
    title: "Things to Do in Shanghai — Travel Guide",
    description: "The ultimate guide to things to do in Shanghai, China. Discover top attractions, food, nightlife, and more.",
    site: context.site,
    items: pages.map((p) => ({
      title: p.title,
      description: p.description,
      link: p.link,
      pubDate: p.pubDate,
    })),
  });
}
