const rooms = [
  { id: 1, name: 'A/C Economy Single', category: 'Economy', type: 'Single', price: 1900, description: 'Comfortable air-conditioned economy room perfect for solo travelers. Features modern amenities in a cozy setting.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', available: 1 },
  { id: 2, name: 'Standard Non A/C Double', category: 'Standard', type: 'Double', price: 1900, description: 'Spacious standard room with excellent ventilation, ideal for couples or friends. Enjoy a comfortable stay without breaking the bank.', amenities: 'Free WiFi,Colour TV,Satellite Channels,Intercom,Room Service,Fan', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', available: 1 },
  { id: 3, name: 'Deluxe A/C Single', category: 'Deluxe', type: 'Single', price: 2200, description: 'Elegantly furnished deluxe room with premium amenities for a refined single-occupancy experience.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', available: 1 },
  { id: 4, name: 'Deluxe A/C Double', category: 'Deluxe', type: 'Double', price: 2500, description: 'Luxurious deluxe double room with vibrant decor and premium furnishings for a memorable stay.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', available: 1 },
  { id: 5, name: 'Executive A/C Single', category: 'Executive', type: 'Single', price: 3000, description: 'Top-tier executive single room with the finest amenities, perfect for business travelers seeking comfort and style.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe,Work Desk,Bathrobe', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', available: 1 },
  { id: 6, name: 'Executive A/C Double', category: 'Executive', type: 'Double', price: 3200, description: 'Spacious executive double room offering luxury and comfort with premium furnishings and exclusive amenities.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe,Work Desk,Bathrobe', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', available: 1 },
  { id: 7, name: 'Executive A/C Triple', category: 'Executive', type: 'Triple', price: 3700, description: 'Our largest executive room accommodating three guests with all premium amenities and ample space.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe,Work Desk,Bathrobe', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', available: 1 }
];

function getAll() {
  return rooms.filter(r => r.available).sort((a, b) => a.price - b.price);
}

function getById(id) {
  return rooms.find(r => r.id === id) || null;
}

function getAvailable() {
  return rooms.filter(r => r.available).sort((a, b) => a.price - b.price);
}

function getByCategory(category) {
  return rooms.filter(r => r.category === category && r.available).sort((a, b) => a.price - b.price);
}

module.exports = { rooms, getAll, getById, getAvailable, getByCategory };
