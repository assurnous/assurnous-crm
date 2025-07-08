import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Col, Row, message, Button } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const Publicités = () => {
  const [pub, setPub] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePubId, setActivePubId] = useState(null);
  const navigate = useNavigate();


useEffect(() => {
  const fetchAds = async () => {
    try {
      const response = await axios.get("http://localhost:3000/pub");
      console.log("ads:", response.data);
      setPubs(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false once data is fetched
    }
  };

  fetchAds();  
}, [activePubId]);

  useEffect(() => {
        const fetchPub = async () => {
      try {
        const response = await axios.get("/pub"); // Replace with your API endpoint
        setPub(response.data);
        console.log("pubs:", response.data);
      } catch (error) {
        message.error("Failed to fetch pubs.");
        console.error(error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchPub();
  }, []);

  const handleCreateNewBanner = () => {
    navigate("/create-publicité");
  };

  const handleActivatePub = async (pubId) => {
    if (activePubId) {
      message.warning("You must deactivate the current active publicité before activating a new one.");
      return;
    }

    try {
      const response = await axios.get("/pub");
      const allPubs = response.data;
      const selectedPub = allPubs.find((pub) => pub._id === pubId);

      if (!selectedPub) {
        message.warning("You must deactivate the current active publicité before activating a new one.");
        return;
      }

      // Activate the selected ad
      await axios.post("http://localhost:3000/pub", selectedPub);

      setActivePubId(pubId); // Set the active publicité ID
      message.success("Publicité activated successfully!");
    } catch (error) {
      message.warning("You must deactivate the current active publicité before activating a new one.");
      console.error(error);
    }
  };

  const handleDeactivatePub = async (pubId) => {
    try {
      const selectedPub = pubs.find((p) => p._id === pubId);
      if (!selectedPub) {
        message.error("Publicité not found.");
        return;
      }

      // Deactivate the publicité on the server
      await axios.delete(`http://localhost:3000/pub/${pubId}`);

      // Update state
      setPubs((prevPubs) => prevPubs.filter((p) => p._id !== pubId));

      // Reset activePubId
      setActivePubId(null);

      message.success("Publicité deactivated successfully!");
    } catch (error) {
      message.error("Failed to deactivate publicité.");
      console.error(error);
    }
  };

 
  const handleDeleteBanner = async (pubId) => {
    if (pubId === activePubId) {
      message.warning("You must deactivate the active publicité before deleting it.");
      return;
    }
  
    try {
      await axios.delete(`/pub/${pubId}`);
      const updatedBanners = pub.filter((pub) => pub._id !== pubId);
      setPub(updatedBanners);
      message.success("Pub deleted successfully!");
    } catch (error) {
      message.error("Failed to delete pub.");
      console.error(error);
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-2">
      <div className="mb-4">
        <Button
          type="primary"
          className="bg-purple-800 text-white"
          icon={<PlusOutlined />}
          onClick={handleCreateNewBanner}
        >
          Create nouveau Publicité
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Publicités</h1>
      <div className="p-2">
        <Row gutter={[16, 16]}>
          {pub.map((p) => (
            <Col span={8} xs={64} sm={24} md={12} key={p._id}>
              <Card
                hoverable
                cover={<img alt="Banner Image" src={p.imageUrl} className="banner-image" />}
              >
                <Card.Meta
                  title={p.title}
                  description={p.mainText}
                  className="text-md font-semibold"
                />
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    onClick={() => handleActivatePub(p._id)}
                    disabled={activePubId !== null}
                  >
                    Activer
                  </Button>

                  <div className="flex space-x-2">
                    <Link to={`/create-publicité/${p._id}`}>
                      <Button icon={<EditOutlined />} type="link" />
                    </Link>

                    <Button
  icon={<DeleteOutlined />}
  onClick={() => handleDeleteBanner(p._id)}
  type="danger"
  className="text-red-500"
  disabled={p._id === activePubId}
/>

                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="p-2 mt-8">
        <h2 className="text-xl font-semibold mb-4">Publicités Actives</h2>
        <Row gutter={[16, 16]}>
          {pubs.map((p) => (
            <Col span={8} xs={64} sm={24} md={12} key={p._id}>
              <Card
                hoverable
                cover={<img alt="Banner Image" src={p.imageUrl} />}
              >
                <Card.Meta title={p.title} description={p.mainText} />
                <div className="mt-4">
                  <Button
                    onClick={() => handleDeactivatePub(p._id)}
                    className="bg-red-500"
                  >
                    Désactiver
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Publicités;
