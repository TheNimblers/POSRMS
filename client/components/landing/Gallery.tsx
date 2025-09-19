export default function Gallery() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <img
            src="/demos/customer.svg"
            alt="Customer panel"
            className="w-full h-auto rounded-xl border shadow-sm"
          />
          <img
            src="/demos/analytics.svg"
            alt="Analytics"
            className="w-full h-auto rounded-xl border shadow-sm"
          />
          <img
            src="/demos/manager.svg"
            alt="Manager dashboard"
            className="w-full h-auto rounded-xl border shadow-sm"
          />
        </div>
      </div>
    </section>
  );
}
