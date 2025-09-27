export default function Gallery() {
  return (
    <section className="py-12 bg-gradient-to-b from-[hsl(var(--secondary))] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden border-2 border-[hsl(var(--primary))] shadow-lg p-6 bg-white">
          <h3 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4 text-center">Customer Journey</h3>
          <img src="/demos/journey.svg" alt="Customer journey mapping" className="w-full h-auto rounded-lg" />
        </div>
      </div>
    </section>
  );
}
