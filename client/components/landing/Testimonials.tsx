import { Card, CardContent } from "@/components/ui/card";

export default function Testimonials() {
  const quotes = [
    {
      text: "POSRMS cut our order wait-times by 30% and boosted table turns.",
      author: "Coastal Bistro",
      accent: "border-l-4 border-l-emerald-500",
    },
    {
      text: "Staff learned it in a day. The customer menu is gorgeous on mobile.",
      author: "Urban Grill",
      accent: "border-l-4 border-l-orange-500",
    },
    {
      text: "Finally, a single system that connects customers, waiters, and kitchen.",
      author: "Golden Spoon",
      accent: "border-l-4 border-l-purple-500",
    },
  ];

  return (
    <section id="testimonials" className="py-16 bg-[hsl(var(--secondary))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Loved by modern restaurants
          </h2>
          <p className="text-gray-600">
            Fast setup, intuitive workflows, real results
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <Card key={q.author} className={q.accent}>
              <CardContent className="p-6 text-gray-700">
                “{q.text}”
                <div className="mt-3 text-sm text-gray-500">— {q.author}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
