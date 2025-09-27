import React from "react";

export default function Gallery() {
  return (
    <section className="py-12 bg-gradient-to-b from-[hsl(var(--secondary))] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden border-2 border-[hsl(var(--primary))] shadow-lg p-6 bg-white">
          <h3 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4 text-center">Product photos & maps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <iframe src="/order?token=QR-T1" title="Customer demo" className="w-full h-48 border-0 rounded-lg shadow-md" />
            <iframe src="/login" title="Staff login" className="w-full h-48 border-0 rounded-lg shadow-md" />
            <iframe src="/kitchen" title="Kitchen" className="w-full h-48 border-0 rounded-lg shadow-md" />
            <iframe src="/manager" title="Manager" className="w-full h-48 border-0 rounded-lg shadow-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
