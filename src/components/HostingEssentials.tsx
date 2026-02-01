import React from 'react';
import { Link } from 'react-router-dom';

const HostingEssentialsCard = ({ title, subtitle, imageUrl, cta_link, cta_text, isLarge = false }) => {
  const cardClasses = `relative rounded-lg overflow-hidden group ${isLarge ? 'lg:col-span-2' : ''}`;

  return (
    <Link to={cta_link} className={cardClasses}>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white p-6 text-center">
        {subtitle && <span className="bg-white text-black text-sm font-semibold px-3 py-1 rounded-full mb-4">{subtitle}</span>}
        <h3 className={`font-bold ${isLarge ? 'text-4xl' : 'text-2xl'}`}>{title}</h3>
        {cta_text && <button className="mt-6 bg-white text-black font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-opacity">{cta_text}</button>}
      </div>
    </Link>
  );
};

const HostingEssentials = ({ offers }) => {
  if (!offers || offers.length === 0) {
    return null;
  }

  const largeOffer = offers[0];
  const smallOffers = offers.slice(1, 3);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Hosting Essentials</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Large Card */}
          {largeOffer && (
            <div className="lg:col-span-1 lg:row-span-2">
              <HostingEssentialsCard
                title={largeOffer.title}
                subtitle={largeOffer.subtitle}
                imageUrl={largeOffer.desktop_image_url || largeOffer.image_url}
                cta_link={largeOffer.cta_link}
                cta_text={largeOffer.cta_text}
                isLarge={true}
              />
            </div>
          )}
          {/* Small Cards */}
          {smallOffers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
              {smallOffers.map(offer => (
                <HostingEssentialsCard
                  key={offer.id}
                  title={offer.title}
                  subtitle={offer.subtitle}
                  imageUrl={offer.desktop_image_url || offer.image_url}
                  cta_link={offer.cta_link}
                  cta_text={offer.cta_text}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HostingEssentials;