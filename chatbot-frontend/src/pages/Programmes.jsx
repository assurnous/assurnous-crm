import React, { useState, useEffect } from "react";
import axios from "axios";
import {message, Button } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, DollarOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const Programmes = () => {
  const [program, setProgram] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("/program");
        setProgram(response.data);
      } catch (error) {
        message.error("Failed to fetch programmes.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleCreateNewBanner = () => {
    navigate("/create-produit");
  };

  const handleDeleteBanner = async (programId) => {
    try {
      await axios.delete(`/program/${programId}`);
      const updatedBanners = program.filter((program) => program._id !== programId);
      setProgram(updatedBanners);
      message.success("Produit supprimé avec succès !");
    } catch (error) {
      message.error("Failed to delete Programme.");
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-purple-800 text-white"
          onClick={handleCreateNewBanner}
        >
          Ajouter produit
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Produits</h1>

      <div className="program-container">
  {program.map((pro) => (
    <div key={pro._id} className="program-card">
      <img
        src={pro.imageUrl}
        alt={pro.title}
        className="program-card-image"
      />
      <div className="program-card-content">
        <h2 className="program-title">{pro.title}</h2>
        <p className="program-description">{pro.mainText}</p>
        <p className="program-price flex items-center">
                <DollarOutlined className="mr-2" /> {/* Dollar icon */}
                <span className="font-bold">{pro.total}€</span> {/* Display total price in bold */}
              </p>
      </div>
      <div className="program-card-actions">
        <Link to={`/create-produit/${pro._id}`}>
          <Button icon={<EditOutlined />} type="primary" />
        </Link>
        <Button
          icon={<DeleteOutlined />}
          type="danger"
          onClick={() => handleDeleteBanner(pro._id)}
        />
      </div>
    </div>
  ))}
</div>

    </div>
  );
};

export default Programmes;




