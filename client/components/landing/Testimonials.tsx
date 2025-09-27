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
            <Card key={q.author} className={`p-4 ${q.accent} bg-white/80`}>
              <CardContent className="p-4 text-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center text-white font-semibold">{q.author.split(" ")[0][0]}</div>
                  <div>
                    <div className="font-semibold">{q.author}</div>
                    <div className="text-xs text-gray-500">Verified customer</div>
                  </div>
                </div>
                <div className="mt-4 text-sm">“{q.text}”</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Our Partners</h3>
          <p className="text-sm text-gray-500">Payment & business partners who help bring POSRMS to restaurants</p>
        </div>

        <div className="flex items-center justify-center gap-8 py-6">
          <a href="https://www.pay.nl" target="_blank" rel="noreferrer" className="inline-flex items-center">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F060ea98b8f1a46b483ff7648d5a2a998%2F2c1a9e3839be442596cd06d823c04670?format=webp&width=800" alt="Pay.nl" className="h-12" />
          </a>

          <a href="https://www.rsinghmultidiensten.nl/" target="_blank" rel="noreferrer" className="inline-flex items-center">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F060ea98b8f1a46b483ff7648d5a2a998%2Ff6ed64267c694011bbf938bcd1bb790e?format=webp&width=800" alt="Rsingh Multidiensten" className="h-12" />
          </a>

          <a href="https://thenimblers.com/" target="_blank" rel="noreferrer" className="inline-flex items-center">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F060ea98b8f1a46b483ff7648d5a2a998%2Ff29f62d57147465ea824654942640039?format=webp&width=800" alt="The Nimblers" className="h-12" />
          </a>
        </div>
      </div>
    </section>
  );
}
