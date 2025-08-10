import React, { useState } from "react";
import { Upload } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

const Bannières = () => {
  const [bannerImage, setBannerImage] = useState(null);

  const handleImageChange = (info) => {
    if (info.fileList.length > 0) {
      setBannerImage(info.fileList[0].thumbUrl); // Use the image preview URL
    } else {
      setBannerImage(null); // Reset the image if none is uploaded
    }
  };

  const customRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bannières</h1>
      
      <form className="space-y-4 p-4 bg-white  rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)]">
      <p className="text-lg font-semibold mb-4">Création d'une bannière</p>
        <div>
        <div>
          <label htmlFor="bannerImage" className="block text-sm font-medium mb-2 text-gray-700">
            Image de la bannière
          </label>
          <Upload
            customRequest={customRequest}
            listType="picture-card"
            onChange={handleImageChange}
            showUploadList={false}
            accept="image/*"
          >
            {bannerImage ? (
              <img src={bannerImage} alt="banner" className="w-32 h-32 object-cover rounded-md" />
            ) : (
              <div className="w-full">
                <UploadOutlined />
                <div>Upload</div>
              </div>
            )}
          </Upload>
        </div>
          <label htmlFor="title" className="block mt-2 text-sm font-medium text-gray-700">
            Titre de la bannière
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter title"
          />
        </div>

        {/* Main Text */}
        <div>
          <label htmlFor="mainText" className="block text-sm font-medium text-gray-700">
            Texte principal
          </label>
          <textarea
            id="mainText"
            name="mainText"
            rows="4"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter main text"
          />
        </div>

        {/* Web Link */}
        <div>
          <label htmlFor="webLink" className="block text-sm font-medium text-gray-700">
            Lien Web
          </label>
          <input
            type="url"
            id="webLink"
            name="webLink"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter web link"
          />
        </div>

        {/* Conversation Position */}
        <div>
          <label htmlFor="conversationPosition" className="block text-sm font-medium text-gray-700">
            Position de la conversation
          </label>
          <select
            id="conversationPosition"
            name="conversationPosition"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        {/* Visitor Target */}
        <div>
          <label htmlFor="visitorTarget" className="block text-sm font-medium text-gray-700">
            Cible visiteur
          </label>
          <select
            id="visitorTarget"
            name="visitorTarget"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All</option>
            <option value="students">Students</option>
            <option value="consultants">Parent</option>
            <option value="consultants">Employeur</option>

          </select>
        </div>

        {/* Campus Target */}
        <div>
          <label htmlFor="campusTarget" className="block text-sm font-medium text-gray-700">
            Cible campus
          </label>
          <select
            id="campusTarget"
            name="campusTarget"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All</option>
            <option value="mainCampus">Main Campus</option>
            <option value="branchCampus">Branch Campus</option>
          </select>
        </div>

        {/* Activity Period */}
        <div>
          <label htmlFor="activityPeriod" className="block text-sm font-medium text-gray-700">
            Période d'activité
          </label>
          <input
            type="datetime-local"
            id="activityPeriod"
            name="activityPeriod"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Banner Image Upload */}
        

        {/* Submit Button */}
        <div className="mt-4">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Bannières;
