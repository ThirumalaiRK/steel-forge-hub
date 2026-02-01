import React from 'react';

const categories = [
  {
    title: 'Industrial Seating Solutions',
    subtitle: 'Built for factories, offices, and institutions',
    badge: 'Up to 40% Project Savings',
    cta: 'View Solutions',
    imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff53825b3?auto=format&fit=crop&w=1920&q=80',
  },
  {
    title: 'Heavy-Duty Workbenches',
    subtitle: 'Engineered for precision and durability',
    badge: 'Custom Fabrication Available',
    cta: 'Get Quote',
    imageUrl: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?auto=format&fit=crop&w=1920&q=80',
  },
  {
    title: 'Institutional Storage Racks',
    subtitle: 'Scalable solutions for any environment',
    badge: 'Bulk Order Discounts',
    cta: 'Explore Options',
    imageUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6758504c?auto=format&fit=crop&w=1920&q=80',
  },
];

const CategoryCard = ({ title, subtitle, badge, cta, imageUrl }) => (
  <div className="relative rounded-lg overflow-hidden group bg-gray-800 text-white shadow-lg">
    <img src={imageUrl} alt={title} className="w-full h-64 object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
    <div className="absolute inset-0 p-8 flex flex-col justify-end">
      <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-4">{badge}</span>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-gray-300 mt-2">{subtitle}</p>
      <button className="mt-6 bg-gray-900 text-white font-bold py-3 px-6 rounded-lg self-start hover:bg-gray-700 transition-colors duration-300">
        {cta}
      </button>
    </div>
  </div>
);

const ShopByCategory = () => {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(category => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;