import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Tooltip } from "antd";
import axios from "axios";
import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Panier = ({ setCartQuantity, refreshTrigger }) => {
  const { id } = useParams();
  const [panierItems, setPanierItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cartFromStorage =
      JSON.parse(localStorage.getItem("panierItems")) || [];
    setPanierItems(cartFromStorage);
    updateCartQuantity(cartFromStorage);
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchCartData = async () => {
      
      const token = localStorage.getItem("token");
      if (!token) return;
 
      try {
        // Always get fresh data from backend first
        const response = await axios.get(`/panier/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const allPanier = response.data;
        console.log('allPanier', allPanier)

        const decodedToken = token ? jwtDecode(token) : null;
        const currentUserId = decodedToken?.userId;
      
        const filteredpanier = allPanier.filter(
          (panier) => panier.session === currentUserId
        );
        setPanierItems(filteredpanier);

        // Calculate and update quantity
        const totalQuantity = filteredpanier.reduce(
          (acc, item) => acc + item.quantite,
          0
        );
        setCartQuantity(totalQuantity);

        // Sync with localStorage
        localStorage.setItem("panierItems", JSON.stringify(filteredpanier));
        localStorage.setItem("cartQuantity", totalQuantity.toString());
      } catch (error) {
        // Fallback to localStorage if API fails
        const localCart = JSON.parse(localStorage.getItem("panierItems")) || [];
        setPanierItems(localCart);
        const localQuantity = localCart.reduce(
          (sum, item) => sum + (item.quantite || 0),
          0
        );
        setCartQuantity(localQuantity);
      }
    };

    fetchCartData();
  }, [refreshTrigger, setCartQuantity]);

  // Update cart quantity
  const updateCartQuantity = (items) => {
    const totalQuantity = items.reduce((acc, item) => acc + item.quantite, 0);
    setCartQuantity(totalQuantity); // Update the quantity in the parent component
  };

  const handleQuantityChange = async (panierId, newQuantity) => {
    const token = localStorage.getItem("token");
    try {
      // 1. Update backend
      const response = await axios.put(`/panier/${panierId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        quantite: newQuantity,
      });
  
      // 2. Update local state
      const updatedItems = panierItems.map((item) => {
        if (item._id === panierId) {
          const unitPrice = item.prixVenteUnit || item.total; // fallback
          return {
            ...item,
            quantite: newQuantity,
            total: unitPrice,
            montantHT: unitPrice * newQuantity,
            montantTTC: unitPrice * newQuantity * 1.1,
            montantTVA: unitPrice * newQuantity * 0.1,
            marge: (item.margeUnit || item.marge / item.quantite) * newQuantity,
          };
        }
        return item;
      });
  
      const filteredItems = updatedItems.filter((item) => item.quantite > 0);
  
      setPanierItems(filteredItems);
  
      // 3. Update totals
      const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantite, 0);
  
      setCartQuantity(totalQuantity);
      localStorage.setItem("panierItems", JSON.stringify(filteredItems));
      localStorage.setItem("cartQuantity", totalQuantity.toString());
  
      window.dispatchEvent(new Event("storage"));
      message.success("Quantité mise à jour");
    } catch (error) {
      console.error("Error updating quantity:", error);
      message.error("Failed to update quantity");
  
      const localCart = JSON.parse(localStorage.getItem("panierItems")) || [];
      setPanierItems(localCart);
      setCartQuantity(localCart.reduce((sum, item) => sum + item.quantite, 0));
    }
  };
  


  const handleRemoveFromCart = async (panierId) => {
    try {
      // 1. Delete from backend
      await axios.delete(`/panier/${panierId}`);

      // 2. Update local state
      const updatedItems = panierItems.filter((item) => item._id !== panierId);
      setPanierItems(updatedItems);

      // 3. Calculate new quantity
      const totalQuantity = updatedItems.reduce(
        (sum, item) => sum + item.quantite,
        0
      );

      // 4. Update all states and storage
      setCartQuantity(totalQuantity);
      localStorage.setItem("panierItems", JSON.stringify(updatedItems));
      localStorage.setItem("cartQuantity", totalQuantity.toString());

      // 5. Notify other tabs
      window.dispatchEvent(new Event("storage"));

      message.success("Produit supprimé du panier");
    } catch (error) {
      console.error("Error removing product:", error);
      message.error("Failed to remove product.");

      // Optional: Revert to previous state
      const localCart = JSON.parse(localStorage.getItem("panierItems")) || [];
      setPanierItems(localCart);
      setCartQuantity(localCart.reduce((sum, item) => sum + item.quantite, 0));
    }
  };


  // Calculate the total amount (HT, TVA, TTC)
  const calculateTotals = () => {
    const totalHT = panierItems.reduce((acc, item) => acc + item.montantHT, 0);
    const totalTVA = totalHT * 0.1; // 10% TVA
    const totalTTC = totalHT + totalTVA;
    return { totalHT, totalTVA, totalTTC };
  };

  const { totalHT, totalTVA, totalTTC } = calculateTotals();

  const handlePasserLaCommande = () => {
    navigate(`/leads/${id}/create-command`);
  };

  const columns = [
    {
      title: "Référence",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Quantité",
      key: "quantite",
      render: (_, record) => (
        <Space>
          <Button
            icon={<MinusCircleOutlined />}
            onClick={async () => {
              try {
                const newQuantity = record.quantite - 1;
                await handleQuantityChange(record._id, newQuantity);
              } catch (error) {
                console.error("Decrease quantity error:", error);
              }
            }}
            disabled={record.quantite <= 1}
          />
          {record.quantite}
          <Button
            icon={<PlusCircleOutlined />}
            onClick={async () => {
              try {
                const newQuantity = record.quantite + 1;
                await handleQuantityChange(record._id, newQuantity);
              } catch (error) {
                console.error("Increase quantity error:", error);
              }
            }}
          />
        </Space>
      ),
    },
    {
      title: "Montant HT",
      dataIndex: "montantHT",
      key: "montantHT",
    },
    {
      title: "TVA",
      dataIndex: "montantTVA",
      key: "montantTVA",
    },
    // {
    //   title: "Marge",
    //   key: "marge",
    //   render: (_, record) => (
    //     <span>{(record.marge ?? -record.total).toFixed(2)} €</span>
    //   ),
    // },
    {
      title: "Montant TTC",
      dataIndex: "montantTTC",
      key: "montantTTC",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Tooltip title="Supprimer">
          <DeleteOutlined
            style={{ color: "red", cursor: "pointer" }}
            onClick={() => handleRemoveFromCart(record._id)} // Remove product from the cart
          />
        </Tooltip>
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
        dataSource={panierItems}
        pagination={false}
        // rowKey={(record) => record.produit._id}
        rowKey={(record) => record._id || record.produit?._id || Math.random()}
      />

      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <h3>Total HT: {totalHT.toFixed(2)} €</h3>
        <h3>Total TVA (10%): {totalTVA.toFixed(2)} €</h3>
        <h3>Total TTC: {totalTTC.toFixed(2)} €</h3>
        <div className="mt-4">
          <Button
            type="primary"
            style={{
              marginLeft: "10px",
              backgroundColor: "green",
              borderColor: "green",
            }}
            onClick={handlePasserLaCommande}
          >
            Passer la commande
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Panier;
