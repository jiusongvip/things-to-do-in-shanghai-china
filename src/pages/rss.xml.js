import rss from "@astrojs/rss";

const site = "https://www.things-to-do-in-shanghai-china.com";

const pages = [
  { title: "Best Attractions in Shanghai", description: "Explore Shanghai's best attractions: the Bund, Yu Garden, Shanghai Tower, Disneyland and more.", link: "/attractions/", pubDate: new Date("2026-07-15") },
  { title: "Shanghai Food Guide", description: "From xiaolongbao to Michelin-starred restaurants: the ultimate Shanghai food guide.", link: "/food/", pubDate: new Date("2026-07-10") },
  { title: "Shanghai Nightlife Guide", description: "Rooftop bars, hidden speakeasies, live music clubs, and river cruises after dark.", link: "/nightlife/", pubDate: new Date("2026-07-05") },
  { title: "Day Trips from Shanghai", description: "Ancient water towns, classical gardens, and mountain retreats within easy reach.", link: "/day-trips/", pubDate: new Date("2026-06-28") },
  { title: "Shanghai Itinerary: 3-5 Days", description: "Day-by-day plans for 3 or 5 days in Shanghai. Built by people who know the city.", link: "/itinerary/", pubDate: new Date("2026-06-20") },
  { title: "The Bund", description: "Shanghai's iconic waterfront promenade: hours, what to see, best photo spots, and how to plan the classic Bund circuit.", link: "/the-bund/", pubDate: new Date("2026-08-01") },
  { title: "Shanghai Tower", description: "The world's highest observation deck: prices, booking tips, best time to visit, and what to expect on the 118th floor.", link: "/shanghai-tower/", pubDate: new Date("2026-08-01") },
  { title: "Yu Garden", description: "Shanghai's Ming-dynasty masterpiece: hours, tickets, best time to visit, and how to combine it with the Old City bazaar.", link: "/yu-garden/", pubDate: new Date("2026-08-01") },
  { title: "Xiaolongbao in Shanghai", description: "Where to eat the original soup dumpling: the five best shops, how to eat them properly, and what they cost.", link: "/xiaolongbao/", pubDate: new Date("2026-08-01") },
  { title: "Shanghai's Best Rooftop Bars: The 2026 Ranked Guide", description: "The honest, ranked shortlist for 2026, judged on drink quality, view, vibe, and value.", link: "/blog/best-rooftop-bars/", pubDate: new Date("2026-05-04") },
  { title: "A Local's Guide to Shanghai Breakfast", description: "Congee, youtiao, jianbing, and soy milk. Where to find the best traditional breakfast before 10 AM.", link: "/blog/shanghai-breakfast-guide/", pubDate: new Date("2026-04-10") },
  { title: "Shanghai in Summer: Survival Guide", description: "How to handle the heat and humidity while still enjoying the city.", link: "/blog/shanghai-in-summer/", pubDate: new Date("2026-07-01") },
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
