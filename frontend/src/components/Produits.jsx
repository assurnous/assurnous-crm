import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tooltip, message, Modal, Input } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Produits = ({ onCartChange }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [produits, setProduits] = useState([]);
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;

  // // Fetch produits data on component mount
  // useEffect(() => {
  //   const fetchProduits = async () => {
  //     try {
  //       const response = await axios.get(`/produits/${id}`); // Make sure the endpoint matches your backend route
  //       console.log('response', response)
  //       setProduits(response.data); // Store the fetched data in state
  //     } catch (error) {
  //       console.error("Error fetching produits:", error);
  //     }
  //   };

  //   fetchProduits();
  // }, [id]); // Fetch products when component mounts or `id` changes

  useEffect(() => {
    const fetchProduits = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`/produits/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const allProduits = response.data;

        const decodedToken = token ? jwtDecode(token) : null;
        const currentUserId = decodedToken?.userId;

        // 🔑 Compare `session` with `userId`
        const filteredProduits = allProduits.filter(
          (produit) => produit.session === currentUserId
        );

        setProduits(filteredProduits);
      } catch (error) {
        console.error("Error fetching produits:", error);
      }
    };

    fetchProduits();
  }, [id]);
  // Delete product with confirmation
  const handleDelete = (productId) => {
    Modal.confirm({
      title: "Êtes-vous sûr de vouloir supprimer ce produit?",
      content: "Cette action est irréversible.",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk: async () => {
        try {
          await axios.delete(`/produit/${productId}`);
          message.success("Produit supprimé avec succès");
          // Refresh the table after deletion
          setProduits(produits.filter((product) => product._id !== productId));
        } catch (error) {
          console.error("Error deleting product:", error);
          message.error("Échec de la suppression du produit");
        }
      },
      onCancel() {
        console.log("Suppression annulée");
      },
    });
  };

  // Redirect to the edit page for updating product
  const handleUpdate = (productId) => {
    navigate(`/leads/${id}/ajouter-produit/${productId}`, {
      state: { productId },
    });
  };

  const handleAjouterProduit = () => {
    navigate(`/leads/${id}/ajouter-produit`);
  };

  const handlePrixVenteChange = (value, productId) => {
    setProduits((prevProduits) =>
      prevProduits.map((product) => {
        // Store the initial price if it's not stored yet
        const original = product._originalPrixVente ?? product.total;

        return product._id === productId
          ? {
              ...product,
              total: parseFloat(value),
              _originalPrixVente: original, // Save original on first edit
              marge: parseFloat(value) - parseFloat(original),
            }
          : product;
      })
    );
  };

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = token ? jwtDecode(token) : null;

      const userId = decodedToken?.userId || decodedToken?.commercialId;

      if (!product || !product._id) {
        throw new Error("Product is invalid");
      }

      const marge = product.marge;
      const total = product.total;

      // Check if marge is NaN
      if (isNaN(marge)) {
        message.error("La marge doit être un nombre valide (ou bien être 0$)");
        return; // Stop the function if marge is NaN
      }

      // 1. First check both localStorage AND make a quick API check
      const currentCart = JSON.parse(localStorage.getItem("panierItems")) || [];

      // Also check with the backend for most accurate data
      // const backendCart = await axios.get("/panier");
      const res = await axios.get(`/panier/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allPanier = res.data;

      // const decodedToken = token ? jwtDecode(token) : null;
      const currentUserId = decodedToken?.userId;

      const filteredpanier = allPanier.filter(
        (panier) => panier.session === currentUserId
      );

      console.log("Backend cart data:", filteredpanier);

      const isAlreadyInCart =
        currentCart.some((item) => item.produit?._id === product._id) ||
        filteredpanier.some((item) => item.produit?._id === product._id);

      if (isAlreadyInCart) {
        message.warning("Produit déjà existant dans le panier");
        return;
      }

      // 2. Add to backend
      const response = await axios.post("/panier", {
        produitId: product._id,
        quantite: 1,
        leadId: id,
        marge,
        total,
        session: userId,
      });
      console.log("response,", response);

      // 3. Update all states immediately
      const updatedCart = [...currentCart, response.data];

      // Update localStorage
      localStorage.setItem("panierItems", JSON.stringify(updatedCart));

      // Calculate new quantity
      const newQuantity = updatedCart.reduce(
        (sum, item) => sum + (item.quantite || 0),
        0
      );
      localStorage.setItem("cartQuantity", newQuantity.toString());

      // 4. Force immediate UI updates
      if (onCartChange) {
        onCartChange(newQuantity);
      }

      // 5. Notify all components
      window.dispatchEvent(new Event("storage"));

      message.success("Produit ajouté au panier");
    } catch (error) {
      console.error("Error adding to panier:", error);
      message.error("Échec de l'ajout au panier");
    }
  };

  const columns = [
    {
      title: "Référence",
      dataIndex: "code",
      key: "code",
    },
    // {
    //   title: "Marque",
    //   dataIndex: "marque",
    //   key: "marque",
    // },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },

    {
      title: "Prix Vente",
      dataIndex: "total",
      key: "total",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handlePrixVenteChange(e.target.value, record._id)}
          style={{ width: 100 }}
          type="number"
        />
      ),
    },
    {
      title: "PRIX MINIMAL DE VENTE",
      dataIndex: "_originalPrixVente",
      key: "originalPrixVente",
      render: (text, record) => {
        const prix = record._originalPrixVente ?? record.total;
        const surface = record.surface;
        const taillePrixLabel = record.taillePrixLabel;

        return (
          <div>
            <div>{prix} €</div>
            {surface && (
              <div style={{ fontSize: 12, color: "#888" }}>
                {surface && <span>{surface}</span>}
              </div>
            )}
            {taillePrixLabel && (
              <div style={{ fontSize: 12, color: "#888" }}>
                {taillePrixLabel && <span>{taillePrixLabel}</span>}
              </div>
            )}
          </div>
        );
      },
    },

    // {
    //   title: "PRIX MINIMAL DE VENTE",
    //   dataIndex: "_originalPrixVente",
    //   key: "originalPrixVente",
    //   render: (text, record) => record._originalPrixVente ?? record.total, // fallback if not edited yet
    // },
    // {
    //   title: "Prix Achat",
    //   dataIndex: "coutAchat",
    //   key: "coutAchat",
    // },
    // {
    //   title: "Frais Gestion",
    //   dataIndex: "fraisGestion",
    //   key: "fraisGestion",
    // },
    // {
    //   title: "Marge",
    //   key: "marge",
    //   render: (_, record) => (
    //     <span>{(record.marge ?? -record.total).toFixed(2)} €</span>
    //   ),
    // },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Supprimer">
            <DeleteOutlined
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => handleDelete(record._id)} // Call handleDelete with product ID
            />
          </Tooltip>
          <Tooltip title="Ajouter au panier">
            <ShoppingCartOutlined
              style={{ color: "green", cursor: "pointer" }}
              onClick={() => handleAddToCart(record)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <EditOutlined
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => handleUpdate(record._id)} // Redirect to update page with product ID
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Table
        columns={[
          ...columns.map((col) => ({
            ...col,
            title: (
              <div className="flex flex-col items-center">
                <div className="text-xs">{col.title}</div>
              </div>
            ),
          })),
        ]}
        dataSource={produits} // Pass fetched products to the table
        pagination={false}
        rowKey="_id" // Use a unique key for each row (make sure _id is present in the fetched data)
      />
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button type="primary" onClick={handleAjouterProduit}>
          Ajouter un produit
        </Button>
      </div>
    </div>
  );
};

export default Produits;
