export default function Gallery() {
  return (
    <section className="py-12 bg-gradient-to-b from-[hsl(var(--secondary))] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <img
            src="/demos/customer.svg"
            alt="Customer panel"
            className="w-full h-auto rounded-xl border-2 border-[hsl(var(--primary))] shadow-lg"
          />
          <img
            src="/demos/analytics.svg"
            alt="Analytics"
            className="w-full h-auto rounded-xl border-2 border-[hsl(var(--accent))] shadow-lg"
          />
          <img
            src="/demos/manager.svg"
            alt="Manager dashboard"
            className="w-full h-auto rounded-xl border-2 border-[hsl(var(--restaurant-blue))] shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
