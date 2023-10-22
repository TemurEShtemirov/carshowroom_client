import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";

function App() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [engineFilter, setEngineFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState([0, 100000]);
  const [likedCars, setLikedCars] = useState([]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get("http://localhost:8080/cars");
      setCars(response.data.cars);
      setFilteredCars(response.data.cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    sortCars(e.target.value);
  };

  const sortCars = (option) => {
    let sortedCars = [...filteredCars];
    switch (option) {
      case "engine":
        sortedCars.sort((a, b) => a.engine.localeCompare(b.engine));
        break;
      case "type":
        sortedCars.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case "price":
        sortedCars.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }
    setFilteredCars(sortedCars);
  };

  const handleEngineChange = (e) => {
    setEngineFilter(e.target.value);
    filterCars(e.target.value, typeFilter, priceFilter);
  };

  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    filterCars(engineFilter, e.target.value, priceFilter);
  };

  const handlePriceChange = (value) => {
    setPriceFilter(value);
    filterCars(engineFilter, typeFilter, value);
  };

  const filterCars = (engine, type, price) => {
    let filtered = [...cars];
    if (engine) {
      filtered = filtered.filter((car) => car.engine === engine);
    }
    if (type) {
      filtered = filtered.filter((car) => car.type === type);
    }
    filtered = filtered.filter(
      (car) => car.price >= price[0] && car.price <= price[1]
    );
    setFilteredCars(filtered);
  };

  const handleLike = async (carId) => {
    try {
      const response = await axios.put(`http://localhost:8080/cars/${carId}`, {
        liked: true,
      });
      const updatedCar = response.data.car;
      const updatedCars = cars.map((car) =>
        car.id === updatedCar.id ? updatedCar : car
      );
      setCars(updatedCars);
      setFilteredCars(updatedCars);
      const updatedLikedCars = likedCars.concat(updatedCar);
      setLikedCars(updatedLikedCars);
    } catch (error) {
      console.error("Error updating car:", error);
    }
  };

  const handleUnlike = async (carId) => {
    try {
      const response = await axios.put(`http://localhost:8080/cars/${carId}`, {
        liked: false,
      });
      const updatedCar = response.data.car;
      const updatedCars = cars.map((car) =>
        car.id === updatedCar.id ? updatedCar : car
      );
      setCars(updatedCars);
      setFilteredCars(updatedCars);
      const updatedLikedCars = likedCars.filter((car) => car.id !== carId);
      setLikedCars(updatedLikedCars);
    } catch (error) {
      console.error("Error updating car:", error);
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="text-center mt-4">Car Showroom</h1>
      <div className="row justify-content-center mt-4">
        <div className="col-sm-8">
          <div className="form-group">
            <label htmlFor="engineFilter">Engine:</label>
            <select
              className="form-control"
              id="engineFilter"
              value={engineFilter}
              onChange={handleEngineChange}
            >
              <option value="">All</option>
              <option value="V6">V6</option>
              <option value="V8">V8</option>
              <option value="Electric">Electric</option>
            </select>
          </div>
          <div className="row justify-content-centermt-4">
            <div className="col-sm-6">
              <div className="form-group">
                <label htmlFor="typeFilter">Type:</label>
                <select
                  className="form-control"
                  id="typeFilter"
                  value={typeFilter}
                  onChange={handleTypeChange}
                >
                  <option value="">All</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label htmlFor="priceFilter">Price:</label>
                <input
                  type="range"
                  className="form-control-range"
                  id="priceFilter"
                  min={0}
                  max={100000}
                  step={1000}
                  value={priceFilter[1]}
                  onChange={(e) =>
                    handlePriceChange([priceFilter[0], parseInt(e.target.value)])
                  }
                />
                <div className="d-flex justify-content-between">
                  <span>${priceFilter[0]}</span>
                  <span>${priceFilter[1]}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="form-group mt-4">
            <label htmlFor="sortOption">Sort By:</label>
            <select
              className="form-control"
              id="sortOption"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="">None</option>
              <option value="engine">Engine</option>
              <option value="type">Type</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>
      </div>
      <div className="row justify-content-center mt-4">
        {filteredCars.map((car) => (
          <div className="col-sm-4" key={car.id}>
            <div className="card">
              <img
                className="card-img-top"
                src={car.imageUrl}
                alt={car.make}
              />
              <div className="card-body">
                <h5 className="card-title">{car.make}</h5>
                <p className="card-text">Engine: {car.engine}</p>
                <p className="card-text">Type: {car.type}</p>
                <p className="card-text">Price: ${car.price}</p>
                {likedCars.some((likedCar) => likedCar.id === car.id) ? (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleUnlike(car.id)}
                  >
                    Unlike
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleLike(car.id)}
                  >
                    Like
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;