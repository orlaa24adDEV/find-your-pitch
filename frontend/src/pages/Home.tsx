const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Pitch
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Book the best sports fields in your city
        </p>
        <div className="max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by sport, location..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
