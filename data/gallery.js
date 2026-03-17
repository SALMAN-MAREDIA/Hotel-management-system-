const gallery = [
  { id: 1, title: 'Hotel Lobby', image: '/images/reception.jpg', category: 'Interior' },
  { id: 2, title: 'Deluxe Room', image: '/images/deluxeroom.jpg', category: 'Rooms' },
  { id: 3, title: 'Executive Suite', image: '/images/executive-ac-double.jpg', category: 'Rooms' },
  { id: 4, title: 'Restaurant', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', category: 'Dining' },
  { id: 5, title: 'Hotel Exterior', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', category: 'Exterior' },
  { id: 6, title: 'Conference Room', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', category: 'Facilities' }
];

function getAll() {
  return gallery;
}

function getByCategory(category) {
  return gallery.filter(item => item.category === category);
}

module.exports = { gallery, getAll, getByCategory };
