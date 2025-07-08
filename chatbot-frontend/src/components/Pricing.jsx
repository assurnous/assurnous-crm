import React from 'react';

const Pricing = () => {
  // This function will handle Stripe Checkout
  const handleCheckout = (planId) => {
    console.log(`Redirect to checkout for plan: ${planId}`);
    // Here you will initiate the Stripe checkout process
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto">
        <h3 className="text-center text-4xl font-bold text-gray-800 mb-12">Plans de Tarification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basique Plan */}
          <div className="p-8 bg-gray-100 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
            <h4 className="text-3xl font-semibold mb-4">Basique</h4>
            <p className="text-2xl font-bold text-gray-800 mb-4">€10/mois</p>
            <p className="text-gray-600 mb-6">Accès aux fonctionnalités de base.</p>
            <button 
              onClick={() => handleCheckout('price_basique')}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Choisir ce plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="p-8 bg-gray-100 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
            <h4 className="text-3xl font-semibold mb-4">Pro</h4>
            <p className="text-2xl font-bold text-gray-800 mb-4">€25/mois</p>
            <p className="text-gray-600 mb-6">Fonctionnalités avancées avec intégrations supplémentaires.</p>
            <button 
              onClick={() => handleCheckout('price_pro')}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Choisir ce plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="p-8 bg-gray-100 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
            <h4 className="text-3xl font-semibold mb-4">Premium</h4>
            <p className="text-2xl font-bold text-gray-800 mb-4">€50/mois</p>
            <p className="text-gray-600 mb-6">Accès complet avec support premium.</p>
            <button 
              onClick={() => handleCheckout('price_premium')}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Choisir ce plan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
