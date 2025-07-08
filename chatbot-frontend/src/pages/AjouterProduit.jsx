import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { DollarOutlined } from "@ant-design/icons";

const AjouterProduit = () => {
  const { id } = useParams();
  const location = useLocation();
  const productId = location.state?.productId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    code: "",
    description: "",
    total: "",
    coutAchat: "",
    fraisGestion: "",
  });
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const [program, setProgram] = useState([]);
  const calculateTotal = (basePrice, quantity) => {
    return basePrice * quantity;
  };

  // Fetch program data (your 2 products)
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("/program");
        console.log("Fetched program data:", response.data);
        setProgram(response.data);
      } catch (error) {
        console.error("Failed to fetch programmes:", error);
      }
    };
    fetchBanners();
  }, []);

  // Fetch product data if editing
  useEffect(() => {
    if (productId) {
      const fetchProductData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/produit/${productId}`);
          setProductData(response.data);
        } catch (error) {
          console.error("Error fetching product data:", error);
          setError("Failed to fetch product data.");
        } finally {
          setLoading(false);
        }
      };
      fetchProductData();
    }
  }, [productId]);

  // Pre-fill form with program data if not editing
  useEffect(() => {
    if (!productId && program.length > 0) {
      const selectedProgram = program[0]; // Default to first program
      setProductData({
        quantite: 1,
        code: selectedProgram.title || "",
        description: selectedProgram.mainText || "",
        total: "",
        coutAchat: "",
        fraisGestion: "",
        surface: selectedProgram.surface || "",
        taillePrixLabel: selectedProgram.taillePrixLabel || "",
      });
    }
  }, [program, productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;

    const userId = decodedToken?.userId || decodedToken?.commercialId;

    try {
      setLoading(true);
      setError(null);

      if (productId) {
        // Update existing product
        await axios.put(`/produit/${productId}`, {
          ...productData,
          leadId: id,
          session: userId,
        });
      } else {
        // Create new product in produit collection
        const res = await axios.post("/produit", {
          ...productData,
          leadId: id,
          session: userId,
        });
        console.log("Product created:", res.data);
      }
      navigate(`/lead/${id}`);
    } catch (error) {
      console.error("Error saving product:", error);
      if (error.response && error.response.status === 409) {
        alert("Ce produit est déjà ajouté pour ce lead !");
      } else {
        setError("Failed to save product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSurfaceQuantityChange = (e) => {
    const quantity = parseInt(e.target.value);
    const newProductData = {
      ...productData,
      surfaceQuantity: quantity,
    };

    // Recalculate total if surface exists
    if (productData.surface) {
      const basePrice = program.find(p => p.title === productData.code)?.total || productData.total;
      newProductData.total = calculateTotal(basePrice, quantity);
    }

    setProductData(newProductData);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        {productId ? "Modifier Produit" : "Ajouter un Produit"}
      </h2>

      {error && (
        <div className="text-red-500 mb-4 text-center font-medium">{error}</div>
      )}

      {/* Display program products as templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
        {program.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg shadow-md p-6"
          >
            <div className="mb-6">
              <img
                src={item.imageUrl}
                alt={`Program ${index}`}
                className="w-full h-60 object-cover rounded-md"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
            <p className="text-gray-600 mt-2">{item.mainText}</p>
            <p className="program-price flex items-center">
              <DollarOutlined className="mr-2" /> {/* Dollar icon */}
              <span className="font-bold">{item.total}€</span>{" "}
              {/* Display total price in bold */}
            </p>
            <button
              onClick={() =>
                setProductData({
                  code: item.title,
                  description: item.mainText,
                  coutAchat: item.coutAchat,
                  fraisGestion: item.fraisGestion,
                  total: item.total,
                  surface: item.surface,
                  taillePrixLabel: item.taillePrixLabel,
                })
              }
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Utiliser ce modèle
            </button>
          </div>
        ))}
      </div>

      {/* Add/Edit product form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="code"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Titre
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={productData.code}
              onChange={handleChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4 mt-4">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={productData.description}
              onChange={handleChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
     {productData.surface && (
            <div className="mb-4">
            <label
              htmlFor="surfaceQuantity"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Quantité de surface ({productData.surface})
            </label>
            <input
              type="number"
              id="surfaceQuantity"
              name="surfaceQuantity"
              // min="1"
              value={productData.surfaceQuantity}
              onChange={handleSurfaceQuantityChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
          <div className="mt-4">
            <label
              htmlFor="surface"
              className="block text-sm font-medium text-gray-700"
            >
              Surface
            </label>
            <input
              disabled
              type="text"
              id="surface"
              name="surface"
              value={productData.surface || ""}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="taillePrixLabel"
              className="block text-sm font-medium text-gray-700"
            >
              Prix par Taille
            </label>
            <input
              disabled
              type="text"
              id="taillePrixLabel"
              name="taillePrixLabel"
              value={productData.taillePrixLabel || ""}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-6 mt-4">
            <label
              htmlFor="total"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              PRIX MINIMAL DE VENTE
            </label>
            <input
              disabled
              type="number"
              id="total"
              name="total"
              value={productData.total}
              onChange={handleChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`inline-block w-full py-3 text-white font-medium rounded-md transition ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Enregistrement..."
                : productId
                ? "Modifier"
                : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterProduit;
