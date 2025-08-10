import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Col, Row, message, Button } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons"; // Importing required icons
import { Link, useNavigate } from "react-router-dom";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("/banner"); // Replace with your API endpoint
        setBanners(response.data);
        console.log("Banners:", response.data);
      } catch (error) {
        message.error("Failed to fetch banners.");
        console.error(error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchBanners();
  }, []); // Empty dependency array means this will run only once when the component mounts

  const handleCreateNewBanner = () => {
    navigate("/create-bannières");
  };

  const handleToggleAdStatus = async (id, platform) => {
    try {
        const response = await axios.patch(
            `/banner/${id}/toggle-ad-status`,
            { platform }
        );
  console.log("Response:", response.data);
    } catch (error) {
        console.error("Error toggling ad status:", error);
        alert("Error toggling ad status.");
    }
};


  const handleDeleteBanner = async (bannerId) => {
    try {
      await axios.delete(`/banner/${bannerId}`); // Delete the banner by ID
      const updatedBanners = banners.filter(
        (banner) => banner._id !== bannerId
      ); // Remove the banner from the state
      setBanners(updatedBanners); // Update the UI
      message.success("Banner deleted successfully!");
    } catch (error) {
      message.error("Failed to delete banner.");
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
          Create nouveau Banner
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Bannières</h1>
      <div className="p-2">
        <Row gutter={[16, 16]}>
          {banners.map((banner) => (
            <Col span={8}  xs={64}
            sm={24} 
            md={12}  key={banner._id}>
              <Card
                hoverable
                cover={
                  <img
                    alt="Banner Image"
                    src={banner.imageUrl}
                    className="banner-image"
                  />
                }
              >
                <Card.Meta title={banner.title} description={banner.mainText} className="text-md font-semibold" />

                {/* Bottom buttons */}
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    type={banner.isActive ? "primary" : "default"}
                    onClick={() => {
                      console.log("Banner ID:", banner._id);  // Check if banner._id exists
                      console.log("Platform:", banner.platform);  // Check if banner.platform exists
                      handleToggleAdStatus(banner._id, banner.platform); // Pass banner.platform
                    }}
                  >
                    {banner.isActive ? "Deactivate" : "Activate"}
                  </Button>

                  <div className="flex space-x-2">
                    <Link to={`/create-bannières/${banner._id}`}>
                      <Button icon={<EditOutlined />} type="link" />
                    </Link>

                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteBanner(banner._id)}
                      type="danger"
                      className="text-red-500"
                    />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Banner;
